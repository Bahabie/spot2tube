"use client";

import { motion } from "framer-motion";
import { Check, Gem } from "lucide-react";
import { useState } from "react";
import { FeatureCarousel } from "./components/FeatureCarousel";
import { FinalCtaBanner } from "./components/FinalCtaBanner";

export default function PlansPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 20 
      } 
    },
  };

  return (
    <div className="bg-[#0A0A0B]">
      {/* Phase 1: Hero & Pricing Cards */}
      <section className="flex flex-col items-center pt-24 pb-8 overflow-hidden">
        <motion.div 
          className="w-full flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Hero Typography */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl font-extrabold text-[#F3F4F6] text-center tracking-tighter mb-4 font-['Cabinet_Grotesk',sans-serif]"
          >
            Your Music Will Always Be With You
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-zinc-400 text-lg text-center max-w-2xl mb-16 font-['Satoshi',sans-serif]"
          >
            Transfer your music, auto synchronize your playlists, share music across different platforms - we got you all covered
          </motion.p>

          {/* Pricing Cards Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-6"
          >
            {/* Card 1: FREE TRIAL */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/[0.02] backdrop-blur-2xl ring-1 ring-inset ring-white/10 rounded-3xl p-8 flex flex-col font-['Satoshi',sans-serif]"
            >
              <h3 className="font-bold uppercase text-zinc-300 mb-6 tracking-wide">FREE TRIAL</h3>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Transfer up to 500 songs for free",
                  "Share music across all music platforms",
                  "Up to 20 auto daily syncs across music platforms",
                  "Backup your music to our cloud",
                  "Remove Spot 2 Tube watermark"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 shrink-0 ${i < 2 ? "text-[#1DB954]" : "text-zinc-600"}`} />
                    <span className={`text-sm ${i < 2 ? "text-zinc-200" : "text-zinc-500"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="bg-transparent hover:bg-white/[0.05] ring-1 ring-inset ring-white/10 text-white rounded-xl py-3 w-full transition-all mt-auto font-medium">
                Try it for free
              </button>
            </motion.div>

            {/* Card 2: PREMIUM */}
            <motion.div 
              variants={itemVariants}
              className="relative bg-white/[0.02] bg-gradient-to-b from-purple-500/10 to-transparent hover:from-purple-500/15 backdrop-blur-2xl ring-1 ring-inset ring-purple-500/30 transition-colors duration-500 rounded-3xl p-8 flex flex-col font-['Satoshi',sans-serif] shadow-[0_0_40px_rgba(168,85,247,0.05)]"
            >
              <div className="flex items-center gap-2 mb-6">
                <Gem className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold uppercase bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent tracking-wide">PREMIUM</h3>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Unlimited music transfer",
                  "Share music across all music platforms",
                  "Up to 20 auto daily syncs across music platforms",
                  "Backup your music to our cloud",
                  "Remove Spot 2 Tube watermark"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {/* Billing Toggle */}
                <div className="flex items-center justify-end gap-3 mb-6">
                  <span className={`text-sm ${isAnnual ? "text-white" : "text-zinc-500"}`}>Annually</span>
                  <button 
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="w-12 h-6 rounded-full bg-white/10 ring-1 ring-inset ring-white/20 flex items-center p-1 transition-all"
                    aria-label="Toggle billing period"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${isAnnual ? "translate-x-0" : "translate-x-6"}`} />
                  </button>
                  <span className={`text-sm ${!isAnnual ? "text-white" : "text-zinc-500"}`}>Monthly</span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white text-center">
                    {isAnnual ? "$2 / Month" : "$4 / Month"}
                  </div>
                </div>

                {/* CTA */}
                <button className="bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-xl py-3 w-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.3)] font-bold">
                  Get Premium
                </button>
                <p className="text-sm text-zinc-400 text-center mt-4 font-['Satoshi',sans-serif]">Cancel anytime</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Phase 2: Included in Premium (Value Proposition) */}
      <FeatureCarousel />

      {/* Phase 3: Final CTA Banner */}
      <FinalCtaBanner />
    </div>
  );
}
