import React from 'react';
import { GlassWater, Bath, AlertTriangle, Armchair, Tv, Moon, Zap } from 'lucide-react';
import { QuickNeed } from '../types';
import { QUICK_NEEDS } from '../data/quickNeeds';

interface QuickNeedsSectionProps {
  onSelectNeed: (need: QuickNeed) => void;
  onSpeakNeedImmediately: (need: QuickNeed) => void;
  isEyeGazeMode: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  GlassWater,
  Bath,
  AlertTriangle,
  Armchair,
  Tv,
  Moon,
};

export const QuickNeedsSection: React.FC<QuickNeedsSectionProps> = ({
  onSelectNeed,
  onSpeakNeedImmediately,
  isEyeGazeMode,
}) => {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-amber-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Essential Needs (High Priority)
        </h2>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${isEyeGazeMode ? 'gap-4' : ''}`}>
        {QUICK_NEEDS.map((need) => {
          const IconComp = ICON_MAP[need.icon] || GlassWater;

          return (
            <button
              key={need.id}
              onClick={() => onSelectNeed(need)}
              onDoubleClick={() => onSpeakNeedImmediately(need)}
              id={`quick-need-${need.id}`}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border font-bold transition-all text-left shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                need.color
              } ${isEyeGazeMode ? 'p-6 text-xl' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    need.isUrgent
                      ? 'bg-red-800/80 text-white animate-pulse'
                      : 'bg-slate-900/80 text-cyan-300'
                  }`}
                >
                  <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className="block text-sm sm:text-base font-extrabold tracking-tight">
                    {need.label}
                  </span>
                  <span className="block text-[11px] opacity-80 font-normal truncate max-w-[150px] sm:max-w-[200px]">
                    "{need.phrase}"
                  </span>
                </div>
              </div>

              {need.isUrgent && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-red-600 text-white animate-pulse">
                  URGENT
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
