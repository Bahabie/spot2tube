import { auth } from "@/lib/auth";
import { LoginButton } from "@/features/auth/components/LoginButton";
import { PlaylistSelector } from "@/features/spotify/components/PlaylistSelector";
import { ProgressBar } from "@/features/sync-job/components/ProgressBar";
import { createClient } from "@supabase/supabase-js";
import { Music, RefreshCw } from "lucide-react";

export default async function Home() {
  const session = await auth();
  
  let spotifyLinked = false;
  let googleLinked = false;

  if (session?.user?.id) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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

  const bothLinked = spotifyLinked && googleLinked;

  return (
    <main className="min-h-screen p-8 md:p-16 max-w-5xl mx-auto space-y-12">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-[0_0_20px_rgba(29,185,84,0.3)]">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Spot2Tube<span className="text-primary">Sync</span></h1>
            <p className="text-gray-400">Migrate your playlists seamlessly</p>
          </div>
        </div>
        
        {session?.user && (
          <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/10">
            {session.user.image ? (
              <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Music className="w-4 h-4" /></div>
            )}
            <span className="text-sm font-medium">{session.user.name || session.user.email}</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {!session ? (
        <section className="max-w-md mx-auto space-y-8 text-center mt-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Welcome Back</h2>
            <p className="text-gray-400">Sign in to sync your favorite music across platforms.</p>
          </div>
          <div className="space-y-4">
            <LoginButton provider="spotify" label="Spotify" />
            <LoginButton provider="google" label="YouTube Music" />
          </div>
        </section>
      ) : !bothLinked ? (
        <section className="max-w-md mx-auto space-y-8 mt-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Connect your accounts</h2>
            <p className="text-gray-400">We need access to both platforms to migrate your playlists.</p>
          </div>
          <div className="space-y-4">
            <LoginButton provider="spotify" label="Spotify" isLinked={spotifyLinked} />
            <LoginButton provider="google" label="YouTube Music" isLinked={googleLinked} />
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PlaylistSelector />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ProgressBar userId={session.user.id} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
