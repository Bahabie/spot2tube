import asyncio
from app.db.supabase import get_supabase_client
from app.core.config import settings

def main():
    supabase = get_supabase_client()
    response = supabase.table("sync_jobs").select("*").order("created_at", desc=True).limit(5).execute()
    for job in response.data:
        print(f"[{job['status']}] {job.get('target_playlist_name')} - Err: {job.get('error_message')}")

if __name__ == "__main__":
    main()
