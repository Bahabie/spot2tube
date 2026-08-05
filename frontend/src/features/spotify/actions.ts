"use server";

import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Auth.js stores accounts in the next_auth schema
const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: "next_auth" },
});

// Application tables (sync_jobs) live in the public schema
const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

interface SpotifyPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks: { href: string; total: number };
}

interface MappedPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
  trackCount: number;
}

export async function getSpotifyPlaylists(): Promise<MappedPlaylist[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the user's Spotify account to get the access_token
  const { data: accounts, error } = await supabaseAuth
    .from("accounts")
    .select("access_token")
    .eq("userId", session.user.id)
    .eq("provider", "spotify")
    .limit(1);

  if (error || !accounts || accounts.length === 0) {
    throw new Error("Spotify account not linked");
  }

  const accessToken = accounts[0].access_token;

  // Fetch playlists from Spotify API
  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[getSpotifyPlaylists] Spotify API error:", res.status, body);
    throw new Error("Failed to fetch playlists from Spotify");
  }

  const data = await res.json();
  const items: SpotifyPlaylist[] = data.items ?? [];

  // Explicitly map to ensure tracks.total survives serialization
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    images: p.images ?? [],
    trackCount: p.tracks?.total ?? 0,
  }));
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
    });
    throw new Error("Failed to start sync job");
  }

  revalidatePath("/");
  return { id: data.id };
}
