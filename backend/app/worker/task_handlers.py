"""PGMQ task handler for playlist sync jobs.

Processes playlist migration jobs pulled from the Postgres Message Queue.
This module runs in a separate process from Uvicorn — it must NOT import
any FastAPI routers or web-bound dependencies.

Exception hierarchy:
  - Track-level errors (ValueError, RuntimeError) are caught per-track
    so the migration loop continues through partial failures.
  - Catastrophic errors (DB loss, total API block) propagate to the
    caller so PGMQ's visibility timeout can requeue the message.
"""

import asyncio
import logging
import time
from typing import Any

from app.services.auth_service import get_valid_token
from app.services.spotify_api import fetch_playlist_tracks
from app.services.youtube_client import YouTubeClientService

logger = logging.getLogger(__name__)


def _run_async(coro: Any) -> Any:
    """Run an async coroutine from synchronous worker context."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        # Already inside an event loop (e.g. asyncio.run in job_processor).
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    return asyncio.run(coro)


def process_playlist_sync_job(job_payload: dict[str, Any]) -> None:
    """Execute a full Spotify → YouTube Music playlist migration.

    Extracts job metadata from the PGMQ payload, creates a target
    playlist on YouTube Music, then iterates through each source track:
    matching, deduplicating, and inserting with an anti-bot buffer.

    Args:
        job_payload: PGMQ message body containing job_id, user_id,
                     spotify_playlist_id, and optional overrides for
                     target_playlist_name, yt_search_algo, and
                     privacy_status.

    Raises:
        Exception: Re-raised catastrophic failures so the PGMQ consumer
                   knows the job failed and the visibility timeout can
                   requeue the message for a later retry.
    """
    # ---- Step 1: Extraction ------------------------------------------
    job_id: str = job_payload["job_id"]
    user_id: str = job_payload["user_id"]
    spotify_playlist_id: str = job_payload["spotify_playlist_id"]
    target_playlist_name: str = job_payload.get(
        "target_playlist_name", "Spot2Tube Migrated Playlist"
    )
    yt_search_algo: int = job_payload.get("yt_search_algo", 0)
    privacy_status: str = job_payload.get("privacy_status", "PRIVATE")
    reverse_playlist: bool = job_payload.get("reverse_playlist", True)

    logger.info(
        "Job %s: Starting playlist sync for user %s "
        "(spotify_playlist=%s, algo=%d, privacy=%s)",
        job_id,
        user_id,
        spotify_playlist_id,
        yt_search_algo,
        privacy_status,
    )

    try:
        # ---- Step 2: Credential retrieval ----------------------------
        spotify_token: str | None = _run_async(
            get_valid_token(user_id, "spotify")
        )
        if not spotify_token:
            raise RuntimeError(
                f"Job {job_id}: No valid Spotify token for user {user_id}"
            )

        google_token: str | None = _run_async(
            get_valid_token(user_id, "google")
        )
        if not google_token:
            raise RuntimeError(
                f"Job {job_id}: No valid Google token for user {user_id}"
            )

        import json
        # ytmusicapi expects the headers as a JSON string
        yt_auth_headers: str = json.dumps({
            "Authorization": f"Bearer {google_token}",
            "User-Agent": "Spot2Tube-Sync/0.1"
        })
        yt_service = YouTubeClientService(auth_headers=yt_auth_headers)

        # ---- Step 3: Fetch Spotify tracks ----------------------------
        raw_tracks: list[dict[str, Any]] = _run_async(
            fetch_playlist_tracks(spotify_token, spotify_playlist_id)
        )
        logger.info(
            "Job %s: Fetched %d tracks from Spotify", job_id, len(raw_tracks)
        )

        # Convert to (name, artist, album) tuples for the migration loop.
        source_tracks: list[tuple[str, str, str]] = [
            (
                t.get("name", "Unknown"),
                t.get("artist", "Unknown"),
                t.get("album", "Unknown"),
            )
            for t in raw_tracks
            if t.get("name")
        ]

        if reverse_playlist:
            source_tracks.reverse()

        # ---- Step 4: Target playlist creation ------------------------
        youtube_playlist_id: str = yt_service.create_playlist_with_backoff(
            title=target_playlist_name,
            description=(
                "Successfully migrated from Spotify via Spot2Tube Sync."
            ),
            privacy_status=privacy_status,
        )
        logger.info(
            "Job %s: Created YouTube playlist %s",
            job_id,
            youtube_playlist_id,
        )

        # ---- Step 5: Data migration loop -----------------------------
        tracks_added_set: set[str] = set()
        error_count: int = 0
        duplicate_count: int = 0
        inserted_count: int = 0
        total_tracks: int = len(source_tracks)

        for idx, (track_name, artist, album) in enumerate(source_tracks, 1):
            try:
                match: dict = yt_service.lookup_song_algorithmically(
                    track_name=track_name,
                    artist_name=artist,
                    album_name=album,
                    yt_search_algo=yt_search_algo,
                )
                video_id: str = match["videoId"]

                # Deduplication gate
                if video_id in tracks_added_set:
                    duplicate_count += 1
                    logger.debug(
                        "Job %s: Duplicate videoId %s for '%s' — skipping",
                        job_id,
                        video_id,
                        track_name,
                    )
                    continue

                tracks_added_set.add(video_id)

                yt_service.add_track_with_backoff(
                    playlist_id=youtube_playlist_id,
                    video_id=video_id,
                )
                inserted_count += 1

                logger.info(
                    "Job %s: [%d/%d] Added '%s' by '%s'",
                    job_id,
                    idx,
                    total_tracks,
                    track_name,
                    artist,
                )

                # Anti-bot buffer — mandatory pause between insertions
                time.sleep(2)

            except (ValueError, RuntimeError) as track_err:
                error_count += 1
                logger.warning(
                    "Job %s: Track-level error for '%s' by '%s': %s",
                    job_id,
                    track_name,
                    artist,
                    track_err,
                )

        # ---- Step 6: Finalization ------------------------------------
        logger.info(
            "Job %s: Sync complete — "
            "inserted=%d, errors=%d, duplicates=%d, total=%d",
            job_id,
            inserted_count,
            error_count,
            duplicate_count,
            total_tracks,
        )

    except Exception as catastrophic_failure:
        logger.critical(
            "Job %s: Catastrophic failure — %s. "
            "Raising so PGMQ can requeue via visibility timeout.",
            job_id,
            catastrophic_failure,
        )
        raise

