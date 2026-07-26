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

export async function getSpotifyPlaylists() {
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
    // We want to fetch fresh playlists each time for now, or cache for a short time
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch playlists from Spotify");
  }

  const data = await res.json();
  return data.items || [];
}

export async function syncPlaylistToYouTube(playlistId: string, playlistName: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Insert a new job into the sync_jobs table
  const { data, error } = await supabasePublic
    .from("sync_jobs")
    .insert([
      {
        user_id: session.user.id,
        spotify_playlist_id: playlistId,
        playlist_name: playlistName,
        status: "PENDING",
        progress_percentage: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Failed to insert sync job:", error);
    throw new Error("Failed to start sync job");
  }

  revalidatePath("/");
  return data;
}
