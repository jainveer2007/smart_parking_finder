import React from 'react';

export default function Header() {
  return (
    <header className="w-full border-b border-charcoal-100/60 bg-white/70 backdrop-blur-md sticky top-0 z-10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-600 to-sage-700 flex items-center justify-center text-white shadow-soft-sm shadow-sage-600/20 ring-1 ring-black/5">
            {/* Minimalist modern parking emblem */}
            <span className="font-bold text-lg tracking-tight font-sans">P</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl text-charcoal-900 tracking-tight font-sans">
              Smart Parking Finder
            </span>
          </div>
        </div>

        {/* Minimal live status badge */}
      </div>
    </header>
  );
}
