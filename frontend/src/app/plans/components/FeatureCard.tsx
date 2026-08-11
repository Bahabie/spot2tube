"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export interface Feature {
  title: string;
  description: string;
  glowColor: string;
  image: string;
}

export function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative bg-white/[0.02] backdrop-blur-2xl ring-1 ring-inset ring-white/10 rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:ring-white/20 flex flex-col w-[85vw] sm:w-[350px] md:w-[400px] shrink-0 snap-center"
    >
      {/* Luxurious Purple/Indigo Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-indigo-500/15 group-hover:from-purple-500/30 group-hover:to-indigo-500/30 transition-all duration-700 pointer-events-none -z-10" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Visual Element Area Placeholder */}
        <div className="relative w-full h-[160px] mb-6 flex-shrink-0 flex items-center justify-center">
          <Image 
            src={feature.image} 
            alt={feature.title} 
            fill 
            className="object-contain drop-shadow-2xl p-2 z-10" 
          />
          <div className={`absolute w-32 h-32 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] ${feature.glowColor} to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
        
        <h4 className="text-xl font-bold text-white mb-3 font-['Cabinet_Grotesk',sans-serif]">{feature.title}</h4>
        <p className="text-zinc-400 text-sm leading-relaxed font-['Satoshi',sans-serif]">{feature.description}</p>
      </div>
    </motion.div>
  );
}
