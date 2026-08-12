"use client";

import { useEffect, useState } from "react";
import { getSpotifyPlaylists } from "@/features/spotify/actions";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PlaylistRow } from "./PlaylistRow";

export interface MappedPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracksCount?: number;
}

interface StepSelectPlaylistsProps {
  onNext: (selected: MappedPlaylist[]) => void;
  initialSelected?: string[];
}

export function StepSelectPlaylists({ onNext, initialSelected = [] }: StepSelectPlaylistsProps) {
  const [playlists, setPlaylists] = useState<MappedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelected));

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const data = await getSpotifyPlaylists();
        setPlaylists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    }
    loadPlaylists();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === playlists.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(playlists.map(p => p.id)));
    }
  };

  const handleChooseDestination = () => {
    const selectedPlaylists = playlists.filter(p => selectedIds.has(p.id));
    onNext(selectedPlaylists);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-32 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-[#1DB954] animate-spin" />
        <p className="text-[#A1A1AA] font-medium tracking-wide">Connecting to Spotify Library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-20 animate-in fade-in duration-500">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl inline-block backdrop-blur-md">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

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
            STEP 3/5 • SELECT PLAYLISTS
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm font-cabinet">
          Select Playlists
        </h1>
        <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] max-w-2xl mx-auto font-satoshi">
          Choose the playlists you want to transfer to your destination service.
        </p>
      </div>

      <div 
        className="bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 ring-1 ring-inset ring-white/10 shadow-2xl space-y-8 overflow-hidden"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#F3F4F6] font-cabinet">Your Library</h2>
              <p className="text-sm font-medium text-[#A1A1AA] mt-1 font-satoshi">{playlists.length} playlists found</p>
          </div>
          <button
            onClick={selectAll}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
              selectedIds.size === playlists.length && playlists.length > 0
                ? "bg-[#1DB954]/10 ring-1 ring-[#1DB954] text-[#1DB954] shadow-[0_0_15px_rgba(29,185,84,0.15)]"
                : "bg-white/5 ring-1 ring-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {selectedIds.size === playlists.length && playlists.length > 0 ? "Deselect All" : "Select All"}
          </button>
        </div>

        <motion.div 
          className="space-y-1 max-h-[55vh] overflow-y-auto pr-4"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          initial="hidden"
          animate="visible"
        >
          {playlists.map(playlist => (
            <PlaylistRow 
              key={playlist.id} 
              playlist={playlist} 
              isSelected={selectedIds.has(playlist.id)} 
              onToggle={toggleSelection} 
            />
          ))}
        </motion.div>

        <div className="pt-6 flex justify-end border-t border-white/5 mt-8">
          <button
            onClick={handleChooseDestination}
            disabled={selectedIds.size === 0}
            className="group flex items-center gap-3 px-8 py-4 bg-[#F3F4F6] hover:bg-white disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed text-[#0A0A0B] font-bold rounded-2xl transition-all shadow-lg text-lg"
          >
            Choose Destination 
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
