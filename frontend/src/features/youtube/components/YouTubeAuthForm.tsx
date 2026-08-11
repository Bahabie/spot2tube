"use client";

import { useRef } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

export function YouTubeAuthForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition(cardRef);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto space-y-12 py-8"
    >
      <div className="text-center space-y-6 relative">
        <div className="inline-block mb-2">
          <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md">
            STEP 4/5 • SELECT DESTINATION
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm">
          Connect <span className="text-[#FF0000] drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]">YouTube Music</span>
        </h1>
      </div>

      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        ref={cardRef}
        className="group relative bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-12 md:p-16 border border-transparent ring-1 ring-inset ring-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl mx-auto max-w-2xl"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Spotlight Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 0, 0, 0.08), transparent 40%)`,
          }}
        />
        
        <div className="relative z-10 text-center space-y-10 max-w-md mx-auto">
          <div className="p-6 bg-white/5 rounded-full inline-flex items-center justify-center ring-1 ring-white/10 shadow-lg mb-2">
             <svg
              viewBox="0 0 24 24"
              className="w-16 h-16 fill-[#F3F4F6]"
            >
              <path d="M12 0A12 12 0 1 0 12 24A12 12 0 1 0 12 0ZM12 19.3A7.3 7.3 0 1 1 12 4.7A7.3 7.3 0 1 1 12 19.3ZM12 6A6 6 0 1 0 12 18A6 6 0 1 0 12 6ZM10 9.8L15.3 12L10 14.2V9.8Z" />
            </svg>
          </div>

          <p className="text-zinc-400 text-lg leading-relaxed font-medium">
            We&apos;ll use your Google Account to safely transfer and sync playlists directly to your YouTube Music library.
          </p>
          
          <button
            onClick={() => signIn("google", { callbackUrl: "/?step=5" })}
            className="group/btn w-full py-4 px-8 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all duration-300 ring-1 ring-white/10 hover:ring-[#FF0000]/70 shadow-lg hover:shadow-[0_0_20px_rgba(255,0,0,0.2)] hover:-translate-y-1 flex items-center justify-center text-lg"
          >
            Connect YouTube Music
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
