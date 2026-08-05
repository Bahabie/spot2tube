"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Music, LogOut, ChevronDown } from "lucide-react";

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
        className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/10 hover:bg-white/10 transition-colors duration-200 cursor-pointer"
      >
        {image ? (
          <img src={image} alt="Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Music className="w-4 h-4" />
          </div>
        )}
        <span className="text-sm font-medium">{name}</span>
        <ChevronDown
          className={`w-4 h-4 text-white/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby="user-menu-button"
          className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            <p className="text-xs text-gray-400">Signed in</p>
          </div>
          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
