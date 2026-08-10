import asyncio
from app.db.supabase import get_supabase_client
from app.services.auth_service import get_valid_token
import httpx

async def main():
    user_id = "d1132205-c952-4c71-9408-7607f8304b44"
    playlist_id = "0q4GYGhZCF80swj9tHW8Ve"
    token = await get_valid_token(user_id, "spotify")
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/items?limit=1"
    headers = {"Authorization": f"Bearer {token}"}
    
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        print("Status:", res.status_code)
        print("Response:", res.text)

if __name__ == "__main__":
    asyncio.run(main())
