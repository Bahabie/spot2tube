import asyncio

from app.db.pgmq import read_message, delete_message
from app.db.supabase import get_supabase_client
from app.worker.task_handlers import process_playlist_sync_job

QUEUE_NAME = "spot2tube_jobs"
supabase = get_supabase_client()

async def poll_queue():
    """Continuously polls PGMQ for new sync jobs."""
    print(f"Starting worker. Polling queue: {QUEUE_NAME}")
    
    while True:
        try:
            # Read message, hide it for 300 seconds (5 mins visibility timeout)
            msg = read_message(QUEUE_NAME, vt=300)
            
            if not msg:
                await asyncio.sleep(2)  # Idle wait
                continue
                
            msg_id = msg.get("msg_id")
            payload = msg.get("message", {})
            job_id = payload.get("job_id")
            
            if not job_id:
                print(f"Message {msg_id} missing job_id. Deleting.")
                delete_message(QUEUE_NAME, msg_id)
                continue
                
            print(f"Picked up job {job_id} (msg_id {msg_id})")
            
            # Mark job as PROCESSING
            supabase.table("sync_jobs").update({"status": "PROCESSING"}).eq("id", job_id).execute()
            
            # Execute sync — process_playlist_sync_job is synchronous and
            # raises on catastrophic failure (allowing PGMQ visibility
            # timeout to requeue the message).
            process_playlist_sync_job(payload)
            
            print(f"Job {job_id} completed successfully.")
            supabase.table("sync_jobs").update({"status": "COMPLETED"}).eq("id", job_id).execute()
            delete_message(QUEUE_NAME, msg_id)
                
        except Exception as e:
            # Catastrophic failures from the handler land here.
            # The message is NOT deleted, so PGMQ will re-surface it
            # after the 300-second visibility timeout expires.
            print(f"Unexpected error in worker loop: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(poll_queue())
