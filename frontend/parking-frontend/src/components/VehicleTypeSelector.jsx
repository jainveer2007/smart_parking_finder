import React from 'react';
import { Car, Bike, Check } from 'lucide-react';

const VEHICLE_TYPES = [
  {
    id: 'Car',
    label: 'Car',
    badge: 'Standard Bay',
    description: 'Sedan, SUV, Hatchback or EV',
    icon: Car,
  },
  {
    id: 'Bike',
    label: 'Bike',
    badge: 'Two-Wheeler Bay',
    description: 'Motorcycle, Scooter or Bicycle',
    icon: Bike,
  },
];

export default function VehicleTypeSelector({ selectedType, onChange, error }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-charcoal-800 font-sans">
          Vehicle Type <span className="text-rose-500"></span>
        </label>
        <span className="text-xs text-charcoal-500 font-medium">Select one</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Select vehicle type"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
      >
        {VEHICLE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType?.toLowerCase() === type.id.toLowerCase();

          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(type.id)}
              className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 ${
                isSelected
                  ? 'border-sage-600 bg-sage-50/70 shadow-soft-sm ring-1 ring-sage-600/30'
                  : 'border-charcoal-100 bg-white hover:border-sage-300 hover:bg-background-warm/60 shadow-soft-sm'
              } ${error ? 'border-rose-300' : ''}`}
            >
              {/* Radio indicator in top-right */}
              <div
                className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-sage-600 text-white'
                    : 'border-2 border-charcoal-200 group-hover:border-sage-400 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              {/* Icon Container */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors mb-3 ${
                  isSelected
                    ? 'bg-sage-600 text-white shadow-soft-sm shadow-sage-600/20'
                    : 'bg-sage-50 text-sage-700 border border-sage-200/80 group-hover:bg-sage-100'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Title & Badge */}
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-charcoal-900 font-sans">
                  {type.label}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-white text-sage-800 border-sage-200'
                      : 'bg-background-subtle text-charcoal-600 border-charcoal-100'
                  }`}
                >
                  {type.badge}
                </span>
              </div>

              {/* Description */}
              <p className="mt-1 text-xs text-charcoal-500 font-sans leading-relaxed">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1.5 animate-fade-in font-sans">
          <span className="w-1 h-1 rounded-full bg-rose-500"></span>
          {error}
        </p>
      )}
    </div>
  );
}
