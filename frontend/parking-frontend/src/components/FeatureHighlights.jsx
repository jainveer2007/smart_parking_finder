import React from 'react';
import { ShieldCheck, Zap, Clock } from 'lucide-react';

export default function FeatureHighlights() {
  const features = [
    {
      icon: Clock,
      title: 'Zero Circling',
      desc: 'Lock in your parking bay in advance without driving in circles.',
    },
    {
      icon: Zap,
      title: 'Instant Confirmation',
      desc: 'Seamless verification directly synchronized with the mall gates.',
    },
    {
      icon: ShieldCheck,
      title: 'Monitored Bays',
      desc: 'Covered, secure parking bays across all mall basement levels.',
    },
  ];

  return (
    <div className="w-full pt-8 sm:pt-10 border-t border-charcoal-100/80">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3.5">
              <div className="mt-0.5 p-2 rounded-lg bg-sage-50 text-sage-700 border border-sage-200/60 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-800 tracking-tight font-sans">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-charcoal-500 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
