"use server";

import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { MappedPlaylist } from "@/features/sync-wizard/components/StepSelectPlaylists";

export async function getYoutubePlaylists(): Promise<MappedPlaylist[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the Google access token from the database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // We need service key to read accounts
  
  if (!supabaseServiceKey) {
    throw new Error("Missing service role key");
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("access_token")
    .eq("userId", session.user.id)
    .eq("provider", "google")
    .single();

  if (accountError || !account || !account.access_token) {
    throw new Error("YouTube account not connected or token missing.");
  }

  const token = account.access_token;

  // Fetch playlists from YouTube Data API v3
  const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
  url.searchParams.append("part", "snippet,contentDetails");
  url.searchParams.append("mine", "true");
  url.searchParams.append("maxResults", "50");

  let allPlaylists: MappedPlaylist[] = [];
  let nextPageToken = "";

  try {
    do {
      const fetchUrl = new URL(url.toString());
      if (nextPageToken) {
        fetchUrl.searchParams.append("pageToken", nextPageToken);
      }

      const res = await fetch(fetchUrl.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("YouTube session expired. Please reconnect your account.");
        }
        throw new Error(`Failed to fetch YouTube playlists: ${res.status}`);
      }

      const data = await res.json();
      
      const mapped = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.snippet.title,
        images: item.snippet.thumbnails?.default?.url ? [{ url: item.snippet.thumbnails.default.url }] : [],
        tracksCount: item.contentDetails?.itemCount || 0,
      }));

      allPlaylists = [...allPlaylists, ...mapped];
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return allPlaylists;
  } catch (err) {
    console.error("getYoutubePlaylists error:", err);
    throw err;
  }
}
