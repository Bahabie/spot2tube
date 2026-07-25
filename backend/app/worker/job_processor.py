import asyncio

from app.db.pgmq import read_message, delete_message
from app.db.supabase import get_supabase_client
from app.worker.task_handlers import process_sync_job

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
            
            # Execute Sync
            success = await process_sync_job(job_id, payload)
            
            if success:
                print(f"Job {job_id} completed successfully.")
                supabase.table("sync_jobs").update({"status": "COMPLETED"}).eq("id", job_id).execute()
                delete_message(QUEUE_NAME, msg_id)
            else:
                print(f"Job {job_id} failed.")
                supabase.table("sync_jobs").update({"status": "FAILED"}).eq("id", job_id).execute()
                # Do NOT delete from queue immediately if we want retry logic, 
                # but for simplicity we will delete to avoid poison pills if hard failed.
                delete_message(QUEUE_NAME, msg_id)
                
        except Exception as e:
            print(f"Unexpected error in worker loop: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(poll_queue())
