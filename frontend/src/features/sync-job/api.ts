"use server";

import { auth } from "@/lib/auth";
import { SignJWT } from "jose";

/** Create an HS256-signed JWT the Python backend can verify with PyJWT. */
async function createBackendToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  return await new SignJWT({ sub: userId, id: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(secret);
}

export async function startSyncJob(
  playlistId: string,
  targetName: string,
  searchAlgo: number
): Promise<{ jobId?: string; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized: No user ID available." };
  }

  try {
    const token = await createBackendToken(session.user.id);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

    if (backendUrl.includes("127.0.0.1") || backendUrl.includes("localhost")) {
      return { error: `Backend URL is set to a local address (${backendUrl}) in a production Vercel environment. Please deploy your Python backend and update NEXT_PUBLIC_BACKEND_URL.` };
    }

    const response = await fetch(`${backendUrl}/api/v1/sync/start`, {
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
      return { error: errorMessage };
    }

    if (response.status !== 202) {
      return { error: `Unexpected status code: ${response.status}` };
    }

    const data = await response.json();
    return { jobId: data.job_id };
  } catch (error) {
    console.error("Fetch failed in startSyncJob:", error);
    return { error: error instanceof Error ? error.message : "Unknown network error connecting to backend" };
  }
}

export async function getJobsProgress(jobIds: string[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    if (!jobIds || jobIds.length === 0) return [];

    const token = await createBackendToken(session.user.id);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    const url = new URL(`${baseUrl}/api/v1/sync/jobs`);
    url.searchParams.append("job_ids", jobIds.join(","));

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`[API] Transient error fetching job progress: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("[API] Error polling job progress:", error);
    return [];
  }
}
