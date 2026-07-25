from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """Returns a Supabase client initialized with the Service Role key."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
