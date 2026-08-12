"use server";

import { auth } from "@/lib/auth";

export async function startSyncJob(
  playlistId: string,
  targetName: string,
  searchAlgo: number
): Promise<{ jobId: string }> {
  const session = await auth();
  
  // Extract token from session (adjust based on NextAuth configuration)
  const token = (session as any)?.supabaseAccessToken || (session as any)?.accessToken || "";
  
  if (!token || !session?.user?.id) {
    throw new Error("Unauthorized: No session token or user ID available.");
  }

  const response = await fetch("http://127.0.0.1:8000/api/v1/sync/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      spotify_playlist_id: playlistId,
      target_playlist_name: targetName,
      yt_search_algo: searchAlgo,
      privacy_status: "PRIVATE",
      reverse_playlist: true,
      user_id: session.user.id
    })
  });

  if (!response.ok) {
    let errorMessage = `Failed to start sync job: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (e) {
      // Ignore if response is not JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status !== 202) {
    throw new Error(`Unexpected status code: ${response.status}`);
  }

  const data = await response.json();
  return { jobId: data.job_id };
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabasePublic = createClient(supabaseUrl, supabaseServiceKey);

export async function getJobsProgress(jobIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const { data, error } = await supabasePublic
    .from("sync_jobs")
    .select("id, status, processed_tracks, failed_tracks, total_tracks")
    .in("id", jobIds)
    .eq("user_id", session.user.id);
    
  if (error) throw new Error(error.message);
  return data || [];
}
