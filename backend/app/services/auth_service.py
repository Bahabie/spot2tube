import time
from typing import Any

import httpx

from app.core.config import settings
from app.db.supabase import get_supabase_client

supabase = get_supabase_client()


async def get_valid_token(user_id: str, provider: str) -> str | None:
    """
    Fetches a valid access token for the given user and provider.
    Refreshes the token if it expires in less than 5 minutes.
    Supports 'spotify' and 'google' providers.
    """
    response = (
        supabase.schema("next_auth")
        .table("accounts")
        .select("id, access_token, refresh_token, expires_at")
        .eq("userId", user_id)
        .eq("provider", provider)
        .execute()
    )

    if not response.data:
        return None

    account = response.data[0]
    access_token = account.get("access_token")
    refresh_token = account.get("refresh_token")
    expires_at = account.get("expires_at")

    if not expires_at or not refresh_token:
        return access_token

    current_time = int(time.time())

    # Refresh if expiring in less than 5 minutes (300 seconds)
    if expires_at - current_time < 300:
        new_token_data = await _refresh_token(provider, refresh_token)
        if not new_token_data:
            return None

        new_access_token = new_token_data["access_token"]
        new_expires_at = current_time + new_token_data.get("expires_in", 3600)

        supabase.schema("next_auth").table("accounts").update(
            {"access_token": new_access_token, "expires_at": new_expires_at}
        ).eq("id", account["id"]).execute()

        return new_access_token

    return access_token


async def _refresh_token(provider: str, refresh_token: str) -> dict[str, Any] | None:
    """Calls the OAuth provider's token endpoint to refresh the access token."""
    async with httpx.AsyncClient() as client:
        if provider == "spotify":
            auth = (settings.spotify_client_id, settings.spotify_client_secret)
            data = {"grant_type": "refresh_token", "refresh_token": refresh_token}
            res = await client.post(
                "https://accounts.spotify.com/api/token", data=data, auth=auth
            )
        elif provider == "google":
            data = {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            }
            res = await client.post("https://oauth2.googleapis.com/token", data=data)
        else:
            return None

    if res.status_code == 200:
        return res.json()
    return None
