import React from 'react';
import { GlassWater, Bath, AlertTriangle, Armchair, Tv, Moon, Zap, ThumbsDown, XCircle } from 'lucide-react';
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
  ThumbsDown,
  XCircle,
};

export const QuickNeedsSection: React.FC<QuickNeedsSectionProps> = ({
  onSelectNeed,
  onSpeakNeedImmediately,
  isEyeGazeMode,
}) => {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
      <div className="flex items-center space-x-2 mb-2.5">
        <Zap className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Quick Essential Needs (High Priority)
        </h2>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 ${isEyeGazeMode ? 'gap-3' : ''}`}>
        {QUICK_NEEDS.map((need) => {
          const IconComp = ICON_MAP[need.icon] || GlassWater;

          return (
            <button
              key={need.id}
              onClick={() => onSelectNeed(need)}
              onDoubleClick={() => onSpeakNeedImmediately(need)}
              id={`quick-need-${need.id}`}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border font-bold transition-all text-left shadow-sm hover:scale-[1.01] active:scale-[0.99] ${
                need.color
              } ${isEyeGazeMode ? 'p-3.5 sm:p-4' : ''}`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    need.isUrgent
                      ? 'bg-red-800/80 text-white animate-pulse'
                      : 'bg-slate-900/80 text-cyan-300'
                  }`}
                >
                  <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-base sm:text-xl font-black tracking-tight leading-snug">
                    {need.label}
                  </span>
                  <span className="block text-xs sm:text-sm opacity-90 font-medium truncate">
                    "{need.phrase}"
                  </span>
                </div>
              </div>

              {need.isUrgent && (
                <span className="px-2 py-0.5 rounded text-[11px] uppercase font-black bg-red-600 text-white animate-pulse shrink-0 ml-2">
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

