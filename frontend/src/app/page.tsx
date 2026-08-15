import { auth } from "@/lib/auth";
import { SyncWizard } from "@/features/sync-wizard/components/SyncWizard";
import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  const session = await auth();
  
  let spotifyLinked = false;
  let googleLinked = false;

  if (session?.user?.id) {
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          db: { schema: "next_auth" }
        });

        const { data: accounts, error } = await supabase
          .from("accounts")
          .select("provider")
          .eq("userId", session.user.id);

        if (!error && accounts) {
          spotifyLinked = accounts.some(a => a.provider === "spotify");
          googleLinked = accounts.some(a => a.provider === "google");
        }
      }
    } catch (e) {
      console.error("Failed to fetch linked accounts in page.tsx:", e);
    }
  }



  return (
    <main className="flex-1 p-8 md:p-16 max-w-5xl mx-auto space-y-12 w-full">
      <SyncWizard
        spotifyLinked={spotifyLinked}
        googleLinked={googleLinked}
      />
    </main>
  );
}

