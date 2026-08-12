import { auth } from "@/lib/auth";
import { SyncWizard } from "@/features/sync-wizard/components/SyncWizard";
import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  const session = await auth();
  
  let spotifyLinked = false;
  let googleLinked = false;

  if (session?.user?.id) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { db: { schema: "next_auth" } }
    );

    const { data: accounts } = await supabase
      .from("accounts")
      .select("provider")
      .eq("userId", session.user.id);

    if (accounts) {
      spotifyLinked = accounts.some(a => a.provider === "spotify");
      googleLinked = accounts.some(a => a.provider === "google");
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

