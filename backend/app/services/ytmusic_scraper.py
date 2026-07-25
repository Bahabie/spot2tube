from typing import Optional
from ytmusicapi import YTMusic
from app.db.supabase import get_supabase_client

supabase = get_supabase_client()
ytmusic = YTMusic()

def get_youtube_video_id(isrc: str, track_name: str, artist_name: str) -> Optional[str]:
    """
    Looks up a YouTube Video ID.
    1. Checks `track_mappings` table for a cache hit via ISRC.
    2. Falls back to ytmusicapi search and inserts cache.
    """
    if isrc:
        # Check Cache
        response = supabase.table("track_mappings").select("youtube_video_id").eq("isrc", isrc).execute()
        if response.data:
            return response.data[0].get("youtube_video_id")
            
    # Cache Miss -> Scrape YT Music
    query = f"{track_name} {artist_name}"
    search_results = ytmusic.search(query, filter="songs", limit=1)
    
    if not search_results:
        search_results = ytmusic.search(query, filter="videos", limit=1)
        
    if search_results:
        video_id = search_results[0].get("videoId")
        if video_id and isrc:
            # Cache the result for future runs
            supabase.table("track_mappings").insert({
                "isrc": isrc,
                "youtube_video_id": video_id
            }).execute()
        return video_id
        
    return None
