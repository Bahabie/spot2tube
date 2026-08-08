"use server";

import { auth } from "@/lib/auth";
import { getValidSpotifyToken, refreshSpotifyToken } from "@/lib/spotifyToken";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { SpotifyApiPlaylist, SpotifyPlaylist } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Auth.js stores accounts in the next_auth schema
const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: "next_auth" },
});

// Application tables (sync_jobs) live in the public schema
const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

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

export async function syncPlaylistToYouTube(
  playlistId: string,
  playlistName: string,
): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify user has connected their Google/YouTube account
  const { data: googleAccounts, error: googleErr } = await supabaseAuth
    .from("accounts")
    .select("access_token")
    .eq("userId", session.user.id)
    .eq("provider", "google")
    .limit(1);

  if (googleErr) {
    console.error("[syncPlaylistToYouTube] Google account lookup failed:", googleErr);
    throw new Error("Failed to check YouTube connection");
  }

  if (!googleAccounts || googleAccounts.length === 0) {
    throw new Error(
      "YouTube account not connected. Please connect your Google account first.",
    );
  }

  // Insert a new job into the sync_jobs table
  // Note: sync_jobs schema has no playlist_name column — store only the ID
  const { data, error } = await supabasePublic
    .from("sync_jobs")
    .insert([
      {
        user_id: session.user.id,
        spotify_playlist_id: playlistId,
        status: "PENDING",
        progress_percentage: 0,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("[syncPlaylistToYouTube] Supabase insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: session.user.id,
    });
    // Let's also throw the specific message if it's a UUID error
    if (error.code === '22P02') {
       throw new Error(`Invalid UUID format for user_id: ${session.user.id}`);
    }
    throw new Error(`Failed to start sync job: ${error.message}`);
  }

  // Enqueue the job for the FastAPI worker via PGMQ
  const payload = {
    job_id: data.id,
    user_id: session.user.id,
    spotify_playlist_id: playlistId,
    target_playlist_name: playlistName,
    yt_search_algo: 0,
    privacy_status: "PRIVATE",
    reverse_playlist: true,
  };

  const { error: pgmqError } = await supabasePublic.rpc("pgmq_send", {
    queue_name: "spot2tube_jobs",
    message: payload, // Supabase automatically serializes JSON
  });

  if (pgmqError) {
    console.error("[syncPlaylistToYouTube] PGMQ enqueue failed:", pgmqError);
    // Even if enqueue fails, we might want to return the job ID or delete the row.
    // For now, just throw an error.
    throw new Error("Failed to queue sync job in background worker");
  }

  revalidatePath("/");
  return { id: data.id };
}
