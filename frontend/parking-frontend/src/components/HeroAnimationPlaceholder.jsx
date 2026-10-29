import React from 'react';
import parkingImg from './image.png';

/**
 * HeroAnimationPlaceholder
 * 
 * DESIGNED FOR EASY CUSTOMIZATION:
 * You can replace the interior of this component with your chosen:
 * 1. React Bits component (e.g. Hyperspeed, Waves, Squares, DecryptedText, etc.)
 * 2. Lottie animation (using @lottiefiles/react-lottie-player or lottie-react)
 * 
 * Either pass your animation as `children` or swap the placeholder content below.
 */
export default function HeroAnimationPlaceholder({ children }) {
  // If a custom animation component (React Bits or Lottie) is passed as a child, render it directly
  if (children) {
    return (
      <div className="relative w-full aspect-[4/3] max-w-xl mx-auto rounded-3xl overflow-hidden bg-white/60 border border-charcoal-100/80 shadow-soft flex items-center justify-center">
        {children}
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Subtle ambient background glow */}
      <div 
        aria-hidden="true" 
        className="absolute -top-10 -right-10 w-72 h-72 bg-sage-200/50 rounded-full blur-3xl pointer-events-none animate-pulse-glow"
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-8 -left-8 w-60 h-60 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none"
      />

      {/* Main Illustration / Animation Stage */}
      <div className="relative z-10 w-full rounded-3xl bg-gradient-to-b from-white/95 to-background-subtle/80 border border-charcoal-100/90 shadow-soft p-6 sm:p-8 backdrop-blur-sm transition-all hover:shadow-soft-lg">
        {/* Placeholder insertion notification badge for developer convenience */}
        <div className="flex items-center justify-between pb-5 border-b border-charcoal-100/70">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sage-500 animate-pulse" />
            <span className="text-xs font-semibold text-charcoal-700 tracking-wider uppercase font-sans">
              Parking Map
            </span>
          </div>
        </div>

        {/* Clean, architectural parking bay graphic with subtle ambient movement */}
        <div className="py-6 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
          <div className="w-full max-w-md flex justify-center items-center my-auto ">
            <img 
              src={parkingImg} 
              alt="Smart Parking Lot" 
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Live mall status telemetry footer */}
        <div className="pt-4 border-t border-charcoal-100/70 flex items-center justify-between text-xs text-charcoal-600">
          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>
    </div>
  );
}
