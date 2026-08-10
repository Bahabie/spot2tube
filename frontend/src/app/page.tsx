import { auth } from "@/lib/auth";
import { SyncWizard } from "@/features/sync-wizard/components/SyncWizard";
import { UserMenu } from "@/components/UserMenu";
import { createClient } from "@supabase/supabase-js";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

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
    <main className="min-h-screen p-8 md:p-16 max-w-5xl mx-auto space-y-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(29,185,84,0.3)]">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Spot2Tube<span className="text-primary">Sync</span></h1>
            <p className="text-gray-400">Migrate your playlists seamlessly</p>
          </div>
        </Link>
        
        {session?.user && (
          <UserMenu
            name={session.user.name || session.user.email || "User"}
            image={session.user.image ?? null}
          />
        )}
      </header>

      {/* Main Content Area */}
      {/* Main Content Area */}
      {/* Main Content Area */}
      <SyncWizard 
        spotifyLinked={spotifyLinked} 
        googleLinked={googleLinked} 
      />
    </main>
  );
}

