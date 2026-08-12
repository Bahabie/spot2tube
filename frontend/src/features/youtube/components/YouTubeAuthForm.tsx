"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

interface Props {
  isConnected: boolean;
  onNext: () => void;
}

export function YouTubeAuthForm({ isConnected, onNext }: Props) {
  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto py-8 space-y-10"
      >
        <div className="text-center space-y-4">
          <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md font-satoshi">
            STEP 4/5 • CONNECT YOUTUBE MUSIC
          </span>
          <h1 className="text-5xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] font-cabinet">
            Connect{" "}
            <span className="text-[#FF0000] drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]">
              YouTube Music
            </span>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6 p-10 bg-white/[0.02] ring-1 ring-green-500/30 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.05)]">
          <div className="w-16 h-16 rounded-full bg-green-500/10 ring-1 ring-green-500/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-green-400 stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <p className="text-green-400 font-semibold text-lg font-satoshi">
              YouTube Music is connected
            </p>
            <p className="text-zinc-500 text-sm font-satoshi mb-4">
              Your Google account is linked and ready to receive playlists.
            </p>
          </div>
          
          <button
            onClick={onNext}
            className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-6 bg-[#F3F4F6] text-[#0A0A0B] font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-white hover:-translate-y-0.5 text-base font-satoshi"
          >
            Continue to Review
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl: "/?step=4" })}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-satoshi underline underline-offset-2 mt-2"
          >
            Connect a different account
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto py-8 space-y-10"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md font-satoshi">
          STEP 4/5 • CONNECT YOUTUBE MUSIC
        </span>
        <h1 className="text-5xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] font-cabinet">
          Connect{" "}
          <span className="text-[#FF0000] drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]">
            YouTube Music
          </span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto font-satoshi">
          Sign in with the Google account that has your YouTube Music library.
          One click — no technical steps required.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white/[0.02] ring-1 ring-white/10 rounded-3xl p-10 flex flex-col items-center gap-8 shadow-2xl">
        {/* YT Music icon */}
        <div className="p-5 bg-white/[0.03] rounded-full ring-1 ring-white/10">
          <svg viewBox="0 0 24 24" className="w-14 h-14 fill-[#FF0000]">
            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.2C7.368 19.2 4.8 16.632 4.8 12S7.368 4.8 12 4.8 19.2 7.368 19.2 12 16.632 19.2 12 19.2zM9.6 15.6l6-3.6-6-3.6v7.2z" />
          </svg>
        </div>

        <div className="text-center space-y-2">
          <p className="text-[#F3F4F6] font-semibold text-base font-satoshi">
            Authorize Spot2Tube to manage your playlists
          </p>
          <p className="text-zinc-500 text-sm font-satoshi leading-relaxed max-w-xs">
            We only create playlists and add tracks — we never read your private data or delete anything.
          </p>
        </div>

        <button
          id="ytmusic-connect-btn"
          onClick={() => signIn("google", { callbackUrl: "/?step=5" })}
          className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-white text-gray-800 font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-gray-50 text-base font-satoshi"
        >
          {/* Google G icon */}
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-zinc-600 text-xs text-center font-satoshi max-w-xs">
          By connecting, you agree that Spot2Tube can create and populate playlists on your YouTube Music account.
        </p>
      </div>
    </motion.div>
  );
}
