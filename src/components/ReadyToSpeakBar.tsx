import React from 'react';
import { Volume2, X, VolumeX, Sparkles, Loader2 } from 'lucide-react';

interface ReadyToSpeakBarProps {
  currentText: string;
  onChangeText: (newText: string) => void;
  onSpeak: () => void;
  onStop: () => void;
  isSpeaking: boolean;
  isElevenLabs: boolean;
  onClear: () => void;
}

export const ReadyToSpeakBar: React.FC<ReadyToSpeakBarProps> = ({
  currentText,
  onChangeText,
  onSpeak,
  onStop,
  isSpeaking,
  isElevenLabs,
  onClear,
}) => {
  return (
    <div className="bg-slate-900/95 border-t-2 border-slate-700/80 p-2.5 sm:p-3 shadow-2xl sticky bottom-0 z-30 backdrop-blur">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Left Input Field */}
        <div className="flex-1 min-w-0 bg-slate-950/90 border border-slate-700 rounded-xl p-2.5 sm:p-3 flex items-center space-x-3 shadow-inner">
          <div className="shrink-0 flex items-center space-x-1.5 text-cyan-400 font-bold text-xs sm:text-sm uppercase tracking-wider pl-1">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">READY:</span>
          </div>

          <input
            type="text"
            value={currentText}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Select a predicted response or type custom phrase..."
            id="ready-to-speak-input"
            className="w-full bg-transparent border-none text-slate-100 font-extrabold text-xl sm:text-3xl focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
          />

          {currentText && (
            <button
              onClick={onClear}
              id="clear-ready-text-btn"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isSpeaking ? (
            <button
              onClick={onStop}
              id="stop-vocalization-btn"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 animate-pulse transition-all"
            >
              <VolumeX className="w-5 h-5" />
              <span>STOP SPEAKING</span>
            </button>
          ) : (
            <button
              onClick={onSpeak}
              disabled={!currentText.trim()}
              id="speak-main-btn"
              className={`w-full md:w-auto px-7 py-3 rounded-xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                currentText.trim()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
              <span>SPEAK</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-slate-900 font-bold border border-emerald-700/50 hidden sm:inline">
                {isElevenLabs ? 'ElevenLabs' : 'Web Speech'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
