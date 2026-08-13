"""API routes for playlist synchronization operations."""

import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.dependencies import get_current_user
from app.db.supabase import get_supabase_client

logger = logging.getLogger(__name__)


def _rate_limit_key(request: Request) -> str:
    """Extract user_id from the validated JWT for per-user rate limiting.

    Falls back to IP address for unauthenticated requests
    (which will be rejected by get_current_user anyway).
    """
    if hasattr(request.state, "current_user_id"):
        return request.state.current_user_id
    return get_remote_address(request)


limiter = Limiter(key_func=_rate_limit_key)

router = APIRouter(tags=["Sync Operations"])


class SyncJobRequest(BaseModel):
    """Inbound request to start a Spotify → YouTube Music sync."""

    spotify_playlist_id: str
    target_playlist_name: str | None = None
    yt_search_algo: int = 0
    privacy_status: str = "PRIVATE"
    reverse_playlist: bool = True
    user_id: str


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
@limiter.limit("5/hour")
async def start_sync_job(
    request: Request,
    payload: SyncJobRequest,
    current_user_id: str = Depends(get_current_user),
) -> SyncJobResponse:
    """Accept a sync request, create a sync_jobs record, and queue it via PGMQ.

    Enforces IDOR protection: the payload user_id must match the JWT identity.
    Rate-limited to 5 requests per hour per authenticated user.
    """
    # Store user_id on request.state for the rate limiter key function.
    request.state.current_user_id = current_user_id

    # IDOR check: reject if payload user_id doesn't match the JWT identity.
    if payload.user_id != current_user_id:
        logger.warning(
            "IDOR attempt: JWT user=%s tried to act as user=%s",
            current_user_id,
            payload.user_id,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to perform actions for this user.",
        )

    supabase = get_supabase_client()

    response = (
        supabase.table("sync_jobs")
        .insert(
            {
                "user_id": current_user_id,
                "spotify_playlist_id": payload.spotify_playlist_id,
                "status": "PENDING",
                "progress_percentage": 0,
            }
        )
        .execute()
    )

    if not response.data:
        raise RuntimeError("Failed to create sync_job record in database")

    job_id = response.data[0]["id"]

    job_payload = {
        "job_id": job_id,
        "user_id": current_user_id,
        "spotify_playlist_id": payload.spotify_playlist_id,
        "target_playlist_name": payload.target_playlist_name,
        "yt_search_algo": payload.yt_search_algo,
        "privacy_status": payload.privacy_status,
        "reverse_playlist": payload.reverse_playlist,
    }

    try:
        supabase.rpc(
            "pgmq_send",
            {"queue_name": "spot2tube_jobs", "message": json.dumps(job_payload)},
        ).execute()
    except Exception as e:
        logger.error(f"Failed to enqueue job {job_id} to PGMQ: {e}")
        supabase.table("sync_jobs").update(
            {"status": "FAILED", "error_message": "Failed to enqueue job"}
        ).eq("id", job_id).execute()
        raise

    logger.info(
        "Sync job queued: job_id=%s, playlist=%s", job_id, payload.spotify_playlist_id
    )

    return SyncJobResponse(
        job_id=job_id,
        status="queued",
        message=f"Sync job {job_id} accepted and queued for processing.",
    )


@router.get("/sync/jobs")
async def get_sync_jobs(
    job_ids: str,
    current_user_id: str = Depends(get_current_user),
):
    """Fetch job progress for the authenticated user.

    The user_id is derived from the JWT — callers cannot override it.
    """
    supabase = get_supabase_client()
    ids_list = [jid.strip() for jid in job_ids.split(",") if jid.strip()]

    if not ids_list:
        return []

    response = (
        supabase.table("sync_jobs")
        .select("id, status, processed_tracks, failed_tracks, total_tracks")
        .in_("id", ids_list)
        .eq("user_id", current_user_id)
        .execute()
    )

    return response.data or []
