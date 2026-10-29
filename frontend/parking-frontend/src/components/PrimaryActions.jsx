import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function PrimaryActions() {
  return (
    <div data-no-spark="true" className="w-full flex flex-col sm:flex-row gap-4 pt-2">
      {/* Primary Action: Book a Slot */}
      <Link
        to="/book"
        className="group relative flex-1 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-charcoal-900 text-white shadow-soft transition-all duration-300 hover:shadow-soft-hover hover:-translate-y-1 focus:ring-2 focus:ring-sage-400 focus:outline-none"
        aria-label="Book a Slot - Find and reserve an available space"
      >
        <div className="flex items-start justify-between">

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage-300 bg-charcoal-800/80 px-2.5 py-1 rounded-full border border-charcoal-700">
            Instant
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-white group-hover:text-sage-100 font-sans">
              Book a Slot
            </h2>
            <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-sage-300" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-400 leading-relaxed font-sans">
            Reserve an available parking space before arriving at the mall.
          </p>
        </div>
      </Link>

      {/* Secondary Action: Release a Slot */}
      <Link
        to="/release"
        className="group relative flex-1 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white text-charcoal-900 border border-charcoal-100 shadow-soft-sm transition-all duration-300 hover:border-sage-300 hover:shadow-soft hover:-translate-y-1 focus:ring-2 focus:ring-sage-500 focus:outline-none"
        aria-label="Release a Slot - Free your slot upon departure"
      >
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-charcoal-500 bg-background-subtle px-2.5 py-1 rounded-full border border-charcoal-100">
            Quick Exit
          </span>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-charcoal-900 group-hover:text-sage-700 font-sans">
              Release a Slot
            </h2>
            <ArrowRight className="w-4 h-4 text-charcoal-400 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-sage-600" />
          </div>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600 leading-relaxed font-sans">
            Vacate your parking spot quickly and complete your exit.
          </p>
        </div>
      </Link>
    </div>
  );
}
