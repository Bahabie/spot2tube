"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { FAQ_CATEGORIES, type FaqItem } from "./data";

// ─── Accordion Item ────────────────────────────────────────────────────────────

function AccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`
        rounded-2xl ring-1 transition-all duration-300 overflow-hidden
        ${
          isOpen
            ? "bg-white/[0.05] ring-white/20"
            : "bg-white/[0.02] ring-white/[0.07] hover:bg-white/[0.04] hover:ring-white/15"
        }
      `}
    >
      <button
        id={`faq-trigger-${index}`}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${index}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
      >
        <span
          className={`
            text-sm font-medium leading-snug transition-colors duration-200
            font-['Satoshi',sans-serif]
            ${isOpen ? "text-gray-100" : "text-zinc-300 group-hover:text-gray-100"}
          `}
        >
          {item.question}
        </span>

        <span
          className={`
            shrink-0 flex items-center justify-center w-6 h-6 rounded-full
            ring-1 transition-all duration-300
            ${
              isOpen
                ? "bg-primary/20 ring-primary/40 text-primary"
                : "bg-white/[0.05] ring-white/10 text-zinc-500 group-hover:text-zinc-300"
            }
          `}
        >
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${index}`}
            role="region"
            aria-labelledby={`faq-trigger-${index}`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm leading-relaxed text-zinc-400 font-['Satoshi',sans-serif]">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  globalOffset,
}: {
  category: (typeof FAQ_CATEGORIES)[number];
  globalOffset: number;
}) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl p-8">
      {/* Category Header */}
      <div className="mb-6">
        <h2
          className="text-xl font-extrabold tracking-tight text-gray-100"
          style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
        >
          {category.title}
        </h2>
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-2">
        {category.items.map((item, i) => (
          <AccordionItem key={i} item={item} index={globalOffset + i} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HelpPage() {
  // Compute global offsets so each AccordionItem has a unique aria ID
  const offsets: number[] = [];
  let count = 0;
  for (const cat of FAQ_CATEGORIES) {
    offsets.push(count);
    count += cat.items.length;
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Subtle ambient glow */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] rounded-full" />
        </div>

        {/* Eyebrow badge */}
        <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] ring-1 ring-white/10 text-xs font-medium text-zinc-400 font-['Satoshi',sans-serif]">
          Help Center
        </div>

        <h1
          className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-100 max-w-3xl"
          style={{ fontFamily: '"Cabinet Grotesk", sans-serif' }}
        >
          Frequently Asked&nbsp;
          <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Questions
          </span>
        </h1>

        <p className="mt-5 text-zinc-400 text-lg max-w-xl leading-relaxed font-['Satoshi',sans-serif]">
          Everything you need to know about Spot2Tube-sync. Can&apos;t find the
          answer you&apos;re looking for?{" "}
          <a
            href="mailto:alibahabys@gmail.com"
            className="text-zinc-300 underline underline-offset-2 hover:text-white transition-colors"
          >
            Contact our support team.
          </a>
        </p>
      </section>

      {/* ── FAQ Grid ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="flex flex-col gap-8">
          {FAQ_CATEGORIES.map((cat, catIdx) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              globalOffset={offsets[catIdx]}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center text-center gap-4">
          <p className="text-zinc-500 text-sm font-['Satoshi',sans-serif]">
            Still have questions?
          </p>
          <a
            href="mailto:alibahabys@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.08] hover:ring-white/20 text-sm font-medium text-zinc-300 hover:text-white transition-all font-['Satoshi',sans-serif]"
          >
            Contact Support →
          </a>
        </div>
      </section>
    </div>
  );
}
