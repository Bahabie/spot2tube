import httpx
import asyncio
from typing import Optional

async def add_video_to_playlist(access_token: str, playlist_id: str, video_id: str) -> bool:
    """
    Inserts a YouTube Video ID into a YouTube Playlist via the Data API.
    Handles basic rate limits and backoff.
    """
    url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "snippet": {
            "playlistId": playlist_id,
            "resourceId": {
                "kind": "youtube#video",
                "videoId": video_id
            }
        }
    }
    
    backoff = 1
    max_retries = 3
    
    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                return True
                
            if response.status_code == 429:
                # Quota exceeded or too fast
                print(f"YouTube rate limit hit. Sleeping {backoff}s...")
                await asyncio.sleep(backoff)
                backoff *= 2
                continue
                
            print(f"Failed to add video {video_id} to playlist: {response.text}")
            break
            
    return False
