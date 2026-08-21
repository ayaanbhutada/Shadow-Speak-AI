import React, { useState } from 'react';
import {
  Send,
  RefreshCw,
  MessageSquareQuote,
  Mic,
  RotateCcw,
  AlertCircle,
  Sparkles,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Volume2,
  X,
  Brain,
  Check
} from 'lucide-react';
import { TranscriptEntry } from '../types';

interface TranscriptSectionProps {
  transcript: string;
  interimTranscript?: string;
  isAudioActive?: boolean;
  speaker: string;
  timestamp: string;
  isListening: boolean;
  onUpdateTranscript: (newText: string, speakerName?: string) => void;
  onClearTranscript: () => void;
  onRequestPredictions: () => void;
  isLoadingPredictions: boolean;
  onResetMic?: () => void;
  statusMessage?: string;
  conversationHistory?: TranscriptEntry[];
  onClearHistory?: () => void;
  onDeleteHistoryEntry?: (id: string) => void;
}

export const TranscriptSection: React.FC<TranscriptSectionProps> = ({
  transcript,
  interimTranscript = '',
  isAudioActive = false,
  speaker,
  timestamp,
  isListening,
  onUpdateTranscript,
  onClearTranscript,
  onRequestPredictions,
  isLoadingPredictions,
  onResetMic,
  statusMessage,
  conversationHistory = [],
  onClearHistory,
  onDeleteHistoryEntry,
}) => {
  const [manualInput, setManualInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [justCleared, setJustCleared] = useState(false);

  const handleApplyManualInput = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (manualInput.trim()) {
      onUpdateTranscript(manualInput.trim(), 'Ambient Speaker');
      setManualInput('');
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    if (onClearHistory) {
      onClearHistory();
      setJustCleared(true);
      setTimeout(() => setJustCleared(false), 3000);
    }
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden space-y-3">
      {/* Top Header & Visualizer */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center space-x-2">
          <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Conversation Transcript (ASR)
          </span>
        </div>

        {/* Audio wave indicator & status */}
        <div className="flex items-center space-x-2.5">
          {isListening ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/70 border border-emerald-800/70 rounded-full">
              <span className={`w-1.5 h-3 bg-emerald-400 rounded-full ${isAudioActive ? 'animate-bounce' : 'opacity-80'}`} />
              <span className={`w-1.5 h-4 bg-emerald-400 rounded-full ${isAudioActive ? 'animate-bounce delay-75' : 'opacity-80'}`} />
              <span className={`w-1.5 h-2.5 bg-emerald-400 rounded-full ${isAudioActive ? 'animate-bounce delay-150' : 'opacity-80'}`} />
              <span className="text-[11px] text-emerald-300 font-mono font-bold ml-1">
                {isAudioActive ? 'HEARING SPEECH...' : 'AMBIENT ASR ACTIVE'}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-full">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
              <span className="text-[11px] text-slate-400 font-mono">ASR PAUSED</span>
            </div>
          )}

          {onResetMic && (
            <button
              onClick={onResetMic}
              id="reset-mic-btn"
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors"
              title="Restart / Reconnect Speech Recognition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="text-xs text-slate-500 font-mono">{timestamp}</span>
        </div>
      </div>

      {/* Optional Status/Error Banner */}
      {statusMessage && (
        <div className="px-3 py-1.5 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center gap-2 text-xs text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Live Quote Display */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4.5 relative group">
        <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-400 font-bold mb-2">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAudioActive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
            CURRENT SPEAKER: {speaker}
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            id="edit-transcript-toggle"
            className="text-slate-400 hover:text-cyan-300 text-xs font-semibold underline decoration-dashed transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit / Input Prompt'}
          </button>
          {transcript && (
            <button
              onClick={onClearTranscript}
              id="clear-transcript-btn"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-300 hover:bg-red-950/50 transition-colors"
              title="Clear transcript"
              aria-label="Clear transcript"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isEditing ? (
          <div>
            <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 leading-snug tracking-tight">
              "{transcript}"
              {interimTranscript && (
                <span className="text-cyan-300 italic animate-pulse ml-2 font-semibold">
                  {interimTranscript}...
                </span>
              )}
            </p>
            {interimTranscript && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                <Mic className="w-3 h-3 animate-pulse" />
                <span>Live stream: recognizing incoming speech in real-time...</span>
              </div>
            )}
          </div>
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

      {/* Action Row: Predictions & Memory Status */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Conversation History / Memory Toggle Button */}
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            id="toggle-history-btn"
            className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Context Memory ({conversationHistory.length}/4 turns)
            </span>
            {isHistoryExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Quick Delete Context Button */}
          {conversationHistory.length > 0 && onClearHistory && (
            <button
              onClick={handleClear}
              id="delete-context-btn"
              className="text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 px-2.5 py-1.5 rounded-lg border border-red-800/50 flex items-center gap-1.5 font-medium transition-colors"
              title="Delete and clear conversation memory context"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Delete Context</span>
            </button>
          )}

          {justCleared && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Context deleted!
            </span>
          )}
        </div>

        {/* Manual AI response generation */}
        <button
          onClick={onRequestPredictions}
          disabled={isLoadingPredictions}
          id="regenerate-predictions-btn"
          className="text-sm sm:text-base bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoadingPredictions ? 'animate-spin' : ''}`} />
          <span>{isLoadingPredictions ? 'Generating...' : 'Generate Responses'}</span>
        </button>
      </div>

      {/* Collapsible Conversation Memory & Context Drawer */}
      {isHistoryExpanded && (
        <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Remembered Past Conversation & Context
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Gemini/Groq uses the last 4 turns for multi-turn prediction
              </span>
              {conversationHistory.length > 0 && onClearHistory && (
                <button
                  onClick={handleClear}
                  className="text-xs bg-red-950/60 hover:bg-red-900 text-red-300 px-2 py-1 rounded border border-red-800 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear All Context
                </button>
              )}
            </div>
          </div>

          {conversationHistory.length === 0 ? (
            <div className="text-center py-6 px-4 text-slate-500 text-xs">
              <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-slate-400">No past conversation turns in memory.</p>
              <p className="text-slate-500 mt-1">
                As people speak around you and as you vocalize AAC responses, turns will be remembered here to provide multi-turn context to the AI.
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {conversationHistory.map((entry) => {
                const isUser = entry.isUserSpeaker;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-start justify-between gap-2 p-2.5 rounded-lg border text-xs transition-colors ${
                      isUser
                        ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-100 ml-4'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 mr-4'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isUser ? (
                          <span className="flex items-center gap-1 font-bold text-cyan-400">
                            <Volume2 className="w-3 h-3" />
                            {entry.speaker}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-slate-300">
                            <User className="w-3 h-3 text-slate-400" />
                            {entry.speaker}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {entry.timestamp}
                        </span>
                        {isUser && (
                          <span className="text-[10px] bg-cyan-900/60 text-cyan-300 px-1.5 py-0.2 rounded font-semibold">
                            You Spoke
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-100 leading-snug break-words">
                        "{entry.text}"
                      </p>
                    </div>

                    {onDeleteHistoryEntry && (
                      <button
                        onClick={() => onDeleteHistoryEntry(entry.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors shrink-0"
                        title="Delete this specific memory turn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
