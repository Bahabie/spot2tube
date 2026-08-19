"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

interface Props {
  isConnected: boolean;
  onNext: () => void;
}

export function SpotifyAuthForm({ isConnected, onNext }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition(cardRef);

  const handleConnect = () => {
    if (isConnected) {
      onNext();
    } else {
      signIn("spotify", { callbackUrl: "/?step=5" });
    }
  };

  const handleSwitchAccount = () => {
    signIn("spotify", { callbackUrl: "/?step=5" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto space-y-16 py-8"
    >
      <div className="text-center space-y-6 relative">
        <div className="inline-block mb-2">
          <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md font-satoshi">
            STEP 4/5 • CONNECT SPOTIFY
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm font-cabinet">
          Connect <span className="text-[#1DB954] drop-shadow-[0_0_25px_rgba(29,185,84,0.3)]">Spotify</span>
        </h1>
        <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] max-w-2xl mx-auto font-satoshi">
          Authorize Spot2Tube to safely recreate your playlists on your Spotify account.
        </p>
      </div>

      <div
        ref={cardRef}
        className={`group relative max-w-2xl mx-auto bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 ring-1 ring-inset transition-all duration-500 overflow-hidden ${
          isConnected
            ? "ring-green-500/30 hover:ring-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.05)]"
            : "ring-white/10 hover:ring-white/20"
        }`}
        style={{ transform: "translateZ(0)" }}
      >
        {/* Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: isConnected
              ? `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.08), transparent 40%)`
              : `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 185, 84, 0.08), transparent 40%)`,
          }}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-10 relative z-10">
          {isConnected ? (
            <>
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-green-500/10 ring-1 ring-green-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-green-400 stroke-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400 font-bold text-xl font-satoshi px-4 tracking-tight">
                  Successfully Connected your Spotify Account
                </p>
              </div>

              <div className="w-full flex flex-col items-center gap-4">
                <button
                  onClick={handleConnect}
                  className="w-full max-w-sm flex items-center justify-center gap-3 py-4 px-6 bg-white/5 hover:bg-white/10 text-[#F3F4F6] font-semibold rounded-2xl transition-all duration-300 ring-1 ring-white/10 hover:ring-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:-translate-y-1 font-satoshi"
                >
                  Continue to Next Step
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={handleSwitchAccount}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-satoshi underline underline-offset-4 mt-2"
                >
                  Connect a different account
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-8 rounded-[2rem] bg-white/5 ring-1 ring-white/10 shadow-lg transition-transform duration-500 group-hover:-translate-y-2 group-hover:bg-white/10">
                <svg viewBox="0 0 24 24" className="w-16 h-16 fill-[#F3F4F6] transition-all duration-500 group-hover:fill-[#1DB954] group-hover:drop-shadow-[0_0_25px_rgba(29,185,84,0.6)]">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
                </svg>
              </div>
              
              <div className="w-full flex flex-col items-center gap-4">
                <button
                  onClick={handleConnect}
                  className="w-full max-w-sm flex items-center justify-center gap-3 py-4 px-6 bg-white/5 hover:bg-white/10 text-[#F3F4F6] font-semibold rounded-2xl transition-all duration-300 ring-1 ring-white/10 hover:ring-[#1DB954]/80 hover:shadow-[0_0_20px_rgba(29,185,84,0.3)] hover:-translate-y-1 font-satoshi"
                >
                  Connect your Spotify Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
