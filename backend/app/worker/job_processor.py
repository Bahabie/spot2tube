import asyncio
import logging

from app.db.pgmq import delete_message, read_message
from app.db.supabase import get_supabase_client
from app.worker.task_handlers import process_playlist_sync_job

logger = logging.getLogger(__name__)

QUEUE_NAME = "spot2tube_jobs"
supabase = get_supabase_client()


async def poll_queue():
    """Continuously polls PGMQ for new sync jobs."""
    logger.info("Starting worker. Polling queue: %s", QUEUE_NAME)

    while True:
        msg_id = None
        job_id = None
        try:
            # Read message, hide it for 300 seconds (5 mins visibility timeout)
            msg = read_message(QUEUE_NAME, vt=300)

            if not msg:
                await asyncio.sleep(2)  # Idle wait
                continue

            msg_id = msg.get("msg_id")
            payload = msg.get("message", {})

            # PGMQ sometimes returns JSONB as a Python string (double-encoded).
            if isinstance(payload, str):
                import json

                try:
                    payload = json.loads(payload)
                except json.JSONDecodeError:
                    payload = {}

            job_id = payload.get("job_id")

            if not job_id:
                logger.warning("Message %s missing job_id. Deleting.", msg_id)
                delete_message(QUEUE_NAME, msg_id)
                continue

            logger.info("Picked up job %s (msg_id %s)", job_id, msg_id)

            # Mark job as PROCESSING in DB
            supabase.table("sync_jobs").update({"status": "PROCESSING"}).eq(
                "id", job_id
            ).execute()

            # Execute sync — raises on catastrophic failure.
            process_playlist_sync_job(payload)

            logger.info("Job %s completed successfully.", job_id)
            supabase.table("sync_jobs").update({"status": "COMPLETED"}).eq(
                "id", job_id
            ).execute()
            delete_message(QUEUE_NAME, msg_id)

        except Exception as e:
            error_msg = f"{type(e).__name__}: {e}"
            logger.critical("Job %s failed: %s", job_id, error_msg, exc_info=True)

            # Always mark the job as FAILED so the UI reflects reality.
            if job_id:
                try:
                    supabase.table("sync_jobs").update(
                        {
                            "status": "FAILED",
                            "error_message": error_msg[:500],
                        }
                    ).eq("id", job_id).execute()
                except Exception as db_err:  # noqa: BLE001
                    logger.error(
                        "Could not update job %s to FAILED: %s", job_id, db_err
                    )

            # Delete the message so PGMQ doesn't keep redelivering a broken job.
            if msg_id:
                try:
                    delete_message(QUEUE_NAME, msg_id)
                except Exception as del_err:  # noqa: BLE001
                    logger.error("Could not delete msg %s: %s", msg_id, del_err)

            # Brief pause before continuing the poll loop.
            await asyncio.sleep(5)


if __name__ == "__main__":
    asyncio.run(poll_queue())
