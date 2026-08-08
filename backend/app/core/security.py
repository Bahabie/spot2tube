"""Security boundaries for Spot2Tube Sync."""

from app.db.supabase import get_supabase_client

def retrieve_decrypted_yt_headers(user_id: str) -> str:
    """
    Retrieve decrypted YouTube Music headers using the Supabase SERVICE_ROLE key.
    
    This bypasses RLS, so it MUST ONLY be used in the background worker.
    """
    supabase = get_supabase_client()
    response = supabase.schema("next_auth").table("accounts").select("yt_headers").eq("userId", user_id).execute()
    
    if response.data and response.data[0].get("yt_headers"):
        return response.data[0]["yt_headers"]
        
    raise ValueError(f"No YouTube headers found for user {user_id}")
