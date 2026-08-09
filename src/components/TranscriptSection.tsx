import React, { useState } from 'react';
import { Mic, Volume2, Sparkles, Send, RefreshCw, MessageSquareQuote } from 'lucide-react';
import { SimulatedScenario } from '../types';
import { SIMULATED_SCENARIOS } from '../data/quickNeeds';

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

  const handleSelectScenario = (scen: SimulatedScenario) => {
    onUpdateTranscript(scen.text, scen.speaker);
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Top Header & Visualizer */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Conversation Transcript (ASR)
          </span>
        </div>

        {/* Audio wave indicator */}
        <div className="flex items-center space-x-2">
          {isListening && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-md">
              <span className="w-1 h-3 bg-emerald-400 animate-bounce rounded-full" />
              <span className="w-1 h-4 bg-emerald-400 animate-bounce rounded-full delay-75" />
              <span className="w-1 h-2 bg-emerald-400 animate-bounce rounded-full delay-150" />
              <span className="text-[10px] text-emerald-300 font-mono ml-1">AMBIENT ASR</span>
            </div>
          )}
          <span className="text-xs text-slate-500 font-mono">{timestamp}</span>
        </div>
      </div>

      {/* Main Quote Display matching Slide 11 */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 sm:p-5 relative group">
        <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            SPEAKER: {speaker}
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            id="edit-transcript-toggle"
            className="text-slate-400 hover:text-cyan-300 text-xs underline decoration-dashed transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit / Input Prompt'}
          </button>
        </div>

        {!isEditing ? (
          <p className="text-lg sm:text-2xl font-bold text-slate-100 leading-snug tracking-tight">
            "{transcript}"
          </p>
        ) : (
          <form onSubmit={handleApplyManualInput} className="mt-2 space-y-2">
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type or paste what the person next to you said..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-cyan-500 min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="apply-transcript-btn"
                className="px-4 py-1.5 rounded-lg text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" /> Set Dialogue
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Scenario Preset Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          {SIMULATED_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              id={`scenario-preset-${scen.id}`}
              className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded-md border border-slate-700/80 transition-colors"
            >
              {scen.title}
            </button>
          ))}
        </div>

        {/* Regenerate AI Suggestions Button */}
        <button
          onClick={onRequestPredictions}
          disabled={isLoadingPredictions}
          id="regenerate-predictions-btn"
          className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPredictions ? 'animate-spin' : ''}`} />
          <span>{isLoadingPredictions ? 'Predicting...' : 'Regenerate Predictions'}</span>
        </button>
      </div>
    </section>
  );
};
