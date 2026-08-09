import React from 'react';
import { Mic, MicOff, Settings, Volume2, Sparkles, SlidersHorizontal, Eye } from 'lucide-react';
import { VoiceEngineConfig } from '../types';

interface HeaderProps {
  isListening: boolean;
  onToggleListening: () => void;
  voiceConfig: VoiceEngineConfig;
  onOpenSettings: () => void;
  onSelectScenario: () => void;
  isEyeGazeMode: boolean;
  onToggleEyeGaze: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isListening,
  onToggleListening,
  voiceConfig,
  onOpenSettings,
  onSelectScenario,
  isEyeGazeMode,
  onToggleEyeGaze
}) => {
  const isElevenLabs = voiceConfig.engine === 'elevenlabs' && (voiceConfig.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY);

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
          <Eye className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Shadow Speak <span className="text-cyan-400">AI</span>
            </h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 tracking-wider">
              AAC Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Empowering Speech with Real-Time Contextual AI
          </p>
        </div>
      </div>

      {/* Center Status Indicators matching Page 11 mockup */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Mic Active Pill */}
        <button
          onClick={onToggleListening}
          id="toggle-mic-btn"
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
            isListening
              ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 shadow-sm shadow-emerald-900/50 animate-pulse'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Click to toggle ambient microphone listening"
        >
          <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          {isListening ? (
            <>
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>MIC ACTIVE · LISTENING</span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-slate-400" />
              <span>MIC PAUSED</span>
            </>
          )}
        </button>

        {/* Voice Active Pill */}
        <div
          onClick={onOpenSettings}
          className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-300 hover:border-cyan-500/60 transition-all"
          title="Click to change TTS voice settings"
        >
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            VOICE: {isElevenLabs ? (voiceConfig.elevenLabsVoiceName || 'ElevenLabs Cloned') : (voiceConfig.webSpeechVoiceName || 'Web Speech API')}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onSelectScenario}
          id="simulate-scenario-btn"
          className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          title="Simulate ambient background conversation scenarios"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Simulate</span> Scenario
        </button>

        <button
          onClick={onToggleEyeGaze}
          id="toggle-eye-gaze-btn"
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            isEyeGazeMode
              ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-950/80'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Toggle Large Eye-Gaze / Target Selection Mode"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isEyeGazeMode ? 'Standard UI' : 'High Visibility Target UI'}</span>
        </button>

        <button
          onClick={onOpenSettings}
          id="open-settings-btn"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Open Voice & Profile Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
