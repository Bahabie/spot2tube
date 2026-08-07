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
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
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
                track = item.get("track")
                if track:
                    tracks.append(
                        {
                            "name": track.get("name"),
                            "artist": track["artists"][0]["name"]
                            if track.get("artists")
                            else "Unknown",
                            "album": track.get("album", {}).get("name"),
                            "isrc": track.get("external_ids", {}).get("isrc"),
                        }
                    )

            url = data.get("next")

    return tracks
