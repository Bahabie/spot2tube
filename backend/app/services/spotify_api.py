import asyncio
from typing import Any

import httpx


async def fetch_playlist_tracks(
    access_token: str, playlist_id: str
) -> list[dict[str, Any]]:
    """
    Fetches all tracks from a Spotify playlist, handling pagination
    and 429 Retry-After rate limits.
    """
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/items"
    headers = {"Authorization": f"Bearer {access_token}"}
    tracks = []

    async with httpx.AsyncClient() as client:
        while url:
            response = await client.get(url, headers=headers)

            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 5))
                print(f"Spotify rate limit hit. Retrying after {retry_after} seconds.")
                await asyncio.sleep(retry_after)
                continue

            response.raise_for_status()
            data = response.json()

            for item in data.get("items", []):
                # Spotify API may return track data in "track" or "item" key depending on the endpoint/playlist
                track = item.get("track") or item.get("item")
                # Ensure it's actually a track and not a podcast episode, etc.
                if track and track.get("type") == "track":
                    tracks.append(
                        {
                            "name": track.get("name"),
                            "artist": track.get("artists", [{}])[0].get(
                                "name", "Unknown"
                            )
                            if track.get("artists")
                            else "Unknown",
                            "album": track.get("album", {}).get("name"),
                            "isrc": track.get("external_ids", {}).get("isrc"),
                        }
                    )

            url = data.get("next")

    return tracks

async def create_playlist(
    access_token: str, user_id: str, title: str, description: str, is_public: bool = False
) -> str:
    url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
    headers = {"Authorization": f"Bearer {access_token}"}
    payload = {
        "name": title,
        "description": description,
        "public": is_public
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["id"]

async def search_track(
    access_token: str, track_name: str, artist_name: str
) -> str | None:
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Strip brackets and parentheses for better Spotify matching
    import re
    clean_track = re.sub(r"[\[(].*?[\])]", "", track_name).strip()
    clean_artist = artist_name.strip()
    
    query = f"track:{clean_track} artist:{clean_artist}"
    params = {"q": query, "type": "track", "limit": 1}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        
        if response.status_code == 429:
            import asyncio
            retry_after = int(response.headers.get("Retry-After", 5))
            await asyncio.sleep(retry_after)
            response = await client.get(url, headers=headers, params=params)
            
        response.raise_for_status()
        data = response.json()
        
        items = data.get("tracks", {}).get("items", [])
        if items:
            return items[0]["uri"]
            
        # Fallback to broader search if not found
        params = {"q": f"{clean_track} {clean_artist}", "type": "track", "limit": 1}
        response = await client.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        items = data.get("tracks", {}).get("items", [])
        if items:
            return items[0]["uri"]
            
        return None

async def add_tracks_to_playlist(
    access_token: str, playlist_id: str, track_uris: list[str]
) -> None:
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Spotify API accepts max 100 tracks per request
    chunk_size = 100
    for i in range(0, len(track_uris), chunk_size):
        chunk = track_uris[i:i + chunk_size]
        payload = {"uris": chunk}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 429:
                import asyncio
                retry_after = int(response.headers.get("Retry-After", 5))
                await asyncio.sleep(retry_after)
                response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
