import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are loaded (NEXT_PUBLIC prefix makes them available on the client)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-for-build";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Realtime features may not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
