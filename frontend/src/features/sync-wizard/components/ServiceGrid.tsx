"use client";

import { Music2, Play } from "lucide-react";

interface ServiceGridProps {
  title: string;
  stepText: string;
  onSelectService: (serviceId: string) => void;
  activeServiceId?: string; // which service is clickable in this step
}

export function ServiceGrid({ title, stepText, onSelectService, activeServiceId }: ServiceGridProps) {
  const services = [
    { id: "spotify", name: "Spotify", color: "bg-[#1DB954]", hover: "hover:bg-[#1DB954]" },
    { id: "youtube", name: "YouTube Music", color: "bg-[#FF0000]", hover: "hover:bg-[#FF0000]" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">{stepText}</p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-xl mx-auto">
          {services.map((svc) => {
            const isActive = activeServiceId === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => isActive && onSelectService(svc.id)}
                disabled={!isActive}
                className={`
                  relative flex flex-col items-center justify-center p-6 aspect-square rounded-3xl transition-all duration-300
                  ${isActive ? `bg-[#1A1A2E] ${svc.hover} cursor-pointer hover:scale-105 hover:shadow-2xl` : 'bg-[#1A1A2E]/50 opacity-50 cursor-not-allowed'}
                  ${isActive && svc.id === 'spotify' ? 'hover:shadow-[#1DB954]/50' : ''}
                  ${isActive && svc.id === 'youtube' ? 'hover:shadow-[#FF0000]/50' : ''}
                  border border-white/5
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  {svc.id === "spotify" ? (
                     <div className="p-3 bg-[#1DB954] rounded-full text-black">
                       <Music2 className="w-8 h-8" />
                     </div>
                  ) : svc.id === "youtube" ? (
                     <div className="p-3 bg-[#FF0000] rounded-full text-white">
                       <Play className="w-8 h-8" fill="currentColor" />
                     </div>
                  ) : null}
                  <span className={`font-semibold tracking-wide ${isActive ? 'text-white' : 'text-gray-500'}`}>{svc.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
