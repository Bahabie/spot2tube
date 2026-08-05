"use client";

import { useState } from "react";
import { syncPlaylistToYouTube } from "../actions";
import { ArrowRight, Loader2, Music } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks?: { total: number };
}

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setErrorMsg(null);
    try {
      await syncPlaylistToYouTube(playlist.id, playlist.name);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start sync.";
      console.error("[PlaylistCard] Sync failed:", message);
      setErrorMsg(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-4 rounded-xl glass-panel hover-lift bg-white/5 border-white/10 group">
        <div className="flex items-center gap-4">
          {playlist.images?.[0]?.url ? (
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
              className="w-16 h-16 rounded-lg object-cover shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
              <Music className="w-8 h-8 text-white/50" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg text-white group-hover:text-[#1DB954] transition-colors">
              {playlist.name}
            </h3>
            <p className="text-sm text-gray-400">{playlist.tracks?.total || 0} tracks</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sync <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {errorMsg && (
        <p className="text-sm text-red-400 px-4">{errorMsg}</p>
      )}
    </div>
  );
}

