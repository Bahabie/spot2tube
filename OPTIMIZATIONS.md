# Optimization Audit Report: Spot2Tube Sync

## 1) Optimization Summary

* **Current Optimization Health**: The application is functionally sound but suffers from significant I/O and network bottlenecks in the background worker, and sub-optimal database polling on the frontend.
* **Top 3 Highest-Impact Improvements**:
  1. **HTTP Connection Reuse**: Reusing TCP connections in the YouTube API client to avoid thousands of TLS handshakes.
  2. **Batching DB Updates**: Reducing the frequency of progress updates to Supabase during the sync loop.
  3. **Supabase Realtime**: Replacing Next.js Server Action HTTP polling with WebSockets for job progress.
* **Biggest risk if no changes are made**: The backend worker will unnecessarily exhaust DB connections/I/O and CPU on large playlists, artificially inflating migration times and Next.js server compute costs.

---

## 2) Findings (Prioritized)

### Avoidable HTTP Connection Teardowns
* **Category**: Network / CPU
* **Severity**: Critical
* **Impact**: Decreases latency significantly, reduces CPU overhead for TLS handshakes.
* **Evidence**: `youtube_client.py` lines 92 and 299: `with httpx.Client() as client:` is instantiated *inside* the retry loop for every single track insertion and playlist creation.
* **Why it’s inefficient**: Creating a new `httpx.Client()` per request discards the underlying TCP connection pool. For a 1,000-track playlist, this forces the worker to perform 1,000+ DNS lookups, TCP handshakes, and TLS negotiations.
* **Recommended fix**: Initialize `self.client = httpx.Client(...)` in `__init__` and reuse it across the lifetime of the `YouTubeClientService`. Add a `close()` method or use a context manager to clean it up when the job is done.
* **Tradeoffs / Risks**: The client needs to be properly closed to avoid leaking sockets if the worker process persists indefinitely (though here it is recreated per job, which is fine).
* **Expected impact estimate**: ~20-50% reduction in API request latency per track.
* **Removal Safety**: Safe
* **Reuse Scope**: service-wide

### Excessive DB Writes in Sync Loop (N+1 Updates)
* **Category**: DB / I/O
* **Severity**: High
* **Impact**: Reduces DB load, improves job throughput.
* **Evidence**: `task_handlers.py:207-217` - `if idx % 1 == 0 or idx == total_tracks:` updates the `sync_jobs` row for every single inserted track.
* **Why it’s inefficient**: Writing to the database synchronously on every single track stalls the worker loop. For a 1,000-track playlist, this adds 1,000 synchronous HTTP requests to Supabase PostgREST.
* **Recommended fix**: Batch progress updates. Change the condition to `if idx % 10 == 0 or idx == total_tracks:` to reduce DB writes by 90%.
* **Tradeoffs / Risks**: The frontend progress bar will update in chunks (e.g. 10 tracks at a time) instead of smoothly, which is a highly acceptable UX tradeoff for 10x less DB load.
* **Expected impact estimate**: 90% reduction in DB update I/O per job.
* **Removal Safety**: Safe
* **Reuse Scope**: local file

### Frontend Polling vs Realtime WebSockets
* **Category**: Network / Frontend / Cost
* **Severity**: High
* **Impact**: Reduces Next.js API route invocations and Supabase REST calls. Lowers latency of progress updates.
* **Evidence**: `api.ts:62` `getJobsProgress` server action is invoked by the client via polling to get job progress.
* **Why it’s inefficient**: HTTP polling wastes Next.js server compute and bandwidth, especially if no progress was made. Since Supabase supports WebSockets (Realtime) natively, polling is an anti-pattern.
* **Recommended fix**: Remove the polling Server Action. In the frontend component, initialize a Supabase client using the anon key and subscribe to Postgres changes: `supabase.channel('sync_jobs').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sync_jobs', filter: 'id=eq.'+jobId }, ...)`
* **Tradeoffs / Risks**: Requires enabling Realtime replication for the `sync_jobs` table in the Supabase database.
* **Expected impact estimate**: Eliminates Next.js polling overhead entirely.
* **Removal Safety**: Needs Verification (ensure Supabase Realtime is enabled).
* **Reuse Scope**: service-wide

### Blocking I/O in Async Worker Loop
* **Category**: Concurrency
* **Severity**: Medium
* **Impact**: Worker throughput and architectural correctness.
* **Evidence**: `job_processor.py:22` `read_message(QUEUE_NAME, vt=300)` is called synchronously inside `async def poll_queue()`, and `process_playlist_sync_job(payload)` runs synchronously, blocking the asyncio event loop.
* **Why it’s inefficient**: The entire `asyncio` event loop is blocked by synchronous network requests (Supabase API, Spotify API, YouTube API). This prevents the worker from gracefully handling shutdown signals or running concurrent lightweight tasks.
* **Recommended fix**: Offload the sync job processing to a thread pool using `await asyncio.to_thread(process_playlist_sync_job, payload)`, and use the async Supabase client for reading messages. Alternatively, remove `asyncio` entirely and use a standard synchronous `while True` loop since all I/O is currently blocking.
* **Tradeoffs / Risks**: Minimal risk if only processing one job at a time, but fixes the architectural mismatch.
* **Expected impact estimate**: Minor for single-job processing, critical for future multi-job concurrency.
* **Removal Safety**: Safe
* **Reuse Scope**: local file

### Storing Entire Spotify Playlist in Memory
* **Category**: Memory
* **Severity**: Low / Medium
* **Impact**: Reduces peak memory usage for massive playlists.
* **Evidence**: `spotify_api.py:36` `tracks.append(...)` builds a list of dictionaries in memory.
* **Why it’s inefficient**: While acceptable for 100 tracks, a user with a 10,000 track playlist will consume a large amount of memory, and the worker can't start processing until the *entire* playlist is fetched.
* **Recommended fix**: If `reverse_playlist` is not strictly necessary, convert `fetch_playlist_tracks` into an async generator and process tracks as they are streamed. If reversal is required, only store the absolute minimum fields (name, artist, album) as tuples to save overhead.
* **Tradeoffs / Risks**: Requires refactoring the `task_handlers.py` loop to consume a generator.
* **Expected impact estimate**: Halves memory usage per job.
* **Removal Safety**: Needs Verification
* **Reuse Scope**: local file

---

## 3) Quick Wins (Do First)
1. **Reuse `httpx.Client()`**: Refactor `YouTubeClientService` to instantiate `self.client = httpx.Client()` in its constructor and use it for all requests to eliminate TLS handshake overhead.
2. **Batch DB Updates**: Change `idx % 1 == 0` to `idx % 10 == 0` in `task_handlers.py` line 207 to instantly drop DB load.
3. **Remove `asyncio` from Worker**: Since the worker relies heavily on blocking Supabase clients, simplify `job_processor.py` to a synchronous `while True` loop to prevent event loop blocking warnings.

---

## 4) Deeper Optimizations (Do Next)
* **Frontend Realtime**: Migrate away from HTTP polling to Supabase Realtime subscriptions. This requires DB migration changes (enabling replication on the table) and frontend rewrites but provides a much better UX.
* **Parallel Track Lookups**: The worker currently sleeps 2 seconds *after* every insertion. It could decouple the "lookup" (searching YT for the song) from the "insertion". Lookups could be done concurrently using a thread pool (e.g., 5 at a time), while insertions respect the 2-second rate limit using a queue.

---

## 5) Validation Plan

* **Benchmarks**: Measure the end-to-end time of migrating a 100-track playlist before and after reusing the `httpx.Client`. Expected reduction in total elapsed time: 10-20 seconds.
* **Profiling strategy**: Use `cProfile` on `job_processor.py` to measure time spent in socket creation (`socket.socket`) vs actual I/O.
* **Metrics to compare before/after**: Monitor `pg_stat_statements` or Supabase API logs to verify `UPDATE sync_jobs` query volume drops by 90% per job.
* **Test cases**: Ensure track deduplication and anti-bot buffer still operate correctly when batching DB updates.

---

## 6) Optimized Code / Patch

### Patch: HTTP Connection Reuse in YouTube Client (`youtube_client.py`)
```python
class YouTubeClientService:
    def __init__(self, google_access_token: str) -> None:
        self.access_token: str = google_access_token
        self.yt: YTMusic = YTMusic()
        self.api_base_url: str = "https://www.googleapis.com/youtube/v3"
        
        # [NEW] Reuse the HTTP client to pool connections
        self.client = httpx.Client(timeout=10.0)

    def close(self):
        """Close the HTTP client when done."""
        self.client.close()

    def add_track_with_backoff(self, playlist_id: str, video_id: str) -> None:
        # ...
        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                # [MODIFIED] Use the shared client
                response = self.client.post(
                    f"{self.api_base_url}/playlistItems",
                    headers=self._get_headers(),
                    params={"part": "snippet"},
                    json={...}
                )
                # ...
```
*(Ensure `yt_service.close()` is called in a `finally` block inside `process_playlist_sync_job`)*

### Patch: Batch DB Updates (`task_handlers.py`)
```python
            # [MODIFIED] Update DB every 10 tracks instead of every track
            if idx % 10 == 0 or idx == total_tracks:
                try:
                    progress_pct = int(((inserted_count + duplicate_count + error_count) / total_tracks) * 100) if total_tracks > 0 else 0
                    supabase.table("sync_jobs").update({
                        "processed_tracks": inserted_count + duplicate_count,
                        "failed_tracks": error_count,
                        "progress_percentage": progress_pct
                    }).eq("id", job_id).execute()
                except Exception as db_err:
                    logger.warning("Job %s: Failed to update progress: %s", job_id, db_err)
```
