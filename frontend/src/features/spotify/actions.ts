"use server";

import { auth } from "@/lib/auth";
import { getValidSpotifyToken, refreshSpotifyToken } from "@/lib/spotifyToken";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SpotifyApiPlaylist, SpotifyPlaylist } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key-for-build";

// Auth.js stores accounts in the next_auth schema
const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: "next_auth" },
});

async function fetchUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("TokenExpired");
    }
    const body = await res.text();
    console.error("[fetchUserPlaylists] Spotify API error:", res.status, body);
    throw new Error("Failed to fetch playlists from Spotify");
  }

  const data = await res.json();
  const items: SpotifyApiPlaylist[] = data.items ?? [];

  if (items.length > 0) {
    console.log("[fetchUserPlaylists] First playlist raw:", JSON.stringify(items[0], null, 2));
  }

  // Map to safely pass optional images and cleanly extract the tracks total
  return items.map((p: any) => {
    // Spotify's API sometimes returns 'tracks' and sometimes 'items' for the tracks collection.
    const tracksObj = p.tracks ?? p.items;
    const count = typeof tracksObj === 'number' 
      ? tracksObj 
      : tracksObj?.total;
      
    return {
      id: p.id,
      name: p.name,
      images: p.images,
      tracksCount: count || 0,
      tracks: { total: count || 0 } // Add this to ensure backward compatibility if UI hasn't hot-reloaded
    };
  });
}

export async function getSpotifyPlaylists(): Promise<SpotifyPlaylist[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Get a (proactively refreshed) token.
  let { accessToken } = await getValidSpotifyToken(userId);

  try {
    return await fetchUserPlaylists(accessToken);
  } catch (err) {
    // 401 fallback — token might have been revoked or DB expiry was stale.
    if (err instanceof Error && err.message === "TokenExpired") {
      console.warn("[getSpotifyPlaylists] 401 on first attempt, forcing token refresh");

      const { data: accounts } = await supabaseAuth
        .from("accounts")
        .select("refresh_token")
        .eq("userId", userId)
        .eq("provider", "spotify")
        .limit(1);

      if (!accounts || accounts.length === 0 || !accounts[0].refresh_token) {
        throw new Error("Spotify account not linked or missing refresh token");
      }

      const refreshed = await refreshSpotifyToken(userId, accounts[0].refresh_token);
      return await fetchUserPlaylists(refreshed.accessToken);
    }
    throw err;
  }
}

export async function getPlaylistTracks(playlistId: string): Promise<{ id: string, name: string, artist: string, albumArt?: string }[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  let { accessToken } = await getValidSpotifyToken(userId);

  const fetchTracks = async (token: string) => {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("TokenExpired");
      throw new Error("Failed to fetch playlist tracks");
    }

    const data = await res.json();
    const tracks = data.items?.map((item: any) => {
      const track = item.track || item.item;
      if (!track || track.type !== "track") return null;
      return {
        id: track.id || Math.random().toString(),
        name: track.name,
        artist: track.artists?.[0]?.name || "Unknown Artist",
        albumArt: track.album?.images?.[0]?.url
      };
    }).filter(Boolean) || [];
    
    return tracks;
  };

  try {
    return await fetchTracks(accessToken);
  } catch (err) {
    if (err instanceof Error && err.message === "TokenExpired") {
      const { data: accounts } = await supabaseAuth
        .from("accounts")
        .select("refresh_token")
        .eq("userId", userId)
        .eq("provider", "spotify")
        .limit(1);

      if (!accounts || accounts.length === 0 || !accounts[0].refresh_token) {
        throw new Error("Spotify account not linked or missing refresh token");
      }

      const refreshed = await refreshSpotifyToken(userId, accounts[0].refresh_token);
      return await fetchTracks(refreshed.accessToken);
    }
    throw err;
  }
}


