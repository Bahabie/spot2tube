"use client";

import { signIn } from "next-auth/react";
import { AlertTriangle, ArrowRight, Music2 } from "lucide-react";

// Inline YouTube icon (brand icons removed from lucide-react v1.x).
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

interface ConnectBannerProps {
  provider: "spotify" | "google";
}

export function ConnectBanner({ provider }: ConnectBannerProps) {
  const isSpotify = provider === "spotify";
  const label = isSpotify ? "Spotify" : "YouTube Music";
  const accentColor = isSpotify ? "#1DB954" : "#FF0000";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 md:p-6"
      style={{
        borderColor: `${accentColor}40`,
        background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="shrink-0 p-2.5 rounded-xl"
            style={{ backgroundColor: `${accentColor}25` }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div>
            <p className="font-semibold text-white">
              Connect {label} to start syncing
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              {isSpotify
                ? "Link your Spotify account so we can read your playlists."
                : "Link your YouTube Music account so we can create playlists for you."}
            </p>
          </div>
        </div>

        <button
          onClick={() => signIn(provider, { callbackUrl: "/" })}
          className="group shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: accentColor }}
        >
          {isSpotify ? (
            <Music2 className="w-4 h-4" />
          ) : (
            <YoutubeIcon className="w-4 h-4" />
          )}
          <span>Connect {label}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
