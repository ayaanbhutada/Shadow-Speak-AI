import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Key,
  User,
  Sliders,
  Check,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff,
  Play,
  Brain,
  ShieldCheck,
  SlidersHorizontal,
  VolumeX,
  Lock,
  Zap,
  Cpu,
} from 'lucide-react';
import { VoiceEngineConfig, UserProfile, ElevenLabsVoice, AIModelConfig } from '../types';
import { SpeechSynthesisService } from '../lib/speechServices';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceConfig: VoiceEngineConfig;
  onSaveVoiceConfig: (config: VoiceEngineConfig) => void;
  userProfile: UserProfile;
  onSaveUserProfile: (profile: UserProfile) => void;
  aiModelConfig?: AIModelConfig;
  onSaveAIModelConfig?: (config: AIModelConfig) => void;
  isEyeGazeMode?: boolean;
  onToggleEyeGaze?: () => void;
  onOpenStyleAssessment?: () => void;
}

type TabType = 'tts' | 'aimodel' | 'apikeys' | 'profile' | 'accessibility';

const DEFAULT_AI_MODEL_CONFIG: AIModelConfig = {
  provider: 'gemini',
  modelId: 'gemini-3.6-flash',
  groqApiKey: '',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  voiceConfig,
  onSaveVoiceConfig,
  userProfile,
  onSaveUserProfile,
  aiModelConfig = DEFAULT_AI_MODEL_CONFIG,
  onSaveAIModelConfig,
  isEyeGazeMode = false,
  onToggleEyeGaze,
  onOpenStyleAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tts');
  const [localVoiceConfig, setLocalVoiceConfig] = useState<VoiceEngineConfig>(voiceConfig);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [localAIConfig, setLocalAIConfig] = useState<AIModelConfig>(aiModelConfig);
  const [availableWebVoices, setAvailableWebVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);

  useEffect(() => {
    setLocalVoiceConfig(voiceConfig);
  }, [voiceConfig]);

  useEffect(() => {
    setLocalProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    setLocalAIConfig(aiModelConfig || DEFAULT_AI_MODEL_CONFIG);
  }, [aiModelConfig]);

  useEffect(() => {
    if (isOpen) {
      const voices = SpeechSynthesisService.getAvailableWebVoices();
      setAvailableWebVoices(voices);

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          setAvailableWebVoices(window.speechSynthesis.getVoices());
        };
      }

      if (localVoiceConfig.elevenLabsApiKey) {
        fetchElevenLabsVoices(localVoiceConfig.elevenLabsApiKey);
      }
    }
  }, [isOpen]);

  const fetchElevenLabsVoices = async (apiKey: string) => {
    if (!apiKey) return;
    setIsLoadingVoices(true);
    setVoiceStatusMsg('');
    try {
      const res = await fetch('/api/elevenlabs/voices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-elevenlabs-key': apiKey,
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid API Key or network issue');
      }
      const data = await res.json();
      if (data.voices) {
        setElevenLabsVoices(data.voices);
        setVoiceStatusMsg(`Loaded ${data.voices.length} ElevenLabs voices successfully!`);
        if (!localVoiceConfig.elevenLabsVoiceId && data.voices.length > 0) {
          setLocalVoiceConfig((prev) => ({
            ...prev,
            elevenLabsVoiceId: data.voices[0].voice_id,
            elevenLabsVoiceName: data.voices[0].name,
          }));
        }
      }
    } catch (err: any) {
      setVoiceStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleTestSpeech = async () => {
    setIsTestingVoice(true);
    const testPhrase = `Hello! I am ${localProfile.name || 'Alex'}. Testing my ${
      localVoiceConfig.engine === 'elevenlabs' ? 'ElevenLabs cloned' : 'system'
    } text to speech voice.`;

    try {
      await SpeechSynthesisService.speak(
        testPhrase,
        localVoiceConfig,
        () => setIsTestingVoice(true),
        () => setIsTestingVoice(false),
        () => setIsTestingVoice(false)
      );
    } catch {
      setIsTestingVoice(false);
    }
  };

  const handleTestAIModel = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/predict-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: 'Hey Alex, do you want coffee or tea this morning?',
          userProfile: localProfile,
          count: 2,
          aiModelConfig: localAIConfig,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.responses && data.responses.length > 0) {
          const sample = data.responses[0].text;
          const provider = data.providerUsed || localAIConfig.provider;
          const model = data.modelUsed || localAIConfig.modelId;
          setAiTestResult(`Success! [${provider.toUpperCase()} (${model})]: "${sample}"`);
        } else {
          setAiTestResult('No predictions returned');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setAiTestResult(`Error (${res.status}): ${err.error || 'Failed to connect'}`);
      }
    } catch (e: any) {
      setAiTestResult(`Network error: ${e.message}`);
    } finally {
      setIsTestingAI(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveVoiceConfig(localVoiceConfig);
    onSaveUserProfile(localProfile);
    if (onSaveAIModelConfig) {
      onSaveAIModelConfig(localAIConfig);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-700/50 rounded-xl text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 leading-tight">Settings & Preferences</h2>
              <p className="text-xs text-slate-400">Configure Voice Engine, AI Models (Groq/Gemini), Patient Profile & Accessibility</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-settings-btn"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('tts')}
            id="tab-btn-tts"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'tts'
                ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-transparent -mb-px shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice & TTS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aimodel')}
            id="tab-btn-aimodel"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'aimodel'
                ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-transparent -mb-px shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Engine & Groq</span>
            {localAIConfig.provider === 'groq' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apikeys')}
            id="tab-btn-apikeys"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'apikeys'
                ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-transparent -mb-px shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>API Keys</span>
            {localVoiceConfig.elevenLabsApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            id="tab-btn-profile"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-transparent -mb-px shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accessibility')}
            id="tab-btn-accessibility"
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'accessibility'
                ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-transparent -mb-px shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Accessibility</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* TAB 1: VOICE & TTS */}
          {activeTab === 'tts' && (
            <div className="space-y-6">
              {/* TTS Engine Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Active Text-To-Speech (TTS) Engine
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocalVoiceConfig({ ...localVoiceConfig, engine: 'web-speech' })}
                    id="select-web-speech-engine"
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      localVoiceConfig.engine === 'web-speech'
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Web Speech API</span>
                      {localVoiceConfig.engine === 'web-speech' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      Free built-in browser synthesis. Instant playback without any external setup.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocalVoiceConfig({ ...localVoiceConfig, engine: 'elevenlabs' })}
                    id="select-elevenlabs-engine"
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      localVoiceConfig.engine === 'elevenlabs'
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        ElevenLabs <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                      {localVoiceConfig.engine === 'elevenlabs' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      Ultra-realistic voice clone & human expression (Requires ElevenLabs API Key).
                    </p>
                  </button>
                </div>
              </div>

              {/* Engine Specific Controls */}
              {localVoiceConfig.engine === 'elevenlabs' ? (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" /> ElevenLabs Voice Clone Configuration
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('apikeys')}
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" /> Edit API Key
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Select Voice Clone</label>
                    {elevenLabsVoices.length > 0 ? (
                      <select
                        value={localVoiceConfig.elevenLabsVoiceId}
                        onChange={(e) => {
                          const selected = elevenLabsVoices.find((v) => v.voice_id === e.target.value);
                          setLocalVoiceConfig({
                            ...localVoiceConfig,
                            elevenLabsVoiceId: e.target.value,
                            elevenLabsVoiceName: selected?.name || 'Cloned Voice',
                          });
                        }}
                        id="elevenlabs-voice-select"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                      >
                        {elevenLabsVoices.map((v) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.name} ({v.category || 'Custom Voice'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={localVoiceConfig.elevenLabsVoiceId}
                          onChange={(e) =>
                            setLocalVoiceConfig({ ...localVoiceConfig, elevenLabsVoiceId: e.target.value })
                          }
                          placeholder="Voice ID e.g. 21m00Tcm4TlvDq8ikWAM (Rachel)"
                          id="elevenlabs-voice-id-input"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                        />
                        <p className="text-xs text-slate-400">
                          To load all your custom cloned voices, navigate to the{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('apikeys')}
                            className="text-cyan-400 underline"
                          >
                            API Keys tab
                          </button>{' '}
                          and enter your ElevenLabs key.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> Web Speech System Voice
                  </h3>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Browser Installed Voice</label>
                    <select
                      value={localVoiceConfig.webSpeechVoiceName}
                      onChange={(e) =>
                        setLocalVoiceConfig({ ...localVoiceConfig, webSpeechVoiceName: e.target.value })
                      }
                      id="webspeech-voice-select"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">System Default Voice</option>
                      {availableWebVoices.map((v, i) => (
                        <option key={`${v.name}-${i}`} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Audio Controls (Volume, Rate, Pitch) */}
                {/* Speech Controls & Speaker Diagnostics */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" /> Speech Volume & Speaker Audio Controls
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                      Volume: {Math.round((localVoiceConfig.volume ?? 1.0) * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Volume Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400">Volume</label>
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {Math.round((localVoiceConfig.volume ?? 1.0) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={localVoiceConfig.volume ?? 1.0}
                        onChange={(e) =>
                          setLocalVoiceConfig({
                            ...localVoiceConfig,
                            volume: parseFloat(e.target.value),
                          })
                        }
                        id="volume-slider"
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    {/* Rate Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400">Speed / Rate</label>
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {localVoiceConfig.rate}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={localVoiceConfig.rate}
                        onChange={(e) =>
                          setLocalVoiceConfig({
                            ...localVoiceConfig,
                            rate: parseFloat(e.target.value),
                          })
                        }
                        id="rate-slider"
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    {/* Pitch Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400">Pitch</label>
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {localVoiceConfig.pitch}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={localVoiceConfig.pitch}
                        onChange={(e) =>
                          setLocalVoiceConfig({
                            ...localVoiceConfig,
                            pitch: parseFloat(e.target.value),
                          })
                        }
                        id="pitch-slider"
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Speaker Diagnostics & Test Actions */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await SpeechSynthesisService.playTestTone(localVoiceConfig.volume || 0.8);
                        }}
                        id="play-hardware-chime-btn"
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-colors"
                        title="Plays a direct hardware audio tone to check speaker sound"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Play Speaker Test Chime</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestSpeech}
                      disabled={isTestingVoice}
                      id="test-voice-btn"
                      className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 rounded-xl text-xs font-bold text-cyan-200 flex items-center gap-2 transition-colors shadow-sm"
                    >
                      {isTestingVoice ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      )}
                      <span>{isTestingVoice ? 'Speaking Sample...' : 'Test Full Voice Output'}</span>
                    </button>
                  </div>

                  {/* Troubleshooting Guide Card */}
                  <div className="mt-4 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-2">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <VolumeX className="w-4 h-4" /> Speaker Not Playing Audio? Quick Troubleshooting Steps:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                      <li>
                        <strong className="text-slate-200">Device Hardware Volume & Mute Switch:</strong> Check that your phone/computer volume is turned up and physical mute switch is off.
                      </li>
                      <li>
                        <strong className="text-slate-200">Browser Audio Permission:</strong> Click <span className="text-amber-300 font-semibold">Play Speaker Test Chime</span> above once to grant browser audio context permission.
                      </li>
                      <li>
                        <strong className="text-slate-200">Voice Engine Selection:</strong> If using Web Speech API, select a specific system voice from the dropdown. If using ElevenLabs, ensure your ElevenLabs API key is valid.
                      </li>
                      <li>
                        <strong className="text-slate-200">Bluetooth / Headphones:</strong> Check if audio is connected to Bluetooth headphones or external outputs.
                      </li>
                    </ul>
                  </div>
                </div>
            </div>
          )}

          {/* TAB: AI ENGINE & GROQ MODELS */}
          {activeTab === 'aimodel' && (
            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select AI Response Prediction Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setLocalAIConfig({
                        ...localAIConfig,
                        provider: 'groq',
                        modelId: localAIConfig.modelId.startsWith('llama')
                          ? localAIConfig.modelId
                          : 'llama-3.3-70b-versatile',
                      })
                    }
                    id="select-provider-groq"
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      localAIConfig.provider === 'groq'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200 ring-2 ring-amber-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        Groq Llama Models <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </span>
                      {localAIConfig.provider === 'groq' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      Ultra low latency prediction engine using Llama 3.1 8B Instant and Llama 3.3 70B Versatile on Groq LPUs.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLocalAIConfig({
                        ...localAIConfig,
                        provider: 'gemini',
                        modelId: 'gemini-3.6-flash',
                      })
                    }
                    id="select-provider-gemini"
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      localAIConfig.provider === 'gemini'
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        Google Gemini <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      </span>
                      {localAIConfig.provider === 'gemini' && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-xs text-slate-400">
                      Server-side Gemini 3.6 Flash engine with high contextual reasoning for AAC options.
                    </p>
                  </button>
                </div>
              </div>

              {/* Groq Specific Model Selector & Key */}
              {localAIConfig.provider === 'groq' ? (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> Groq Model Selection & Instance
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Groq LPUs Active
                    </span>
                  </div>

                  {/* Model Dropdown */}
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Select Groq Llama Model
                    </label>
                    <select
                      value={localAIConfig.modelId}
                      onChange={(e) => setLocalAIConfig({ ...localAIConfig, modelId: e.target.value })}
                      id="groq-model-select"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="llama-3.1-8b-instant">
                        Llama 3.1 8B Instant (llama-3.1-8b-instant)
                      </option>
                      <option value="llama-3.3-70b-versatile">
                        Llama 3.3 70B Versatile (llama-3.3-70b-versatile)
                      </option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Select between <strong className="text-amber-300">llama-3.1-8b-instant</strong> for ultra low latency speech predictions and <strong className="text-amber-300">llama-3.3-70b-versatile</strong> for complex contextual conversations.
                    </p>
                  </div>

                  {/* Groq API Key */}
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">
                      Groq API Key (Optional if set in environment)
                    </label>
                    <div className="relative">
                      <input
                        type={showGroqKey ? 'text' : 'password'}
                        value={localAIConfig.groqApiKey}
                        onChange={(e) => setLocalAIConfig({ ...localAIConfig, groqApiKey: e.target.value })}
                        placeholder="e.g. gsk_..."
                        id="groq-api-key-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGroqKey(!showGroqKey)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Obtain your free Groq API key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">console.groq.com</a>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Brain className="w-4 h-4 text-cyan-400" /> Google Gemini Options
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-1">Select Gemini Version</label>
                    <select
                      value={localAIConfig.modelId}
                      onChange={(e) => setLocalAIConfig({ ...localAIConfig, modelId: e.target.value })}
                      id="gemini-model-select"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Default & Fast)</option>
                      <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Test Model Connection */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-200">Test AI Prediction Engine</span>
                  <p className="text-xs text-slate-400">Generates sample AAC response options using active selected model</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestAIModel}
                  disabled={isTestingAI}
                  id="test-ai-model-btn"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 flex items-center gap-2 whitespace-nowrap"
                >
                  {isTestingAI ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  <span>{isTestingAI ? 'Testing Engine...' : 'Test Selected Model'}</span>
                </button>
              </div>

              {aiTestResult && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-300">
                  {aiTestResult}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: API KEYS & INTEGRATIONS */}
          {activeTab === 'apikeys' && (
            <div className="space-y-6">
              {/* ElevenLabs API Key Section */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" /> ElevenLabs Voice Clone API Key
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Optional
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    API Key (Saved locally in browser)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={localVoiceConfig.elevenLabsApiKey}
                        onChange={(e) =>
                          setLocalVoiceConfig({
                            ...localVoiceConfig,
                            elevenLabsApiKey: e.target.value,
                          })
                        }
                        placeholder="e.g. sk_1234567890abcdef..."
                        id="elevenlabs-api-key-input"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pr-10 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchElevenLabsVoices(localVoiceConfig.elevenLabsApiKey)}
                      disabled={isLoadingVoices || !localVoiceConfig.elevenLabsApiKey}
                      id="fetch-elevenlabs-voices-btn"
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap shadow-md"
                    >
                      {isLoadingVoices ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Fetch Cloned Voices'
                      )}
                    </button>
                  </div>

                  {voiceStatusMsg && (
                    <p className="text-xs mt-2 text-cyan-300 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {voiceStatusMsg}
                    </p>
                  )}
                </div>

                {elevenLabsVoices.length > 0 && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Available Voice Clones ({elevenLabsVoices.length})
                    </label>
                    <select
                      value={localVoiceConfig.elevenLabsVoiceId}
                      onChange={(e) => {
                        const selected = elevenLabsVoices.find((v) => v.voice_id === e.target.value);
                        setLocalVoiceConfig({
                          ...localVoiceConfig,
                          elevenLabsVoiceId: e.target.value,
                          elevenLabsVoiceName: selected?.name || 'Cloned Voice',
                        });
                      }}
                      id="elevenlabs-voice-select-apikeys"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      {elevenLabsVoices.map((v) => (
                        <option key={v.voice_id} value={v.voice_id}>
                          {v.name} ({v.category || 'Cloned Voice'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Gemini AI Backend Status */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-cyan-400" /> Gemini AI Engine (Response Prediction)
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Server Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Shadow Speak AI utilizes Gemini server-side AI endpoints to analyze ambient transcript context and predict natural, 1-tap conversational options in real time.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PATIENT PROFILE & CONTEXT */}
          {activeTab === 'profile' && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="w-4 h-4" /> Patient & Personalization Context
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">Patient Name</label>
                  <input
                    type="text"
                    value={localProfile.name}
                    onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                    id="profile-name-input"
                    placeholder="e.g. Alex"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">
                    Response Language
                  </label>
                  <select
                    value={localProfile.language || 'English'}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        language: e.target.value as UserProfile['language'],
                      })
                    }
                    id="profile-language-select"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-medium text-cyan-300"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (देवनागरी लिपि)</option>
                    <option value="Hinglish">Hinglish (देवनागरी लिपि)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">
                    Preferred Response Tone
                  </label>
                  <select
                    value={localProfile.tone}
                    onChange={(e) =>
                      setLocalProfile({
                        ...localProfile,
                        tone: e.target.value as UserProfile['tone'],
                      })
                    }
                    id="profile-tone-select"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Warm & Natural">Warm & Natural</option>
                    <option value="Direct & Concise">Direct & Concise</option>
                    <option value="Enthusiastic">Enthusiastic</option>
                    <option value="Formal & Polite">Formal & Polite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">
                  Caregivers & Family Context
                </label>
                <input
                  type="text"
                  value={localProfile.caregiverContext}
                  onChange={(e) =>
                    setLocalProfile({ ...localProfile, caregiverContext: e.target.value })
                  }
                  placeholder="e.g. Spouse Sarah, Nurse Maria"
                  id="profile-caregiver-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">Key Relationships</label>
                <input
                  type="text"
                  value={localProfile.relationships}
                  onChange={(e) =>
                    setLocalProfile({ ...localProfile, relationships: e.target.value })
                  }
                  placeholder="e.g. Family, healthcare providers, friends"
                  id="profile-relationships-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">
                  Condition & Speech Notes
                </label>
                <textarea
                  rows={2}
                  value={localProfile.conditionNotes}
                  onChange={(e) =>
                    setLocalProfile({ ...localProfile, conditionNotes: e.target.value })
                  }
                  placeholder="e.g. ALS speech impairment - clear cognition, communicates with AAC"
                  id="profile-condition-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Communication Style 10-Question Assessment Launcher */}
              <div className="p-4 bg-slate-900 border border-cyan-900/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      10-Question Communication Style Assessment
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {localProfile.communicationStyleSummary
                        ? localProfile.communicationStyleSummary
                        : 'Answer 10 daily life questions with 10 options each to tailor AI prediction style to your unique personality.'}
                    </p>
                  </div>

                  {onOpenStyleAssessment && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStyleAssessment();
                      }}
                      id="launch-style-quiz-settings-btn"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap shrink-0"
                    >
                      {localProfile.communicationStyleTraits && localProfile.communicationStyleTraits.length > 0
                        ? 'Retake 10-Q Assessment'
                        : 'Start 10-Q Assessment'}
                    </button>
                  )}
                </div>

                {localProfile.communicationStyleTraits && localProfile.communicationStyleTraits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {localProfile.communicationStyleTraits.map((trait, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-200 border border-cyan-800/80"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY & DISPLAY */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Eye-Gaze & Target Accessibility
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Default Setting
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-100">
                        High Visibility Target UI
                      </span>
                      {isEyeGazeMode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                          Active (Recommended)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                      Enlarges predicted response cards, widens touch/eye-gaze dwell targets, enhances border contrast, and maximizes readability for motor & speech impaired users.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onToggleEyeGaze}
                    id="toggle-eyegaze-settings"
                    className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shrink-0 ${
                      isEyeGazeMode
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isEyeGazeMode ? 'Enabled (Default)' : 'Disabled'}</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300">Accessibility Feature Breakdown:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                    <li>Expanded min-height and padding on response cards for accurate eye tracking</li>
                    <li>Prominent numerical indicators (1-4) and high-contrast selection outlines</li>
                    <li>Direct 1-tap speech and reasoning expansion capabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
          <div className="text-xs text-slate-500 hidden sm:block">
            Changes save immediately to local storage
          </div>
          <div className="flex items-center space-x-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              id="save-settings-btn"
              className="px-6 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/60 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

