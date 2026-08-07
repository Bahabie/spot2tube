"use client";

import { useState } from "react";
import { Music2, Play, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { MappedPlaylist } from "./StepSelectPlaylists";
import { startSyncJob } from "@/features/sync-job/api";

interface StepReviewProps {
  selectedPlaylists: MappedPlaylist[];
  onComplete: () => void;
}

export function StepReview({ selectedPlaylists, onComplete }: StepReviewProps) {
  const [isTransferring, setIsTransferring] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalTracks = selectedPlaylists.reduce((acc, curr) => acc + (curr.tracksCount ?? 0), 0);

  const handleStartTransfer = async () => {
    setIsTransferring(true);
    setError(null);
    try {
      // Enqueue a sync job for each selected playlist
      // We pass 0 for searchAlgo to default to direct string matches
      for (const playlist of selectedPlaylists) {
        await startSyncJob(playlist.id, playlist.name, 0);
      }
      
      setCompleted(true);
      
      // Delay briefly to show the success state before calling onComplete 
      // (which handles routing to the dashboard/resetting the wizard)
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed to start. Please try again.");
    } finally {
      setIsTransferring(false);
    }
  };

  if (completed) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6 py-20 animate-in zoom-in duration-500">
        <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-4xl font-bold text-white">Migration Started!</h2>
        <p className="text-gray-400">Your playlists are now being synced in the background. Check your dashboard for tracking.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Review & Transfer</h1>
        <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">STEP 5/5</p>
      </div>

      <div className="bg-[#1A1A2E] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          {/* Source */}
          <div className="flex-1 flex flex-col items-center p-6 bg-white/5 rounded-2xl w-full">
            <div className="p-4 bg-[#1DB954] rounded-full text-black mb-4">
              <Music2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Spotify</h3>
            <p className="text-gray-400 text-sm mt-2">{selectedPlaylists.length} playlists</p>
            <p className="text-gray-500 text-xs">{totalTracks} tracks</p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center px-4">
            <ArrowRight className="w-8 h-8 text-gray-500" />
          </div>

          {/* Destination */}
          <div className="flex-1 flex flex-col items-center p-6 bg-white/5 rounded-2xl w-full">
            <div className="p-4 bg-[#FF0000] rounded-full text-white mb-4">
              <Play className="w-8 h-8" fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-white">YouTube Music</h3>
            <p className="text-gray-400 text-sm mt-2">Destination</p>
          </div>
          
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleStartTransfer}
            disabled={isTransferring}
            className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#1DB954] to-[#1ED760] hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 text-black font-extrabold text-lg rounded-full transition-all shadow-[0_0_20px_rgba(29,185,84,0.4)]"
          >
            {isTransferring ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Transferring...</>
            ) : (
              "Start Transfer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
