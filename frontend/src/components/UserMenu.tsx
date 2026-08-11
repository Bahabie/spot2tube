"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Music, LogOut, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface UserMenuProps {
  name: string;
  image: string | null;
}

export function UserMenu({ name, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close dropdown on Escape key.
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        id="user-menu-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center justify-center gap-1.5 bg-black/50 hover:bg-white/[0.08] hover:scale-105 transition-all duration-200 p-1 pr-2 rounded-full cursor-pointer"
      >
        {image ? (
          <img src={image} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-labelledby="user-menu-button"
            className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0A0A0B]/80 backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl shadow-black/80 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="p-4 border-b border-white/5">
              <p className="text-[#F3F4F6] text-sm font-medium truncate">{name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">Signed in</p>
            </div>
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 w-full p-3 text-sm text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ease-in-out cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
