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
from typing import Any

from app.db.pgmq import update_job_status
from app.services.auth_service import get_valid_token
from app.services.spotify_api import fetch_playlist_tracks
from app.services.youtube_client import QuotaExceededError, YouTubeClientService

logger = logging.getLogger(__name__)


async def process_playlist_sync_job(job_payload: dict[str, Any]) -> None:
    """Execute a full Spotify → YouTube Music playlist migration asynchronously.

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
    spotify_playlist_id: str = job_payload.get("spotify_playlist_id", "")
    youtube_playlist_id: str = job_payload.get("youtube_playlist_id", "")
    sync_direction: str = job_payload.get("sync_direction", "spotify_to_youtube")
    target_playlist_name: str = job_payload.get(
        "target_playlist_name", "Spot2Tube Migrated Playlist"
    )
    yt_search_algo: int = job_payload.get("yt_search_algo", 0)
    privacy_status: str = job_payload.get("privacy_status", "PRIVATE")
    reverse_playlist: bool = job_payload.get("reverse_playlist", True)

    logger.info(
        "Job %s: Starting playlist sync for user %s "
        "(direction=%s, algo=%d, privacy=%s)",
        job_id,
        user_id,
        sync_direction,
        yt_search_algo,
        privacy_status,
    )

    try:
        # ---- Step 2: Credential retrieval ----------------------------
        spotify_token: str | None = await get_valid_token(user_id, "spotify")
        if not spotify_token:
            raise RuntimeError(
                f"Job {job_id}: No valid Spotify token for user {user_id}"
            )

        google_token: str | None = await get_valid_token(user_id, "google")
        if not google_token:
            raise RuntimeError(
                f"Job {job_id}: No valid Google (YouTube Music) token for user {user_id}. "
                "Please reconnect your Google account via the dashboard."
            )

        yt_service = YouTubeClientService(google_access_token=google_token)

        if sync_direction == "youtube_to_spotify":
            await _process_youtube_to_spotify(
                job_id, user_id, youtube_playlist_id, target_playlist_name, privacy_status, reverse_playlist, yt_service, spotify_token
            )
            return

        # ---- Step 3: Fetch Spotify tracks ----------------------------
        raw_tracks: list[dict[str, Any]] = await fetch_playlist_tracks(
            spotify_token, spotify_playlist_id
        )
        logger.info("Job %s: Fetched %d tracks from Spotify", job_id, len(raw_tracks))

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
        # Offload synchronous ytmusicapi creation to a thread pool executor
        target_yt_playlist_id: str = await asyncio.to_thread(
            yt_service.create_playlist_with_backoff,
            title=target_playlist_name,
            description="Successfully migrated from Spotify via Spot2Tube Sync.",
            privacy_status=privacy_status,
        )
        logger.info(
            "Job %s: Created YouTube playlist %s",
            job_id,
            target_yt_playlist_id,
        )

        # Update initial total tracks in the database
        try:
            await update_job_status(
                job_id,
                "PROCESSING",
                {
                    "total_tracks": len(source_tracks),
                    "youtube_playlist_id": target_yt_playlist_id,
                },
            )
        except Exception as db_err:  # noqa: BLE001
            logger.warning("Job %s: Failed to update total_tracks: %s", job_id, db_err)

        # ---- Step 5: Data migration loop -----------------------------
        tracks_added_set: set[str] = set()
        error_count: int = 0
        duplicate_count: int = 0
        inserted_count: int = 0
        total_tracks: int = len(source_tracks)

        for idx, (track_name, artist, album) in enumerate(source_tracks, 1):
            try:
                # Offload synchronous lookup to thread
                match: dict[str, Any] = await asyncio.to_thread(
                    yt_service.lookup_song_algorithmically,
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

                # Offload insertion to thread
                await asyncio.to_thread(
                    yt_service.add_track_with_backoff,
                    playlist_id=target_yt_playlist_id,
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

                # Async sleep allows other jobs to process concurrently without blocking
                await asyncio.sleep(2)

            except QuotaExceededError:
                # Quota errors are catastrophic and must halt the job immediately
                raise
            except (ValueError, RuntimeError) as track_err:
                error_count += 1
                logger.warning(
                    "Job %s: Track-level error for '%s' by '%s': %s",
                    job_id,
                    track_name,
                    artist,
                    track_err,
                )

            # Update DB every 5 tracks for real-time UI (or on errors)
            if idx % 5 == 0 or idx == total_tracks:
                try:
                    progress_pct = (
                        int(
                            (
                                (inserted_count + duplicate_count + error_count)
                                / total_tracks
                            )
                            * 100
                        )
                        if total_tracks > 0
                        else 0
                    )
                    await update_job_status(
                        job_id,
                        "PROCESSING",
                        {
                            "processed_tracks": inserted_count + duplicate_count,
                            "failed_tracks": error_count,
                            "progress_percentage": progress_pct,
                        },
                    )
                except Exception as db_err:  # noqa: BLE001
                    logger.warning(
                        "Job %s: Failed to update progress: %s", job_id, db_err
                    )

        # ---- Step 6: Finalization ------------------------------------
        logger.info(
            "Job %s: Sync complete — inserted=%d, errors=%d, duplicates=%d, total=%d",
            job_id,
            inserted_count,
            error_count,
            duplicate_count,
            total_tracks,
        )

    except Exception as catastrophic_failure:
        error_str = f"{type(catastrophic_failure).__name__}: {catastrophic_failure}"
        logger.critical(
            "Job %s: Catastrophic failure — %s.",
            job_id,
            error_str,
            exc_info=True,
        )
        # Save error to DB before re-raising (job_processor will mark FAILED)
        try:
            await update_job_status(
                job_id, "FAILED", {"error_message": error_str[:500]}
            )
        except Exception:  # noqa: BLE001
            logger.debug("Job %s: Could not persist error_message to DB", job_id)
        raise

async def _process_youtube_to_spotify(
    job_id: str, 
    user_id: str, 
    youtube_playlist_id: str, 
    target_playlist_name: str, 
    privacy_status: str, 
    reverse_playlist: bool, 
    yt_service: YouTubeClientService, 
    spotify_token: str
) -> None:
    from app.services.spotify_api import (
        add_tracks_to_playlist,
        create_playlist,
        search_track,
    )
    
    # 1. Fetch from YouTube
    raw_tracks = await asyncio.to_thread(yt_service.get_playlist_tracks, youtube_playlist_id)
    
    if reverse_playlist:
        raw_tracks.reverse()
        
    # 2. Create Spotify Playlist
    is_public = privacy_status.upper() == "PUBLIC"
    target_spotify_playlist_id = await create_playlist(
        spotify_token, user_id, target_playlist_name, "Successfully migrated from YouTube Music via Spot2Tube Sync.", is_public
    )
    
    try:
        await update_job_status(
            job_id,
            "PROCESSING",
            {
                "total_tracks": len(raw_tracks),
                "spotify_playlist_id": target_spotify_playlist_id,
            },
        )
    except Exception as db_err:  # noqa: BLE001
        logger.warning("Job %s: Failed to update total_tracks: %s", job_id, db_err)
        
    # 3. Match and Add
    tracks_added_set = set()
    error_count = 0
    duplicate_count = 0
    inserted_count = 0
    total_tracks = len(raw_tracks)
    
    track_uris_to_add = []
    
    for idx, track in enumerate(raw_tracks, 1):
        try:
            track_name = track["name"]
            artist = track["artist"]
            
            uri = await search_track(spotify_token, track_name, artist)
            if not uri:
                raise ValueError(f"No match found on Spotify for {track_name} by {artist}")
                
            if uri in tracks_added_set:
                duplicate_count += 1
                continue
                
            tracks_added_set.add(uri)
            track_uris_to_add.append(uri)
            inserted_count += 1
            
        except Exception as e:  # noqa: BLE001
            error_count += 1
            logger.warning("Job %s: Track error %s", job_id, e)
            
        if idx % 5 == 0 or idx == total_tracks:
            # Batch insert to spotify
            if track_uris_to_add:
                try:
                    await add_tracks_to_playlist(spotify_token, target_spotify_playlist_id, track_uris_to_add)
                    track_uris_to_add = [] # Clear after insert
                except Exception as e:  # noqa: BLE001
                    logger.error("Job %s: Failed to add batch to Spotify: %s", job_id, e)
                    # If batch fails, we consider them errors
                    error_count += len(track_uris_to_add)
                    inserted_count -= len(track_uris_to_add)
                    track_uris_to_add = []
                    
            try:
                progress_pct = int(((inserted_count + duplicate_count + error_count) / total_tracks) * 100) if total_tracks > 0 else 0
                await update_job_status(
                    job_id,
                    "PROCESSING",
                    {
                        "processed_tracks": inserted_count + duplicate_count,
                        "failed_tracks": error_count,
                        "progress_percentage": progress_pct,
                    },
                )
            except Exception as db_err:  # noqa: BLE001
                logger.warning("Job %s: Failed to update progress: %s", job_id, db_err)
                
    # Final flush
    if track_uris_to_add:
        try:
            await add_tracks_to_playlist(spotify_token, target_spotify_playlist_id, track_uris_to_add)
        except Exception as e:  # noqa: BLE001
            logger.error("Job %s: Failed to add final batch to Spotify: %s", job_id, e)
            error_count += len(track_uris_to_add)
            inserted_count -= len(track_uris_to_add)
            
    logger.info("Job %s: YT->Spot Sync complete — inserted=%d, errors=%d", job_id, inserted_count, error_count)
