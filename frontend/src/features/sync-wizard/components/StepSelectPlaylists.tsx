"use client";

import { useEffect, useState } from "react";
import { getSpotifyPlaylists } from "@/features/spotify/actions";
import { Loader2, CheckSquare, Square, Music, ArrowRight } from "lucide-react";

export interface MappedPlaylist {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks?: { total: number };
}

interface StepSelectPlaylistsProps {
  onNext: (selected: MappedPlaylist[]) => void;
  initialSelected?: string[]; // IDs of initially selected playlists
}

export function StepSelectPlaylists({ onNext, initialSelected = [] }: StepSelectPlaylistsProps) {
  const [playlists, setPlaylists] = useState<MappedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track selected IDs
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
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(playlists.map(p => p.id))); // Select all
    }
  };

  const handleChooseDestination = () => {
    const selectedPlaylists = playlists.filter(p => selectedIds.has(p.id));
    onNext(selectedPlaylists);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <Loader2 className="w-12 h-12 text-[#1DB954] animate-spin" />
        <p className="text-gray-400">Loading your Spotify playlists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-20">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl inline-block">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Select Playlists</h1>
        <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">STEP 3/5</p>
      </div>

      <div className="bg-[#1A1A2E] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Your Library</h2>
            <p className="text-sm text-gray-400">{playlists.length} playlists found</p>
          </div>
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {selectedIds.size === playlists.length ? (
              <><CheckSquare className="w-5 h-5 text-[#1DB954]" /> Deselect All</>
            ) : (
              <><Square className="w-5 h-5" /> Select All</>
            )}
          </button>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {playlists.map(playlist => {
            const isSelected = selectedIds.has(playlist.id);
            return (
              <div
                key={playlist.id}
                onClick={() => toggleSelection(playlist.id)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors border ${
                  isSelected 
                    ? "bg-[#1DB954]/10 border-[#1DB954]/50" 
                    : "bg-white/5 border-transparent hover:bg-white/10"
                }`}
              >
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckSquare className="w-6 h-6 text-[#1DB954]" />
                  ) : (
                    <Square className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                {playlist.images?.[0]?.url ? (
                  <img src={playlist.images[0].url} alt={playlist.name} className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white/50" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-400">{playlist.tracks?.total ?? 0} tracks</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleChooseDestination}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-8 py-4 bg-[#635BFF] hover:bg-[#736BFF] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg"
          >
            Choose Destination <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
