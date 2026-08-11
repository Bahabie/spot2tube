import { motion, Variants } from "framer-motion";
import { Music, Check } from "lucide-react";
import type { MappedPlaylist } from "./StepSelectPlaylists";

interface PlaylistRowProps {
  playlist: MappedPlaylist;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function PlaylistRow({ playlist, isSelected, onToggle }: PlaylistRowProps) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={() => onToggle(playlist.id)}
      className="group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 border-b border-white/5 hover:bg-white/[0.04] hover:translate-x-1"
    >
      {/* Custom Checkbox */}
      <div 
        className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-300 ring-1 ring-inset ${
          isSelected 
            ? "bg-[#1DB954] ring-transparent" 
            : "bg-white/5 ring-white/20 group-hover:ring-white/40"
        }`}
      >
        <div className={`transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-0"}`}>
          <Check className="w-4 h-4 text-[#0A0A0B] stroke-[3]" />
        </div>
      </div>
      
      {/* Playlist Cover */}
      {playlist.images?.[0]?.url ? (
        <img 
          src={playlist.images[0].url} 
          alt={playlist.name} 
          className="w-12 h-12 rounded-md object-cover shadow-sm ring-1 ring-white/10" 
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center ring-1 ring-white/10">
          <Music className="w-6 h-6 text-white/50" />
        </div>
      )}
      
      {/* Playlist Info */}
      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold text-[#F3F4F6] truncate transition-colors group-hover:text-white">
          {playlist.name}
        </h3>
        <p className="text-sm text-[#A1A1AA]">{playlist.tracksCount ?? 0} tracks</p>
      </div>
    </motion.div>
  );
}
