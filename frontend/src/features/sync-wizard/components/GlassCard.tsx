"use client";

import { useRef, ReactNode, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

interface GlassCardProps {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  brandColor: string; // e.g., "#1DB954"
  glowColor: string; // e.g., "rgba(29, 185, 84, 0.15)"
  isActive: boolean;
  isHoveredByOther: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function GlassCard({
  id,
  name,
  description,
  icon,
  brandColor,
  glowColor,
  isActive,
  isHoveredByOther,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mousePosition = useMousePosition(ref);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isActive) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    if (!isActive) return;
    setIsHovered(true);
    onMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    onMouseLeave();
  };

  const containerClasses = `
    group relative w-full aspect-square md:aspect-auto md:h-[26rem] transition-all duration-500
    ${!isActive ? "opacity-30 grayscale cursor-not-allowed pointer-events-none" : "cursor-pointer"}
    ${isActive && isHoveredByOther ? "opacity-50 saturate-50" : ""}
  `;

  return (
    <motion.div
      ref={ref}
      onClick={() => isActive && onClick()}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={containerClasses}
    >
      <div 
        className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 p-8 rounded-3xl overflow-hidden"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Spotlight Glow */}
        {isActive && (
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
            }}
          />
        )}
        
        {/* Card Content */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center h-full gap-8"
          style={{ transform: "translateZ(30px)" }}
        >
          <div 
            className="p-6 rounded-[2rem] bg-white/5 ring-1 ring-white/10 transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-white/10"
            style={{ 
              boxShadow: isHovered ? `0 10px 40px -10px ${brandColor}` : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            {icon}
          </div>
          
          <div className="space-y-4 text-center px-4 w-full">
            <h2 
              className={`text-3xl font-bold leading-tight tracking-[-0.02em] transition-colors duration-300 ${isHovered ? 'text-white' : 'text-[#A1A1AA]'}`}
            >
              {name}
            </h2>
            {isActive && (
              <div className="overflow-hidden h-[40px]">
                <p className="text-base font-medium leading-relaxed tracking-normal text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-8 group-hover:translate-y-0">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
