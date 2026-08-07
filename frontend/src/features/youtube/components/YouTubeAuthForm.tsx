"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

export function YouTubeAuthForm() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Connect <span className="text-[#FF0000]">YouTube Music</span>
        </h1>
        <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">STEP 4/5</p>
      </div>

      <div className="bg-[#1A1A2E] rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-8 max-w-md mx-auto">
          <p className="text-gray-300 text-lg">
            We'll use your Google Account to safely transfer and sync playlists directly to your YouTube Music library.
          </p>
          
          <button
            onClick={() => signIn("google", { callbackUrl: "/?step=5" })}
            className="w-full py-4 px-8 bg-[#FF0000] hover:bg-[#FF3333] text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-[#FF0000]/50 flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Connect YouTube Music (Google)
          </button>
        </div>
      </div>
    </div>
  );
}
