import React, { useEffect } from 'react';
import Header from '../components/Header';
import PrimaryActions from '../components/PrimaryActions';
import HeroAnimationPlaceholder from '../components/HeroAnimationPlaceholder';
import FeatureHighlights from '../components/FeatureHighlights';

export default function Home() {
  useEffect(() => {
    // Graceful fallback for reduced motion or missing IntersectionObserver
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      document.querySelectorAll('.landing-reveal').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const revealElements = document.querySelectorAll('.landing-reveal');
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target); // Trigger once only, never re-trigger
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <Header />

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Column: Headline, Description & Primary Actions */}
          <section className="lg:col-span-7 flex flex-col space-y-8 animate-fade-in-up">
            
            {/* Main Headline & Supporting Paragraph */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12] font-sans">
                Book Your Parking <span className="text-sage-600">Online.</span>
              </h1>
              <p className="text-base sm:text-lg text-charcoal-600 max-w-xl leading-relaxed font-sans font-normal">
                Find an available parking space effortlessly and manage your parking conveniently. Skip the queue and arrive with total peace of mind.
              </p>
            </div>

            {/* Primary Action Buttons / Cards (Excluded from scroll reveals per instruction) */}
            <div className="w-full max-w-xl">
              <PrimaryActions />
            </div>

            {/* Feature and Trust Signals (Subtle scroll-triggered reveal) */}
            <div className="w-full max-w-xl landing-reveal">
              <FeatureHighlights />
            </div>
          </section>

          {/* Right Hero Column: Hero Animation Placeholder */}
          <section className="lg:col-span-5 flex justify-center w-full animate-fade-in animation-delay-200">
            <HeroAnimationPlaceholder />
          </section>

        </div>
      </main>

      {/* Minimal, elegant footer (Subtle scroll-triggered reveal) */}
      <footer className="w-full border-t border-charcoal-100/60 py-6 bg-white/40 landing-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-3">
          <p>© {new Date().getFullYear()} Smart Parking Finder. All rights reserved.</p>
          <div className="flex items-center gap-6">
          </div>
        </div>
      </footer>
    </div>
  );
}
