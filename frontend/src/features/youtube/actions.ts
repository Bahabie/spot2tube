"use server";

import { auth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function saveYouTubeHeaders(headers: string): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  // Initialize Supabase with the service role key and target the next_auth schema 
  // where the accounts table resides.
  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "next_auth" },
  });

  // Update the active user's account records with the provided YouTube headers.
  // This satisfies the backend worker's `retrieve_decrypted_yt_headers` requirement.
  const { error } = await supabase
    .from("accounts")
    .update({ yt_headers: headers })
    .eq("userId", session.user.id);

  if (error) {
    console.error("Failed to save YouTube headers:", error);
    throw new Error("Failed to save YouTube headers");
  }
}
