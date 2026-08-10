"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Play, Music2 } from "lucide-react";
import Image from "next/image";

export interface SyncJobPlaylist {
  id: string;
  name: string;
  image?: string;
  tracksCount: number;
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
            if (onComplete) setTimeout(onComplete, 2000);
            return totalTracks;
          }
          return next;
        });
      }, 300);
      return () => clearInterval(timer);
    }
  }, [processedTracks, totalTracks, onComplete]);

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
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-6">
        
        {/* Source -> Destination Visual */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="w-16 h-16 bg-[#1DB954] rounded-2xl flex items-center justify-center text-black">
            <Music2 className="w-8 h-8" />
          </div>
          <div className="text-2xl font-bold text-gray-400">➔</div>
          <div className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center text-white">
            <Play className="w-8 h-8 ml-1" fill="currentColor" />
          </div>
        </div>

        {isComplete ? (
          <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 text-4xl md:text-5xl font-bold text-white">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              Transfer Complete!
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Transferring your music</h1>
            <p className="text-lg text-gray-400">Lay back while we transfer your music</p>
          </>
        )}
      </div>

      <div className="bg-[#1A1A2E] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Progress Section */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <p className="text-sm font-medium text-gray-300">
              Processed: {processedTracks} out of {totalTracks} tracks
            </p>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ED760] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Playlist Cards */}
        <div className="space-y-4">
          {playlists.map((playlist) => {
            const isExpanded = expandedCards.has(playlist.id);
            // Distribute processed tracks among playlists for the visual count
            // Simple allocation logic for display purposes
            const playlistFraction = totalTracks > 0 ? playlist.tracksCount / totalTracks : 0;
            const simulatedPlaylistProcessed = isComplete ? playlist.tracksCount : Math.min(playlist.tracksCount, Math.floor(processedTracks * playlistFraction));

            return (
              <div key={playlist.id} className="bg-white/5 rounded-2xl overflow-hidden transition-all duration-300 border border-white/5 hover:bg-white/10">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(playlist.id)}
                >
                  <div className="flex items-center gap-4">
                    {playlist.image ? (
                      <Image 
                        src={playlist.image} 
                        alt={playlist.name} 
                        width={48} 
                        height={48} 
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-white font-medium">{playlist.name}</h4>
                      <p className="text-xs text-gray-500">{playlist.tracksCount} selected</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {isComplete ? (
                      <span className="text-green-500 font-bold text-sm">+{playlist.tracksCount} Successfully transferred</span>
                    ) : (
                      <span className="text-gray-400 font-medium text-sm">{simulatedPlaylistProcessed} / {playlist.tracksCount}</span>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Content Area */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20 text-sm text-gray-400">
                    <div className="p-4 text-center rounded-xl border border-white/5 bg-white/5">
                      <p>Track details are processed in the background.</p>
                      <p className="text-xs mt-1 text-gray-500">Wait for the transfer to complete to see all tracks in your YouTube Music library.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
