"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";

interface Props {
  isConnected: boolean;
  onNext: () => void;
}

export function YouTubeAuthForm({ isConnected, onNext }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition(cardRef);

  const handleConnect = () => {
    if (isConnected) {
      onNext();
    } else {
      signIn("google", { callbackUrl: "/?step=5" });
    }
  };

  const handleSwitchAccount = () => {
    signIn("google", { callbackUrl: "/?step=5" });
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
            STEP 4/5 • CONNECT YOUTUBE MUSIC
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm font-cabinet">
          Connect <span className="text-[#FF0000] drop-shadow-[0_0_25px_rgba(255,0,0,0.3)]">YouTube Music</span>
        </h1>
        <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] max-w-2xl mx-auto font-satoshi">
          Authorize Spot2Tube to safely recreate your playlists on your Google account.
        </p>
      </div>

      <div
        ref={cardRef}
        className="group relative max-w-2xl mx-auto bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-16 ring-1 ring-inset ring-white/10 hover:ring-white/20 transition-all duration-500 overflow-hidden"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 0, 0, 0.08), transparent 40%)`,
          }}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-10 relative z-10 group/content">
          <div className="p-8 rounded-[2rem] bg-white/5 ring-1 ring-white/10 shadow-lg transition-transform duration-500 group-hover/content:-translate-y-2 group-hover/content:bg-white/10">
            <svg viewBox="0 0 24 24" className="w-16 h-16 fill-[#F3F4F6] transition-all duration-500 group-hover/content:fill-[#FF0000] group-hover/content:drop-shadow-[0_0_25px_rgba(255,0,0,0.6)]">
              <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.2C7.368 19.2 4.8 16.632 4.8 12S7.368 4.8 12 4.8 19.2 7.368 19.2 12 16.632 19.2 12 19.2zM9.6 15.6l6-3.6-6-3.6v7.2z" />
            </svg>
          </div>
          
          <div className="w-full flex flex-col items-center gap-4">
            <button
              onClick={handleConnect}
              className="w-full max-w-sm flex items-center justify-center gap-3 py-4 px-6 bg-white/5 hover:bg-white/10 text-[#F3F4F6] font-semibold rounded-2xl transition-all duration-300 ring-1 ring-white/10 hover:ring-[#FF0000]/80 hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:-translate-y-1 font-satoshi"
            >
              Connect your YouTube Music Account
              {isConnected && (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {isConnected && (
              <button
                onClick={handleSwitchAccount}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-satoshi underline underline-offset-4 mt-2"
              >
                Connect a different account
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
