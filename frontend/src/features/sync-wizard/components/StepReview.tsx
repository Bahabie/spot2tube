"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { MappedPlaylist } from "../types";
import { startSyncJob } from "@/features/sync-job/api";
import { SyncJobProgress, SyncJobPlaylist } from "@/features/sync-job/components/SyncJobProgress";

interface ExtendedPlaylist extends MappedPlaylist {
  jobId?: string;
}

interface StepReviewProps {
  selectedPlaylists: MappedPlaylist[];
  onComplete: () => void;
  sourceService?: "spotify" | "youtube";
}

export function StepReview({ selectedPlaylists, onComplete, sourceService = "spotify" }: StepReviewProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extendedPlaylists, setExtendedPlaylists] = useState<ExtendedPlaylist[]>(selectedPlaylists);

  // Sync state when selectedPlaylists changes (e.g. after hydration from sessionStorage)
  useEffect(() => {
    if (selectedPlaylists.length > 0 && extendedPlaylists.length === 0) {
      setExtendedPlaylists(selectedPlaylists);
    }
  }, [selectedPlaylists, extendedPlaylists.length]);

  const totalTracks = extendedPlaylists.reduce((acc, curr) => acc + (curr.tracksCount ?? 0), 0);

  const handleStartTransfer = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const updatedPlaylists = [...extendedPlaylists];
      // Enqueue a sync job for each selected playlist
      for (let i = 0; i < updatedPlaylists.length; i++) {
        const playlist = updatedPlaylists[i];
        const res = await startSyncJob(playlist.id, playlist.name, 0, sourceService);
        
        if (res.error) {
          throw new Error(res.error);
        }
        
        playlist.jobId = res.jobId;
      }
      setExtendedPlaylists(updatedPlaylists);
      
      setShowProgress(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed to start. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  if (showProgress) {
    const syncPlaylists: SyncJobPlaylist[] = extendedPlaylists.map(p => ({
      id: p.id,
      name: p.name,
      image: p.images?.[0]?.url,
      tracksCount: p.tracksCount ?? 0,
      jobId: p.jobId,
    }));
    return <SyncJobProgress playlists={syncPlaylists} onComplete={onComplete} />;
  }

  const spotifyIcon = (
    <svg 
      viewBox="0 0 24 24" 
      className="w-16 h-16 fill-[#F3F4F6] transition-all duration-300 group-hover:fill-[#1DB954] group-hover:drop-shadow-[0_0_25px_rgba(29,185,84,0.6)]"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
    </svg>
  );

  const youtubeIcon = (
    <svg
      viewBox="0 0 24 24"
      className="w-16 h-16 fill-[#F3F4F6] transition-all duration-300 group-hover:fill-[#FF0000] group-hover:drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]"
    >
      <path d="M12 0A12 12 0 1 0 12 24A12 12 0 1 0 12 0ZM12 19.3A7.3 7.3 0 1 1 12 4.7A7.3 7.3 0 1 1 12 19.3ZM12 6A6 6 0 1 0 12 18A6 6 0 1 0 12 6ZM10 9.8L15.3 12L10 14.2V9.8Z" />
    </svg>
  );

  const isSourceSpotify = sourceService === "spotify";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto space-y-12 py-8"
    >
      <div className="text-center space-y-6 relative">
        <div className="inline-block mb-2">
          <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md font-satoshi">
            STEP 5/5 • REVIEW
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm font-cabinet">
          Review & Transfer
        </h1>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, scale: 0.98 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
        }}
        className="bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-transparent ring-1 ring-inset ring-white/10 shadow-2xl relative mx-auto max-w-4xl"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 relative z-10">
          
          {/* Source */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="group flex-1 flex flex-col items-center p-8 bg-white/[0.01] ring-1 ring-white/5 rounded-3xl w-full transition-all duration-300 hover:bg-white/[0.03] hover:ring-white/10"
          >
            <div className="mb-6">
              {isSourceSpotify ? spotifyIcon : youtubeIcon}
            </div>
            <h3 className="text-xl font-bold text-[#F3F4F6] font-cabinet">{isSourceSpotify ? "Spotify" : "YouTube Music"}</h3>
            <p className="text-[#A1A1AA] text-sm mt-2 font-satoshi">{selectedPlaylists.length} playlists</p>
            <p className="text-[#A1A1AA] text-xs font-semibold mt-1 font-satoshi">{totalTracks} tracks</p>
          </motion.div>

          {/* Animated Arrow */}
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
            className="hidden md:flex items-center justify-center px-2"
          >
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowRight className="w-8 h-8 text-[#A1A1AA]" />
            </motion.div>
          </motion.div>

          {/* Destination */}
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="group flex-1 flex flex-col items-center p-8 bg-white/[0.01] ring-1 ring-white/5 rounded-3xl w-full transition-all duration-300 hover:bg-white/[0.03] hover:ring-white/10"
          >
            <div className="mb-6">
              {!isSourceSpotify ? spotifyIcon : youtubeIcon}
            </div>
            <h3 className="text-xl font-bold text-[#F3F4F6] font-cabinet">{!isSourceSpotify ? "Spotify" : "YouTube Music"}</h3>
            <p className="text-[#A1A1AA] text-sm mt-2 font-satoshi">Destination</p>
          </motion.div>
          
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center backdrop-blur-md">
            <p className="text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        {selectedPlaylists.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center backdrop-blur-md">
            <p className="text-yellow-400 font-medium">No playlists selected. Please go back to Step 3 and select playlists to transfer.</p>
          </motion.div>
        )}

        <motion.div 
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <button
            onClick={handleStartTransfer}
            disabled={isStarting || selectedPlaylists.length === 0}
            className={`flex items-center gap-3 px-10 py-4 bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-[#F3F4F6] font-bold text-lg rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:scale-95 ${
              isSourceSpotify 
                ? "hover:ring-[#1DB954] hover:shadow-[0_0_20px_rgba(29,185,84,0.3)]" 
                : "hover:ring-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]"
            }`}
          >
            {isStarting ? (
              <><Loader2 className={`w-5 h-5 animate-spin ${isSourceSpotify ? 'text-[#1DB954]' : 'text-[#FF0000]'}`} /> Starting Transfer...</>
            ) : (
              "Start Transfer"
            )}
          </button>
          
          {selectedPlaylists.length === 0 && (
             <button
                onClick={onComplete}
                className="text-sm text-[#A1A1AA] hover:text-white transition-colors"
             >
                Restart Wizard
             </button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
