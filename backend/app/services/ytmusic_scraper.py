"""ISRC-based YouTube video ID cache lookup.

Checks the track_mappings table for a cached videoId before falling back
to a ytmusicapi search. Auth headers are loaded from ytmusic_auth for
authenticated search requests.
"""


from ytmusicapi import YTMusic

from app.db.supabase import get_supabase_client


def get_youtube_video_id(
    track_name: str,
    artist_name: str,
    isrc: str | None = None,
    auth_headers: dict | None = None,
) -> str | None:
    """Look up a YouTube Video ID, with ISRC cache.

    Args:
        track_name:   Track title to search for.
        artist_name:  Primary artist name.
        isrc:         Optional ISRC code for cache lookup.
        auth_headers: Optional ytmusicapi headers dict for authenticated search.

    Returns:
        YouTube video ID string, or None if not found.
    """
    supabase = get_supabase_client()

    if isrc:
        response = (
            supabase.table("track_mappings")
            .select("youtube_video_id")
            .eq("isrc", isrc)
            .execute()
        )
        if response.data:
            return response.data[0].get("youtube_video_id")

    # Cache miss — search via ytmusicapi.
    yt = YTMusic(auth=auth_headers) if auth_headers else YTMusic()
    query = f"{track_name} {artist_name}"

    search_results = yt.search(query, filter="songs", limit=1)
    if not search_results:
        search_results = yt.search(query, filter="videos", limit=1)

    if search_results:
        video_id = search_results[0].get("videoId")
        if video_id and isrc:
            supabase.table("track_mappings").insert({
                "isrc": isrc,
                "youtube_video_id": video_id
            }).execute()
        return video_id

    return None
