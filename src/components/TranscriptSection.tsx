import React, { useState } from 'react';
import { Send, RefreshCw, MessageSquareQuote } from 'lucide-react';

interface TranscriptSectionProps {
  transcript: string;
  speaker: string;
  timestamp: string;
  isListening: boolean;
  onUpdateTranscript: (newText: string, speakerName?: string) => void;
  onRequestPredictions: () => void;
  isLoadingPredictions: boolean;
}

export const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  transcript,
  speaker,
  timestamp,
  isListening,
  onUpdateTranscript,
  onRequestPredictions,
  isLoadingPredictions,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleApplyManualInput = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (manualInput.trim()) {
      onUpdateTranscript(manualInput.trim(), 'Background Conversation');
      setManualInput('');
      setIsEditing(false);
    }
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden">
      {/* Top Header & Visualizer */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center space-x-2">
          <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Conversation Transcript (ASR)
          </span>
        </div>

        {/* Audio wave indicator */}
        <div className="flex items-center space-x-2">
          {isListening && (
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 rounded-md">
              <span className="w-1 h-2.5 bg-emerald-400 animate-bounce rounded-full" />
              <span className="w-1 h-3.5 bg-emerald-400 animate-bounce rounded-full delay-75" />
              <span className="w-1 h-2 bg-emerald-400 animate-bounce rounded-full delay-150" />
              <span className="text-[10px] text-emerald-300 font-mono ml-1">AMBIENT ASR</span>
            </div>
          )}
          <span className="text-xs text-slate-500 font-mono">{timestamp}</span>
        </div>
      </div>

      {/* Main Quote Display matching Slide 11 */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4.5 relative group">
        <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-400 font-bold mb-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            SPEAKER: {speaker}
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            id="edit-transcript-toggle"
            className="text-slate-400 hover:text-cyan-300 text-xs font-semibold underline decoration-dashed transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit / Input Prompt'}
          </button>
        </div>

        {!isEditing ? (
          <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 leading-snug tracking-tight">
            "{transcript}"
          </p>
        ) : (
          <form onSubmit={handleApplyManualInput} className="mt-2 space-y-2">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type or paste what the person next to you said..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-base sm:text-lg focus:outline-none focus:border-cyan-500 min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="apply-transcript-btn"
                className="px-4 py-1.5 rounded-lg text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Set Dialogue
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Action Row */}
      <div className="mt-2.5 flex items-center justify-end">
        {/* Regenerate AI Suggestions Button */}
        <button
          onClick={onRequestPredictions}
          disabled={isLoadingPredictions}
          id="regenerate-predictions-btn"
          className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPredictions ? 'animate-spin' : ''}`} />
          <span>{isLoadingPredictions ? 'Predicting...' : 'Regenerate Predictions'}</span>
        </button>
      </div>
    </section>
  );
};
