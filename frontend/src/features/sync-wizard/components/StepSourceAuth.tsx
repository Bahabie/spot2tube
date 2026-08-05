"use client";

import { signIn } from "next-auth/react";
import { Music2 } from "lucide-react";

interface StepSourceAuthProps {
  onNext: () => void;
  isAuthenticated: boolean;
}

export function StepSourceAuth({ onNext, isAuthenticated }: StepSourceAuthProps) {
  const handleLoadFromAccount = () => {
    if (isAuthenticated) {
      onNext();
    } else {
      signIn("spotify", { callbackUrl: "/?step=3" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Transfer your music from <span className="text-[#1DB954]">Spotify</span>
        </h1>
        <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">STEP 2/5</p>
      </div>

      <div className="bg-[#1A1A2E] rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          {/* Left Side: Account Load */}
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-4 bg-[#1DB954]/10 rounded-full text-[#1DB954]">
              <Music2 className="w-12 h-12" />
            </div>
            <button
              onClick={handleLoadFromAccount}
              className="w-full max-w-sm py-4 px-6 bg-[#635BFF] hover:bg-[#736BFF] text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-[#635BFF]/50"
            >
              Load from Spotify account
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center justify-center relative h-48 w-px bg-white/10">
            <span className="absolute bg-[#1A1A2E] px-4 py-2 text-xl font-bold text-white uppercase transform -translate-y-1/2 top-1/2">
              Or
            </span>
          </div>
          <div className="flex md:hidden items-center justify-center relative w-full h-px bg-white/10">
            <span className="absolute bg-[#1A1A2E] px-4 py-2 text-xl font-bold text-white uppercase">
              Or
            </span>
          </div>

          {/* Right Side: URL Load */}
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Copy Spotify playlist URL and paste here:
              </label>
              <input
                type="text"
                placeholder="Paste Spotify playlist URL here"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50"
              />
            </div>
            <button
              className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all cursor-not-allowed opacity-50"
              disabled
            >
              Load from URL
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
