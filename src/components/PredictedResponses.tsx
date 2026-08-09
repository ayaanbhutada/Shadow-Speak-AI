import React from 'react';
import { ChevronRight, Sparkles, Loader2, Volume2 } from 'lucide-react';
import { PredictedResponse } from '../types';

interface PredictedResponsesProps {
  responses: PredictedResponse[];
  selectedResponseId: string | null;
  onSelectResponse: (resp: PredictedResponse) => void;
  onSpeakImmediately: (resp: PredictedResponse) => void;
  onOpenDetails: (resp: PredictedResponse) => void;
  isLoading: boolean;
  isEyeGazeMode: boolean;
}

export const PredictedResponses: React.FC<PredictedResponsesProps> = ({
  responses,
  selectedResponseId,
  onSelectResponse,
  onSpeakImmediately,
  onOpenDetails,
  isLoading,
  isEyeGazeMode,
}) => {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            AI Predicted Responses (One-Tap Selection)
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Press 1-4 on keyboard to select instantly
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-cyan-300 font-semibold animate-pulse">
            Generating contextual smart responses via Gemini AI...
          </p>
        </div>
      ) : responses.length === 0 ? (
        <div className="py-8 text-center text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800">
          No responses predicted yet. Click "Regenerate Predictions" above.
        </div>
      ) : (
        <div className="space-y-2.5">
          {responses.slice(0, 4).map((resp, idx) => {
            const num = idx + 1;
            const isSelected = selectedResponseId === resp.id;

            return (
              <div
                key={resp.id || idx}
                onClick={() => onSelectResponse(resp)}
                id={`predicted-option-${num}`}
                className={`group relative flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/40'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-900'
                } ${isEyeGazeMode ? 'p-6 sm:p-7 text-xl' : ''}`}
              >
                {/* Number Badge & Main Text */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <span
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-black text-sm sm:text-base shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 shadow-md'
                        : 'bg-blue-900/60 text-cyan-300 group-hover:bg-cyan-600 group-hover:text-white'
                    }`}
                  >
                    {num}
                  </span>

                  <span className="font-bold text-base sm:text-xl truncate tracking-tight text-slate-100">
                    "{resp.text}"
                  </span>
                </div>

                {/* Right Actions & Tag */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Category Tag matching Slide 11 */}
                  <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60">
                    {resp.tag}
                  </span>

                  {/* Speak immediately icon button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSpeakImmediately(resp);
                    }}
                    id={`speak-direct-btn-${num}`}
                    className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 transition-colors"
                    title="Speak phrase immediately"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetails(resp);
                    }}
                    id={`details-option-btn-${num}`}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
                    title="View details or expanded version"
                  >
                    <span className="hidden md:inline">Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
