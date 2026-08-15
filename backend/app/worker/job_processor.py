import asyncio
import logging
from typing import Any

from app.db.pgmq import delete_message, read_message, update_job_status
from app.db.pool import close_db_pool, init_db_pool
from app.worker.task_handlers import process_playlist_sync_job

logger = logging.getLogger(__name__)

QUEUE_NAME = "spot2tube_jobs"

# Aggressive but stable concurrency limit bound by the Semaphore
MAX_CONCURRENT_JOBS = 20


async def handle_job(msg: dict[str, Any], semaphore: asyncio.Semaphore) -> None:
    """Executes a single job within the bounded concurrency semaphore."""
    async with semaphore:
        msg_id = msg.get("msg_id")
        payload = msg.get("message", {})
        job_id = payload.get("job_id")

        if not job_id:
            logger.warning("Message %s missing job_id. Deleting.", msg_id)
            if msg_id:
                await delete_message(QUEUE_NAME, msg_id)
            return

        logger.info("Picked up job %s (msg_id %s)", job_id, msg_id)

        try:
            await update_job_status(job_id, "PROCESSING")

            # Execute sync — raises on catastrophic failure.
            await process_playlist_sync_job(payload)

            logger.info("Job %s completed successfully.", job_id)
            await update_job_status(job_id, "COMPLETED")
            if msg_id:
                await delete_message(QUEUE_NAME, msg_id)

        except Exception as e:
            error_msg = f"{type(e).__name__}: {e}"
            logger.critical("Job %s failed: %s", job_id, error_msg, exc_info=True)

            # Always mark the job as FAILED so the UI reflects reality.
            if job_id:
                try:
                    await update_job_status(
                        job_id, "FAILED", {"error_message": error_msg[:500]}
                    )
                except Exception as db_err:  # noqa: BLE001
                    logger.error(
                        "Could not update job %s to FAILED: %s", job_id, db_err
                    )

            # Delete the message so PGMQ doesn't keep redelivering a broken job.
            if msg_id:
                try:
                    await delete_message(QUEUE_NAME, msg_id)
                except Exception as del_err:  # noqa: BLE001
                    logger.error("Could not delete msg %s: %s", msg_id, del_err)


async def poll_queue() -> None:
    """Continuously polls PGMQ and dispatches background tasks concurrently."""
    logger.info("Starting optimized worker. Polling queue: %s", QUEUE_NAME)

    # Establish persistent asyncpg connection pool
    await init_db_pool()

    semaphore = asyncio.Semaphore(MAX_CONCURRENT_JOBS)

    try:
        while True:
            # Back-pressure: Throttle polling if we are currently at max capacity
            if semaphore.locked():
                await asyncio.sleep(1)
                continue

            msg = await read_message(QUEUE_NAME, vt=300)

            if not msg:
                await asyncio.sleep(2)  # Idle wait
                continue

            # Dispatch task asynchronously immediately; do not block the polling loop
            asyncio.create_task(handle_job(msg, semaphore))

    except asyncio.CancelledError:
        logger.info("Worker shutting down gracefully.")
    except Exception:
        logger.exception("Critical error in worker loop")
    finally:
        await close_db_pool()


if __name__ == "__main__":
    asyncio.run(poll_queue())
