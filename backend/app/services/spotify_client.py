"""Spotify Client."""

import asyncio

from app.services.auth_service import get_valid_token
from app.services.spotify_api import fetch_playlist_tracks


def get_spotify_playlist_metadata(user_id: str, playlist_id: str) -> list[tuple[str, str, str]]:
    """Fetch Spotify playlist metadata and return list of tuples (name, artist, album)."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    async def _fetch():
        token = await get_valid_token(user_id, "spotify")
        if not token:
            raise ValueError(f"No valid Spotify token for user {user_id}")
        raw_tracks = await fetch_playlist_tracks(token, playlist_id)
        return [
            (
                t.get("name", "Unknown"),
                t.get("artist", "Unknown"),
                t.get("album", "Unknown"),
            )
            for t in raw_tracks
            if t.get("name")
        ]

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, _fetch()).result()
    return asyncio.run(_fetch())
