import asyncio
from typing import Dict, Any

from app.db.supabase import get_supabase_client
from app.services.auth_service import get_valid_token
from app.services.spotify_api import fetch_playlist_tracks
from app.services.ytmusic_scraper import get_youtube_video_id
from app.services.youtube_api import add_video_to_playlist

supabase = get_supabase_client()

async def process_sync_job(job_id: str, payload: Dict[str, Any]) -> bool:
    """
    Executes the sync pipeline for a given job.
    payload expects: user_id, spotify_playlist_id, youtube_playlist_id
    """
    user_id = payload.get("user_id")
    spotify_playlist_id = payload.get("spotify_playlist_id")
    youtube_playlist_id = payload.get("youtube_playlist_id")
    
    if not all([user_id, spotify_playlist_id, youtube_playlist_id]):
        print(f"Job {job_id} missing required payload fields.")
        return False
        
    # Get Tokens
    spotify_token = await get_valid_token(user_id, "spotify")
    youtube_token = await get_valid_token(user_id, "google")
    
    if not spotify_token or not youtube_token:
        print(f"Job {job_id} failed: Missing valid OAuth tokens.")
        return False
        
    # Fetch Spotify Tracks
    print(f"Job {job_id}: Fetching Spotify tracks...")
    try:
        tracks = await fetch_playlist_tracks(spotify_token, spotify_playlist_id)
    except Exception as e:
        print(f"Job {job_id} failed fetching Spotify playlist: {e}")
        return False
        
    total_tracks = len(tracks)
    if total_tracks == 0:
        print(f"Job {job_id}: Spotify playlist is empty.")
        return True
        
    # Update Job Total
    supabase.table("sync_jobs").update({
        "total_tracks": total_tracks,
        "processed_tracks": 0,
        "progress_percentage": 0
    }).eq("id", job_id).execute()
    
    processed = 0
    failed_tracks = []
    
    for track in tracks:
        # Match track on YouTube Music
        video_id = get_youtube_video_id(track.get("isrc"), track.get("name"), track.get("artist"))
        
        if video_id:
            # Add to YouTube Playlist
            success = await add_video_to_playlist(youtube_token, youtube_playlist_id, video_id)
            if not success:
                failed_tracks.append({"track": track, "reason": "Failed to add to YouTube playlist"})
        else:
            failed_tracks.append({"track": track, "reason": "Could not find matching video ID"})
            
        processed += 1
        progress = int((processed / total_tracks) * 100)
        
        # Update progress every 5 tracks or on the last track to reduce DB load
        if processed % 5 == 0 or processed == total_tracks:
            supabase.table("sync_jobs").update({
                "processed_tracks": processed,
                "progress_percentage": progress
            }).eq("id", job_id).execute()
            
    if failed_tracks:
        # Optionally, save failed tracks to a JSONB column on the job if it exists
        # We will log them for now
        print(f"Job {job_id} had {len(failed_tracks)} partial failures.")
        supabase.table("sync_jobs").update({"failed_tracks": failed_tracks}).eq("id", job_id).execute()
        
    return True
