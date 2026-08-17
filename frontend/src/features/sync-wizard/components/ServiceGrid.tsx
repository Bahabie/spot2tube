"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface ServiceGridProps {
  title: string;
  stepText: string;
  onSelectService: (serviceId: string) => void;
  activeServiceId?: string; // which service is clickable in this step
}

export function ServiceGrid({ title, stepText, onSelectService, activeServiceId }: ServiceGridProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const services = [
    { 
      id: "spotify", 
      name: "Spotify", 
      description: "Transfer from your Spotify account",
      icon: (
        <svg 
          viewBox="0 0 24 24" 
          className="w-14 h-14 fill-[#F3F4F6] transition-all duration-500 group-hover:fill-[#1DB954] group-hover:drop-shadow-[0_0_25px_rgba(29,185,84,0.6)]"
        >
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z" />
        </svg>
      ), 
      brandColor: "#1DB954",
      glowColor: "rgba(29, 185, 84, 0.15)"
    },
    { 
      id: "youtube", 
      name: "YouTube Music", 
      description: "Sync to your YouTube Music account",
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-14 h-14 fill-[#F3F4F6] transition-all duration-300 group-hover:fill-[#FF0000] group-hover:drop-shadow-[0_0_25px_rgba(255,0,0,0.5)]"
        >
          <path d="M12 0A12 12 0 1 0 12 24A12 12 0 1 0 12 0ZM12 19.3A7.3 7.3 0 1 1 12 4.7A7.3 7.3 0 1 1 12 19.3ZM12 6A6 6 0 1 0 12 18A6 6 0 1 0 12 6ZM10 9.8L15.3 12L10 14.2V9.8Z" />
        </svg>
      ), 
      brandColor: "#FF0000",
      glowColor: "rgba(255, 0, 0, 0.15)"
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 py-8">
      <div className="text-center space-y-6 relative">
        <div className="inline-block mb-2">
          <span className="inline-flex items-center rounded-full bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] ring-1 ring-white/10 backdrop-blur-md font-satoshi">
            {stepText}
          </span>
        </div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-extrabold leading-none tracking-tighter text-[#F3F4F6] drop-shadow-sm font-cabinet">
          {title}
        </h1>
        <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] max-w-2xl mx-auto font-satoshi">
          Select the music service you want to transfer your playlists from. Your library remains untouched and secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 px-4">
        {services.map((svc) => {
          const isActive = activeServiceId ? activeServiceId === svc.id : true;
          const isHoveredByOther = hoveredCardId !== null && hoveredCardId !== svc.id;
          
          return (
            <GlassCard
              key={svc.id}
              {...svc}
              isActive={isActive}
              isHoveredByOther={isHoveredByOther}
              onClick={() => isActive && onSelectService(svc.id)}
              onMouseEnter={() => setHoveredCardId(svc.id)}
              onMouseLeave={() => setHoveredCardId(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
