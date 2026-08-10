import asyncio
from app.db.supabase import get_supabase_client
from app.services.auth_service import get_valid_token
import httpx
import json

async def main():
    user_id = "d1132205-c952-4c71-9408-7607f8304b44"
    google_token = await get_valid_token(user_id, "google")
    print("Google token:", google_token[:10] + "...")
    
    url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status"
    headers = {
        "Authorization": f"Bearer {google_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "snippet": {
            "title": "Test Playlist Data API 2",
            "description": "Created via API"
        },
        "status": {
            "privacyStatus": "private"
        }
    }
    
    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json=payload)
        print("Status:", res.status_code)
        if res.status_code != 200:
            print("Response:", res.text)
        
if __name__ == "__main__":
    asyncio.run(main())
