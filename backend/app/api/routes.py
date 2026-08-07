"""API routes for playlist synchronization operations."""

import json
import logging
from uuid import uuid4

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.db.supabase import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Sync Operations"])


class SyncJobRequest(BaseModel):
    """Inbound request to start a Spotify → YouTube Music sync."""

    spotify_playlist_id: str
    target_playlist_name: str | None = None
    yt_search_algo: int = 0
    privacy_status: str = "PRIVATE"
    reverse_playlist: bool = True


class SyncJobResponse(BaseModel):
    """Acknowledgement returned when a sync job is accepted."""

    job_id: str
    status: str
    message: str


@router.post(
    "/sync/start",
    response_model=SyncJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def start_sync_job(request: SyncJobRequest) -> SyncJobResponse:
    """Accept a sync request, assign a job ID, and queue it via PGMQ."""
    job_id = str(uuid4())

    payload = {
        "job_id": job_id,
        "user_id": "pending_auth_wiring",
        "spotify_playlist_id": request.spotify_playlist_id,
        "target_playlist_name": request.target_playlist_name,
        "yt_search_algo": request.yt_search_algo,
        "privacy_status": request.privacy_status,
        "reverse_playlist": request.reverse_playlist,
    }

    supabase = get_supabase_client()
    supabase.rpc(
        "pgmq_send",
        {"queue_name": "spot2tube_jobs", "message": json.dumps(payload)},
    ).execute()

    logger.info(
        "Sync job queued: job_id=%s, playlist=%s", job_id, request.spotify_playlist_id
    )

    return SyncJobResponse(
        job_id=job_id,
        status="queued",
        message=f"Sync job {job_id} accepted and queued for processing.",
    )
