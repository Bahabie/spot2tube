"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const spotifyClientId = process.env.AUTH_SPOTIFY_ID!;
const spotifyClientSecret = process.env.AUTH_SPOTIFY_SECRET!;

const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: "next_auth" },
});

interface SpotifyTokenRow {
  access_token: string;
  refresh_token: string;
  expires_at: number | null;
}

interface SpotifyTokenResult {
  accessToken: string;
}

/**
 * Return a valid Spotify access token for the given user.
 * If the stored token is expired (or missing expires_at), refresh it
 * via the Spotify token endpoint and persist the new credentials.
 */
export async function getValidSpotifyToken(
  userId: string,
): Promise<SpotifyTokenResult> {
  const { data: accounts, error } = await supabaseAuth
    .from("accounts")
    .select("access_token, refresh_token, expires_at")
    .eq("userId", userId)
    .eq("provider", "spotify")
    .limit(1);

  if (error || !accounts || accounts.length === 0) {
    throw new Error("Spotify account not linked");
  }

  const row = accounts[0] as SpotifyTokenRow;
  const nowEpochSec = Math.floor(Date.now() / 1000);
  const expiresAt = row.expires_at ? Number(row.expires_at) : 0;

  // Token is still valid — 60s buffer to avoid edge-case expiry mid-request.
  if (expiresAt > nowEpochSec + 60 && row.access_token) {
    return { accessToken: row.access_token };
  }

  // Token expired or no expiry recorded — refresh it.
  if (!row.refresh_token) {
    throw new Error("Missing Spotify refresh token. Please re-link your account.");
  }
  return refreshSpotifyToken(userId, row.refresh_token);
}

/**
 * Exchange the refresh_token for a fresh access_token via Spotify's
 * token endpoint, then persist the new credentials to Supabase.
 */
export async function refreshSpotifyToken(
  userId: string,
  refreshToken: string,
): Promise<SpotifyTokenResult> {
  console.log("[spotifyToken] Refreshing expired Spotify token for user", userId);

  if (!refreshToken) {
    throw new Error("Cannot refresh token without a valid refresh_token.");
  }

  const basicAuth = Buffer.from(
    `${spotifyClientId}:${spotifyClientSecret}`,
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[spotifyToken] Refresh failed:", res.status, body);
    throw new Error("Failed to refresh Spotify token. User may need to re-link.");
  }

  const data = await res.json();
  const newAccessToken: string = data.access_token;
  // Spotify returns expires_in (seconds). Convert to absolute epoch.
  const newExpiresAt = Math.floor(Date.now() / 1000) + (data.expires_in as number);
  // Spotify may rotate the refresh token — use new one if provided.
  const newRefreshToken: string = data.refresh_token ?? refreshToken;

  const { error: updateError } = await supabaseAuth
    .from("accounts")
    .update({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_at: newExpiresAt,
    })
    .eq("userId", userId)
    .eq("provider", "spotify");

  if (updateError) {
    console.error("[spotifyToken] Failed to persist refreshed token:", updateError);
    // Still return the new token — the fetch will work even if DB update failed.
  }

  console.log("[spotifyToken] Token refreshed, new expiry:", new Date(newExpiresAt * 1000).toISOString());
  return { accessToken: newAccessToken };
}
