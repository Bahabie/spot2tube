"use client";

import { signIn } from "next-auth/react";
import { Music2, LogIn } from "lucide-react";

// YouTube icon removed from lucide-react v1.x (brand icons dropped).
// Inline SVG replacement using the official YouTube play-button path.
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

interface LoginButtonProps {
  provider: "spotify" | "google";
  label: string;
  isLinked?: boolean;
}

export function LoginButton({ provider, label, isLinked }: LoginButtonProps) {
  const handleSignIn = () => {
    // If it's already linked, no need to sign in again, or maybe reconnect
    signIn(provider, { callbackUrl: "/" });
  };

  if (isLinked) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl glass-panel bg-white/5 border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${provider === "spotify" ? "bg-[#1DB954]/20 text-[#1DB954]" : "bg-[#FF0000]/20 text-[#FF0000]"}`}>
            {provider === "spotify" ? <Music2 className="w-5 h-5" /> : <YoutubeIcon className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-semibold text-white">{label}</p>
            <p className="text-sm text-green-400">Connected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className={`group relative flex items-center justify-between w-full p-4 rounded-xl overflow-hidden hover-lift border border-white/5 ${
        provider === "spotify" ? "bg-[#1DB954]/10 hover:bg-[#1DB954]/20" : "bg-[#FF0000]/10 hover:bg-[#FF0000]/20"
      } transition-colors duration-300`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      <div className="flex items-center gap-3 relative z-10">
        <div className={`p-2 rounded-full ${provider === "spotify" ? "bg-[#1DB954] text-black" : "bg-[#FF0000] text-white"}`}>
          {provider === "spotify" ? <Music2 className="w-5 h-5" /> : <YoutubeIcon className="w-5 h-5" />}
        </div>
        <span className="font-semibold text-white">Connect {label}</span>
      </div>
      <LogIn className="w-5 h-5 text-white/50 group-hover:text-white transition-colors relative z-10" />
    </button>
  );
}
