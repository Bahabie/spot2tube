"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const premiumFeatures = [
  {
    title: "Unlimited Music Transfer",
    description: "Transfer all your music to another platform. Move all your playlists and favorites between music services. No hassle, no worries.",
    glowColor: "from-[#1DB954]/30",
    image: "/card1_img.svg"
  },
  {
    title: "Share Across Platforms",
    description: "Share music with friends on any music service. Your friends are not using your music platform? No problem! They can now listen to your playlist.",
    glowColor: "from-purple-500/30",
    image: "/card2_img.svg"
  },
  {
    title: "Auto-Sync",
    description: "Daily monitoring between two platforms. Set a daily sync to keep your playlists constantly updated across other music platforms.",
    glowColor: "from-[#FF0000]/30",
    image: "/card3_img.svg"
  },
  {
    title: "Backup to Cloud",
    description: "Secure your entire music library. Never lose a playlist again with our automated daily cloud backups of all your tracks and favorites.",
    glowColor: "from-blue-500/30",
    image: "/card4_img.svg"
  }
];

export function FeatureCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <section className="w-full pt-4 pb-8">
      <div className="w-full px-6 md:px-12 xl:px-24 flex items-center justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F3F4F6] font-['Cabinet_Grotesk',sans-serif] tracking-tighter">
            Included in Premium
          </h2>
        </motion.div>

        {/* Carousel Navigation Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll(-350)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] backdrop-blur-xl ring-1 ring-white/10 text-white/70 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scroll(350)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.03] backdrop-blur-xl ring-1 ring-white/10 text-white/70 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pt-4 pb-8 -mt-4 pl-6 md:pl-12 xl:pl-24 pr-6 md:pr-12 xl:pr-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {premiumFeatures.map((feature, i) => (
          <FeatureCard key={i} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
