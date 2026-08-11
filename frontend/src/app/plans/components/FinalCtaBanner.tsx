"use client";

import { motion } from "framer-motion";
import { Gem, Lock } from "lucide-react";
import { useState } from "react";

export function FinalCtaBanner() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="w-full px-6">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto rounded-[2.5rem] my-24 p-12 text-center relative overflow-hidden bg-white/[0.02] backdrop-blur-2xl ring-1 ring-purple-500/20 shadow-[0_0_80px_rgba(168,85,247,0.05)]"
      >
        {/* Breathing Gradient Aura */}
        <motion.div 
          animate={{ 
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/15 via-transparent to-indigo-500/15" 
        />

        {/* Content */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center mb-6 shadow-xl">
            <Gem className="w-6 h-6 text-purple-400" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F3F4F6] font-['Cabinet_Grotesk',sans-serif] tracking-tighter mb-4">
            BECOME PREMIUM
          </h2>
          
          <p className="text-zinc-400 text-lg mb-10 font-['Satoshi',sans-serif]">
            Transfer all your music with one simple click
          </p>

          {/* Interactive Pricing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8 font-['Satoshi',sans-serif]">
            <span className={`text-sm font-medium transition-colors ${isAnnual ? "text-white" : "text-zinc-500"}`}>Annually</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-7 rounded-full bg-white/10 ring-1 ring-inset ring-white/20 flex items-center p-1 transition-all"
              aria-label="Toggle billing period"
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${isAnnual ? "translate-x-0" : "translate-x-7"}`} />
            </button>
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? "text-white" : "text-zinc-500"}`}>Monthly</span>
          </div>

          <div className="text-4xl md:text-5xl font-bold text-white mb-8 font-['Satoshi',sans-serif]">
            {isAnnual ? "$2 / Month" : "$4 / Month"}
          </div>

          {/* CTA Button */}
          <button className="bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-xl py-4 px-12 transition-all hover:shadow-[0_0_30px_rgba(29,185,84,0.3)] font-bold text-lg mb-6 w-full max-w-sm mx-auto transform hover:scale-[1.02] active:scale-[0.98]">
            Get Premium
          </button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-400 font-['Satoshi',sans-serif]">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
