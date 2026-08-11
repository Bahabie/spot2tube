import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Disc3 } from "lucide-react";
import Image from "next/image";

export type TrackStatus = "pending" | "success" | "failed";

export interface TrackItem {
  id: string;
  name: string;
  artist: string;
  status: TrackStatus;
  albumArt?: string;
}

interface TrackListProps {
  tracks: TrackItem[];
}

export function TrackList({ tracks }: TrackListProps) {
  return (
    <div className="px-5 pb-5 pt-0">
      <div className="flex flex-col border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden">
        <AnimatePresence mode="popLayout">
          {tracks.map((track) => (
            <TrackListItem key={track.id} track={track} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TrackListItem({ track }: { track: TrackItem }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center justify-between p-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {track.albumArt ? (
          <Image src={track.albumArt} alt={track.name} width={40} height={40} className="rounded-md shadow-sm object-cover" />
        ) : (
          <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center shrink-0">
            <Disc3 className="w-5 h-5 text-[#A1A1AA]" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <p className="text-[#F3F4F6] text-sm font-medium truncate">{track.name}</p>
          <p className="text-zinc-500 text-xs truncate">{track.artist}</p>
        </div>
      </div>

      <div className="flex items-center flex-shrink-0 ml-4">
        {track.status === "pending" && (
          <span className="text-zinc-500 text-xs flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full" /> Pending...
          </span>
        )}
        {track.status === "success" && (
          <span className="text-[#1DB954] text-xs font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Synced
          </span>
        )}
        {track.status === "failed" && (
          <span className="text-red-400/80 text-xs flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Failed
          </span>
        )}
      </div>
    </motion.div>
  );
}
