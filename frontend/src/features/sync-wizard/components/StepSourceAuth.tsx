"use client";

import { useRef } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

interface StepSourceAuthProps {
  onNext: () => void;
  isAuthenticated: boolean;
}

export function StepSourceAuth({ onNext, isAuthenticated }: StepSourceAuthProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition(cardRef);

  const handleLoadFromAccount = () => {
    if (isAuthenticated) {
      onNext();
    } else {
      signIn("spotify", { callbackUrl: "/?step=3" });
    }
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
          <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md">
            STEP 2/5 • CONNECT
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm">
          Transfer your music from <span className="text-[#1DB954] drop-shadow-[0_0_25px_rgba(29,185,84,0.3)]">Spotify</span>
        </h1>
        <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] max-w-2xl mx-auto">
          Connect your account securely or use a public playlist URL to proceed.
        </p>
      </div>

      <div 
        ref={cardRef}
        className="group relative bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 ring-1 ring-inset ring-white/10 hover:ring-white/20 transition-all duration-500 overflow-hidden"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 185, 84, 0.1), transparent 40%)`,
          }}
        />

        <div className="flex flex-col md:flex-row items-stretch gap-12 md:gap-16 relative z-10">
          
          {/* Left Side: Account Load */}
          <div className="flex-1 w-full flex flex-col items-center justify-center text-center space-y-8 group/left">
            <div className="p-8 rounded-[2rem] bg-white/5 ring-1 ring-white/10 shadow-lg transition-transform duration-500 group-hover/left:-translate-y-2 group-hover/left:bg-white/10">
              <svg 
                viewBox="0 0 24 24" 
                className="w-16 h-16 fill-[#F3F4F6] transition-all duration-500 group-hover/left:fill-[#1DB954] group-hover/left:drop-shadow-[0_0_25px_rgba(29,185,84,0.6)]"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
              </svg>
            </div>
            <button
              onClick={handleLoadFromAccount}
              className="w-full max-w-sm py-4 px-6 bg-white/5 hover:bg-white/10 text-[#F3F4F6] font-semibold rounded-2xl transition-all duration-300 ring-1 ring-white/10 hover:ring-[#1DB954]/80 hover:shadow-[0_0_20px_rgba(29,185,84,0.3)] hover:-translate-y-1"
            >
              Connect Spotify Account
            </button>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center justify-center relative w-px bg-white/10">
            <span className="absolute bg-[#0f0f11] px-5 py-2.5 text-xs font-bold text-[#A1A1AA] tracking-widest uppercase rounded-full ring-1 ring-white/10 backdrop-blur-xl">
              OR
            </span>
          </div>
          <div className="flex md:hidden items-center justify-center relative w-full h-px bg-white/10 my-8">
            <span className="absolute bg-[#0f0f11] px-5 py-2.5 text-xs font-bold text-[#A1A1AA] tracking-widest uppercase rounded-full ring-1 ring-white/10 backdrop-blur-xl">
              OR
            </span>
          </div>

          {/* Right Side: URL Load */}
          <div className="flex-1 w-full flex flex-col justify-center space-y-6 group/right">
            <div>
              <label className="block text-base font-medium text-[#F3F4F6] ml-1 mb-3">
                Paste public playlist URL
              </label>
              <input
                type="text"
                placeholder="https://open.spotify.com/playlist/..."
                className="w-full bg-white/5 border border-transparent ring-1 ring-inset ring-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50 focus:bg-white/10 transition-all duration-300 shadow-inner"
              />
            </div>
            <button
              className="w-full py-4 px-6 bg-white/5 text-[#A1A1AA] font-semibold rounded-2xl transition-all duration-300 ring-1 ring-white/10 cursor-not-allowed opacity-50"
              disabled
            >
              Load from URL
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
