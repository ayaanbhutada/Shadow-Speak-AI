import React from 'react';
import { GlassWater, Bath, AlertTriangle, Armchair, Zap, Volume2 } from 'lucide-react';
import { QuickNeed } from '../types';
import { getQuickNeedsForLanguage } from '../data/quickNeeds';

interface QuickNeedsSectionProps {
  onSelectNeed: (need: QuickNeed) => void;
  onSpeakNeedImmediately: (need: QuickNeed) => void;
  isEyeGazeMode: boolean;
  language?: 'English' | 'Hindi' | 'Hinglish';
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  GlassWater,
  Bath,
  AlertTriangle,
  Armchair,
};

export const QuickNeedsSection: React.FC<QuickNeedsSectionProps> = ({
  onSelectNeed,
  onSpeakNeedImmediately,
  isEyeGazeMode,
  language = 'English',
}) => {
  const needs = getQuickNeedsForLanguage(language);

  const handleClick = (need: QuickNeed) => {
    onSelectNeed(need);
    onSpeakNeedImmediately(need);
  };

  const headerTitle =
    language === 'Hindi'
      ? 'त्वरित आवश्यक ज़रूरतें (उच्च प्राथमिकता)'
      : language === 'Hinglish'
      ? 'Quick Essential Needs (High Priority)'
      : 'Quick Essential Needs (High Priority)';

  const autoSpeakBadge =
    language === 'Hindi' ? '1-टैप तुरंत बोलेगा' : '1-Tap Auto Speaks Aloud';

  const urgentBadge =
    language === 'Hindi' ? 'अति आवश्यक' : 'URGENT';

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {headerTitle}
          </h2>
        </div>
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5" /> {autoSpeakBadge}
        </span>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 ${isEyeGazeMode ? 'gap-3' : ''}`}>
        {needs.map((need) => {
          const IconComp = ICON_MAP[need.icon] || GlassWater;

          return (
            <button
              key={need.id}
              onClick={() => handleClick(need)}
              id={`quick-need-${need.id}`}
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border font-bold transition-all text-left shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                need.color
              } ${isEyeGazeMode ? 'p-4 sm:p-5' : ''}`}
              title={`Tap to speak aloud immediately: "${need.phrase}"`}
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
                  <div className="flex items-center gap-1.5">
                    <span className="block text-base sm:text-lg font-black tracking-tight leading-snug">
                      {need.label}
                    </span>
                  </div>
                  <span className="block text-xs opacity-90 font-medium truncate mt-0.5">
                    "{need.phrase}"
                  </span>
                </div>
              </div>

              <div className="flex items-center shrink-0 ml-2">
                {need.isUrgent ? (
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-red-600 text-white animate-pulse">
                    {urgentBadge}
                  </span>
                ) : (
                  <span className="p-1 rounded-md bg-slate-950/40 text-cyan-300 opacity-80 group-hover:opacity-100">
                    <Volume2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
