"""YouTube Music client service.

Provides a stateless, class-based interface over ytmusicapi with:
  - Exponential backoff for all write operations (playlist creation, track insertion).
  - 3-level algorithmic song matching (album scan → song search → video fallback).

Auth headers are injected at construction time via a headers dict loaded
from the database — no local oauth.json or raw HTTP calls.
"""

import logging
import re
import time

import httpx
from ytmusicapi import YTMusic

logger = logging.getLogger(__name__)

_MAX_RETRIES: int = 10
_INITIAL_BACKOFF_SECS: int = 5

# Matches "(Remastered 2009)", "[Live]", "(feat. Artist)", etc.
_BRACKET_RE: re.Pattern[str] = re.compile(r"[\[(].*?[])]")


class QuotaExceededError(RuntimeError):
    """Raised when YouTube Music rate-limits or blocks the request."""


class YouTubeClientService:
    """Stateless YouTube Music client backed by ytmusicapi.

    All network I/O is synchronous (ytmusicapi is blocking).
    Instantiate once per request/job; pass auth_headers dict from the
    caller — never read from a local file here.
    """

    def __init__(self, google_access_token: str) -> None:
        """Initialize with a standard Google OAuth access token.

        Args:
            google_access_token: A valid Google OAuth Bearer token with the
                                 https://www.googleapis.com/auth/youtube scope.
        """
        self.access_token: str = google_access_token
        # ytmusicapi is initialized without auth, used ONLY for searching.
        self.yt: YTMusic = YTMusic()

        self.api_base_url: str = "https://www.googleapis.com/youtube/v3"

    def _get_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    # ------------------------------------------------------------------
    # Playlist creation
    # ------------------------------------------------------------------

    def create_playlist_with_backoff(
        self,
        title: str,
        description: str,
        privacy_status: str = "PRIVATE",
    ) -> str:
        """Create a YouTube Music playlist with exponential backoff.

        Retries up to _MAX_RETRIES times (starting at _INITIAL_BACKOFF_SECS,
        doubling each attempt) to survive transient rate limits.

        Sleeps 1 s after a successful creation so YouTube Music servers can
        propagate the new playlist before tracks are inserted.

        Args:
            title:          Playlist title.
            description:    Playlist description.
            privacy_status: One of "PRIVATE", "PUBLIC", or "UNLISTED".

        Returns:
            The newly created playlist ID string.

        Raises:
            RuntimeError: If all _MAX_RETRIES attempts fail.
        """
        exception_sleep: int = _INITIAL_BACKOFF_SECS

        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                with httpx.Client() as client:
                    response = client.post(
                        f"{self.api_base_url}/playlists",
                        headers=self._get_headers(),
                        params={"part": "snippet,status"},
                        json={
                            "snippet": {
                                "title": title,
                                "description": description,
                            },
                            "status": {
                                "privacyStatus": privacy_status.lower(),
                            },
                        },
                        timeout=10.0,
                    )
                
                if response.status_code == 200:
                    data = response.json()
                    playlist_id = data["id"]
                    logger.info(
                        "Playlist '%s' created on attempt %d/%d (id=%s)",
                        title,
                        attempt,
                        _MAX_RETRIES,
                        playlist_id,
                    )
                    time.sleep(1)
                    return playlist_id
                
                if response.status_code in (401, 403):
                    raise QuotaExceededError(
                        f"YouTube API auth/quota error: {response.text}"
                    )
                
                response.raise_for_status()

            except Exception as exc:
                if isinstance(exc, QuotaExceededError):
                    raise
                
                logger.warning(
                    "Playlist creation attempt %d/%d failed: %s",
                    attempt,
                    _MAX_RETRIES,
                    exc,
                )
                if attempt < _MAX_RETRIES:
                    logger.info("Backing off %ds before retry...", exception_sleep)
                    time.sleep(exception_sleep)
                    exception_sleep *= 2

        raise RuntimeError(
            f"Failed to create playlist '{title}' after {_MAX_RETRIES} attempts."
        )

    # ------------------------------------------------------------------
    # Algorithmic song matching
    # ------------------------------------------------------------------

    def lookup_song_algorithmically(
        self,
        track_name: str,
        artist_name: str,
        album_name: str,
        yt_search_algo: int,
    ) -> dict:
        """Find the best YouTube Music match for a Spotify track.

        Matching proceeds through up to three levels, falling back to the
        next level only when the current one yields nothing.

        Level 1 — Album Scan:
            Search YouTube Music for the album; if found, scan its track
            list for an exact (case-insensitive) title match.

        Level 2 — Song Search:
            Search with filter="songs" and apply the caller-selected
            matching algorithm:
              0 → return first result blindly.
              1 → demand exact (case-insensitive) title + artist + album.
              2 → strip bracketed text from both titles; require the
                  cleaned track name to appear in the cleaned YT title,
                  and require the artist name to appear in the YT artist.

        Level 3 — Video Fallback (algo 2 only):
            Search with filter="videos"; check that the clean track name
            and artist name are both contained in the video title.

        Args:
            track_name:    Spotify track title.
            artist_name:   Primary artist name.
            album_name:    Album name (used for Level 1 and exact matching).
            yt_search_algo: Matching strictness level (0, 1, or 2).

        Returns:
            The matched ytmusicapi result dict containing at minimum a
            "videoId" key.

        Raises:
            ValueError: If no match is found across all applicable levels.
        """
        query: str = f"{track_name} {artist_name}"

        # ---- Level 1: Album scan ----------------------------------------
        album_results: list[dict] = self.yt.search(
            f"{album_name} {artist_name}", filter="albums", limit=5
        )
        for album_result in album_results:
            browse_id: str | None = album_result.get("browseId")
            if not browse_id:
                continue
            try:
                album_data: dict = self.yt.get_album(browseId=browse_id)
            except Exception as exc:  # noqa: BLE001
                logger.debug("Could not fetch album %s: %s", browse_id, exc)
                continue

            tracks: list[dict] = album_data.get("tracks", [])
            for track in tracks:
                yt_title: str = track.get("title", "")
                if yt_title.casefold() == track_name.casefold():
                    logger.debug("Level 1 (album scan) hit for '%s'", track_name)
                    return track

        # ---- Level 2: Song search ----------------------------------------
        song_results: list[dict] = self.yt.search(query, filter="songs", limit=10)

        if yt_search_algo == 0:
            # Blind — take the first result regardless of metadata.
            if song_results:
                logger.debug("Level 2 (song, algo=0 blind) hit for '%s'", track_name)
                return song_results[0]

        elif yt_search_algo == 1:
            # Exact — title, artist, and album must all match exactly.
            for song in song_results:
                yt_title = song.get("title", "")
                yt_artists: list[dict] = song.get("artists", [])
                yt_artist_name: str = yt_artists[0].get("name", "") if yt_artists else ""
                yt_album: dict = song.get("album") or {}
                yt_album_name: str = yt_album.get("name", "")

                if (
                    yt_title.casefold() == track_name.casefold()
                    and yt_artist_name.casefold() == artist_name.casefold()
                    and yt_album_name.casefold() == album_name.casefold()
                ):
                    logger.debug("Level 2 (song, algo=1 exact) hit for '%s'", track_name)
                    return song

        elif yt_search_algo == 2:
            # Fuzzy — strip bracketed text, then check containment.
            clean_track: str = _BRACKET_RE.sub("", track_name).strip().casefold()

            for song in song_results:
                raw_yt_title: str = song.get("title", "")
                clean_yt_title: str = _BRACKET_RE.sub("", raw_yt_title).strip().casefold()

                yt_artists = song.get("artists", [])
                yt_artist_name = yt_artists[0].get("name", "") if yt_artists else ""

                title_match: bool = clean_track in clean_yt_title or clean_yt_title in clean_track
                artist_match: bool = artist_name.casefold() in yt_artist_name.casefold()

                if title_match and artist_match:
                    logger.debug("Level 2 (song, algo=2 fuzzy) hit for '%s'", track_name)
                    return song

            # ---- Level 3: Video fallback (algo 2 only) -------------------
            clean_track = _BRACKET_RE.sub("", track_name).strip().casefold()
            video_results: list[dict] = self.yt.search(query, filter="videos", limit=10)

            for video in video_results:
                video_title: str = video.get("title", "").casefold()
                if (
                    clean_track in video_title
                    and artist_name.casefold() in video_title
                ):
                    logger.debug("Level 3 (video fallback) hit for '%s'", track_name)
                    return video

        raise ValueError(
            f"No YouTube Music match for '{track_name}' by '{artist_name}' "
            f"(album='{album_name}', algo={yt_search_algo})."
        )

    # ------------------------------------------------------------------
    # Track insertion
    # ------------------------------------------------------------------

    def add_track_with_backoff(self, playlist_id: str, video_id: str) -> None:
        """Add a single track to a playlist with exponential backoff.

        Retries up to _MAX_RETRIES times (starting at _INITIAL_BACKOFF_SECS,
        doubling each attempt) to survive transient rate limits.

        Args:
            playlist_id: Target YouTube Music playlist ID.
            video_id:    YouTube video ID of the track to insert.

        Raises:
            RuntimeError: If all _MAX_RETRIES attempts fail.
        """
        exception_sleep: int = _INITIAL_BACKOFF_SECS

        for attempt in range(1, _MAX_RETRIES + 1):
            try:
                with httpx.Client() as client:
                    response = client.post(
                        f"{self.api_base_url}/playlistItems",
                        headers=self._get_headers(),
                        params={"part": "snippet"},
                        json={
                            "snippet": {
                                "playlistId": playlist_id,
                                "resourceId": {
                                    "kind": "youtube#video",
                                    "videoId": video_id,
                                },
                            }
                        },
                        timeout=10.0,
                    )
                
                if response.status_code == 200:
                    logger.info(
                        "Track %s added to playlist %s on attempt %d/%d",
                        video_id,
                        playlist_id,
                        attempt,
                        _MAX_RETRIES,
                    )
                    return
                
                if response.status_code in (401, 403):
                    # Check if it's a quota error
                    err_data = response.json()
                    reason = err_data.get("error", {}).get("errors", [{}])[0].get("reason", "")
                    if reason in ("quotaExceeded", "dailyLimitExceeded"):
                        raise QuotaExceededError("YouTube Data API quota exceeded.")
                    else:
                        logger.warning(f"YouTube API returned 403: {response.text}")
                
                response.raise_for_status()

            except Exception as exc:
                if isinstance(exc, QuotaExceededError):
                    raise
                
                logger.warning(
                    "Track insertion attempt %d/%d failed for video %s: %s",
                    attempt,
                    _MAX_RETRIES,
                    video_id,
                    exc,
                )
                if attempt < _MAX_RETRIES:
                    logger.info("Backing off %ds before retry...", exception_sleep)
                    time.sleep(exception_sleep)
                    exception_sleep *= 2

        raise RuntimeError(
            f"Failed to add video '{video_id}' to playlist '{playlist_id}' "
            f"after {_MAX_RETRIES} attempts."
        )
