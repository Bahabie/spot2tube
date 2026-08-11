"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { TrackList, TrackItem } from "./TrackList";

export interface SyncJobPlaylist {
  id: string;
  name: string;
  image?: string;
  tracksCount: number;
  tracks?: TrackItem[];
}

interface SyncJobProgressProps {
  playlists: SyncJobPlaylist[];
  onComplete?: () => void;
}

export function SyncJobProgress({ playlists, onComplete }: SyncJobProgressProps) {
  const [processedTracks, setProcessedTracks] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  const totalTracks = playlists.reduce((acc, curr) => acc + curr.tracksCount, 0);
  const isComplete = totalTracks > 0 && processedTracks >= totalTracks;

  useEffect(() => {
    // Simulate progress
    if (processedTracks < totalTracks) {
      const timer = setInterval(() => {
        setProcessedTracks((prev) => {
          const increment = Math.ceil(totalTracks / 20); // Finish in ~20 ticks
          const next = prev + increment;
          if (next >= totalTracks) {
            clearInterval(timer);
            // Bug Fix: DO NOT call onComplete() here automatically.
            // Wait for user to click "Start New Transfer"
            return totalTracks;
          }
          return next;
        });
      }, 300);
      return () => clearInterval(timer);
    }
  }, [processedTracks, totalTracks]);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedCards);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedCards(newSet);
  };

  const progressPercentage = totalTracks > 0 ? Math.round((processedTracks / totalTracks) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto space-y-12 py-8"
    >
      <div className="text-center space-y-8 relative">
        {/* Source -> Destination Visual */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-[#F3F4F6] transition-colors duration-500 hover:text-[#1DB954]">
            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
            </svg>
          </div>
          
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-[#A1A1AA]"
          >
            <ArrowRight className="w-8 h-8" />
          </motion.div>

          <div className="text-[#F3F4F6] transition-colors duration-500 hover:text-[#FF0000]">
            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current">
              <path d="M12 0A12 12 0 1 0 12 24A12 12 0 1 0 12 0ZM12 19.3A7.3 7.3 0 1 1 12 4.7A7.3 7.3 0 1 1 12 19.3ZM12 6A6 6 0 1 0 12 18A6 6 0 1 0 12 6ZM10 9.8L15.3 12L10 14.2V9.8Z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm">
          {isComplete ? "Transfer Complete!" : "Transferring Music"}
        </h1>
        <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] max-w-2xl mx-auto">
          {isComplete ? "Your playlists have been successfully synced to YouTube Music." : "Lay back while we securely transfer your playlists."}
        </p>
      </div>

      <div 
        className="bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 ring-1 ring-inset ring-white/10 shadow-2xl relative overflow-hidden"
        style={{ transform: "translateZ(0)" }}
      >
        <AnimatePresence>
          {isComplete && (
            <motion.div
              key="success-banner"
              initial={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", scale: 1, marginBottom: 40 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-6 py-8 relative bg-transparent border-none ring-0 shadow-none"
            >
              <motion.div
                initial={{ 
                  scale: 0.8, 
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(255, 255, 255, 1)", 
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.4)"
                }}
                animate={{ 
                  scale: 1, 
                  backgroundColor: "rgba(29, 185, 84, 0.1)", 
                  borderColor: "rgba(29, 185, 84, 1)",
                  boxShadow: "0 0 20px rgba(29, 185, 84, 0.4)"
                }}
                transition={{ 
                  duration: 0.7, 
                  ease: "easeOut",
                  scale: { type: "spring", delay: 0.1, bounce: 0.5 }
                }}
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 z-10"
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-10 h-10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ stroke: "#FFFFFF", fill: "rgba(255, 255, 255, 0.2)" }}
                  animate={{ stroke: "#1DB954", fill: "rgba(29, 185, 84, 0.2)" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </motion.svg>
              </motion.div>
              
              <div className="text-center z-10 bg-transparent">
                <h2 className="text-3xl font-bold text-[#F3F4F6] bg-transparent">Successfully Transferred</h2>
                <p className="text-sm text-[#A1A1AA] mt-2 bg-transparent">You can review the synced tracks below.</p>
              </div>
              
              <button
                onClick={onComplete}
                className="mt-4 px-8 py-4 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-[#F3F4F6] font-semibold rounded-full transition-all duration-300 hover:ring-[#1DB954]/50 hover:-translate-y-1 shadow-lg z-10"
              >
                Start New Transfer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="space-y-10">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#F3F4F6]">Overall Progress</span>
              <span className="text-[#A1A1AA]">{processedTracks} / {totalTracks} tracks</span>
            </div>
            
            {/* Thin sleek track */}
            <div className="w-full h-2 bg-white/5 ring-1 ring-inset ring-white/10 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full bg-[#1DB954] transition-all duration-500 ease-out rounded-full shadow-[0_0_15px_rgba(29,185,84,0.6)] ${!isComplete ? 'animate-pulse' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Playlist Cards */}
          <div className="space-y-4">
            {playlists.map((playlist) => {
              const isExpanded = expandedCards.has(playlist.id);
              const playlistFraction = totalTracks > 0 ? playlist.tracksCount / totalTracks : 0;
              const simulatedPlaylistProcessed = isComplete ? playlist.tracksCount : Math.min(playlist.tracksCount, Math.floor(processedTracks * playlistFraction));
              
              const fallbackTracks: TrackItem[] = Array.from({ length: Math.min(20, playlist.tracksCount || 20) }).map((_, i) => {
                const isProcessed = i < simulatedPlaylistProcessed;
                const isFailed = isProcessed && i % 15 === 14; 
                return {
                  id: `${playlist.id}-fallback-${i}`,
                  name: `Simulated Track ${i + 1}`,
                  artist: `Simulated Artist ${i + 1}`,
                  status: isProcessed ? (isFailed ? "failed" : "success") : "pending",
                };
              });

              const realTracks = playlist.tracks && playlist.tracks.length > 0 ? playlist.tracks : fallbackTracks;

              return (
                <div 
                  key={playlist.id} 
                  className="bg-white/[0.01] ring-1 ring-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:bg-white/[0.03] hover:ring-white/10"
                >
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(playlist.id)}
                  >
                    <div className="flex items-center gap-4">
                      {playlist.image ? (
                        <Image 
                          src={playlist.image} 
                          alt={playlist.name} 
                          width={48} 
                          height={48} 
                          className="rounded-lg object-cover shadow-md ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center ring-1 ring-white/10 shrink-0">
                           <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#A1A1AA]">
                             <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
                           </svg>
                        </div>
                      )}
                      <div>
                        <h4 className="text-[#F3F4F6] font-semibold text-lg">{playlist.name}</h4>
                        <p className="text-sm text-[#A1A1AA]">{playlist.tracksCount} tracks</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-[#A1A1AA] font-medium text-sm">
                        {simulatedPlaylistProcessed} / {playlist.tracksCount}
                      </span>
                      <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA]">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <TrackList tracks={realTracks} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
