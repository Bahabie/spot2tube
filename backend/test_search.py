import asyncio
from app.db.supabase import get_supabase_client
from app.services.auth_service import get_valid_token
from app.services.youtube_client import YouTubeClientService
import json

async def main():
    user_id = "d1132205-c952-4c71-9408-7607f8304b44"
    google_token = await get_valid_token(user_id, "google")
    yt_auth_headers = json.dumps({
        "Authorization": f"Bearer {google_token}",
        "User-Agent": "Spot2Tube-Sync/0.1"
    })
    yt_service = YouTubeClientService(auth_headers=yt_auth_headers)
    
    try:
        res = yt_service.lookup_song_algorithmically("Gangnam Style", "PSY", "", 0)
        print("Search Success:", res)
    except Exception as e:
        print("Search Fail:", e)

if __name__ == "__main__":
    asyncio.run(main())
