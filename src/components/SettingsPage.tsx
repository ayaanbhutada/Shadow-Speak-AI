import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
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
  Save,
  Languages,
} from 'lucide-react';
import { VoiceEngineConfig, UserProfile, ElevenLabsVoice, AIModelConfig } from '../types';
import { SpeechSynthesisService } from '../lib/speechServices';
import { shouldBypassServer, predictResponsesDirectly } from '../lib/clientAiService';

interface SettingsPageProps {
  onBack: () => void;
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
  geminiApiKey: '',
};

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
];

const DEFAULT_GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
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
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [availableGeminiModels, setAvailableGeminiModels] = useState<string[]>(DEFAULT_GEMINI_MODELS);
  const [availableGroqModels, setAvailableGroqModels] = useState<string[]>(DEFAULT_GROQ_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

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
  }, []);

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

  const loadAvailableModels = async (provider: 'gemini' | 'groq', apiKey: string) => {
    if (!apiKey) return;
    setIsLoadingModels(true);

    try {
      if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Groq model fetch failed (${res.status})`);
        }

        const data = await res.json();
        const modelIds = Array.isArray(data?.data)
          ? data.data
              .map((item: any) => item?.id)
              .filter((id: string | undefined) => Boolean(id))
          : [];

        const resolvedModels = modelIds.length > 0 ? modelIds : DEFAULT_GROQ_MODELS;
        setAvailableGroqModels(resolvedModels);

        setLocalAIConfig((prev) => ({
          ...prev,
          modelId: resolvedModels.includes(prev.modelId) ? prev.modelId : resolvedModels[0],
        }));
        return;
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) {
        throw new Error(`Gemini model fetch failed (${res.status})`);
      }

      const data = await res.json();
      const modelIds = Array.isArray(data?.models)
        ? data.models
            .map((item: any) => item?.name?.replace(/^models\//, ''))
            .filter((id: string | undefined) => Boolean(id) && /gemini/i.test(id || ''))
        : [];

      const resolvedModels = modelIds.length > 0 ? modelIds : DEFAULT_GEMINI_MODELS;
      setAvailableGeminiModels(resolvedModels);

      setLocalAIConfig((prev) => ({
        ...prev,
        modelId: resolvedModels.includes(prev.modelId) ? prev.modelId : resolvedModels[0],
      }));
    } catch (error) {
      if (provider === 'groq') {
        setAvailableGroqModels(DEFAULT_GROQ_MODELS);
      } else {
        setAvailableGeminiModels(DEFAULT_GEMINI_MODELS);
      }
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (localAIConfig.provider === 'groq' && localAIConfig.groqApiKey) {
      loadAvailableModels('groq', localAIConfig.groqApiKey);
    }
  }, [localAIConfig.provider, localAIConfig.groqApiKey]);

  useEffect(() => {
    if (localAIConfig.provider === 'gemini' && localAIConfig.geminiApiKey) {
      loadAvailableModels('gemini', localAIConfig.geminiApiKey);
    }
  }, [localAIConfig.provider, localAIConfig.geminiApiKey]);

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
      if (shouldBypassServer(localAIConfig)) {
        const result = await predictResponsesDirectly(
          'Hey Alex, do you want coffee or tea this morning?',
          localProfile,
          2,
          localAIConfig
        );
        if (result && result.responses && result.responses.length > 0) {
          const sample = result.responses[0].text;
          const provider = result.providerUsed || localAIConfig.provider;
          const model = result.modelUsed || localAIConfig.modelId;
          setAiTestResult(`Success (Direct)! [${provider.toUpperCase()} (${model})]: "${sample}"`);
        } else {
          setAiTestResult('No predictions returned');
        }
        return;
      }

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

  const handleSave = () => {
    onSaveVoiceConfig(localVoiceConfig);
    onSaveUserProfile(localProfile);
    if (onSaveAIModelConfig) {
      onSaveAIModelConfig(localAIConfig);
    }
    setHasSaved(true);
    setTimeout(() => {
      onBack();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Full Webpage Navigation Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white px-4 py-3.5 sm:px-8 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              id="settings-back-btn"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Return to Communication Board"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Board</span>
            </button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-950 border border-cyan-700/60 rounded-xl text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  Settings & Preferences
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Voice Engine, AI Models (Groq / Gemini), Patient Profile & Accessibility
                </p>
              </div>
            </div>
          </div>

          {/* Save Button in Top Bar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              id="top-save-settings-btn"
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-sm transition-all shadow-md ${
                hasSaved
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-900/50'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 shadow-cyan-950/60 hover:scale-[1.02]'
              }`}
            >
              {hasSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{hasSaved ? 'Saved!' : 'Save & Return'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Settings Page Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Vertical Menu matching Google Material 3 pill design */}
          <aside className="w-full lg:w-72 shrink-0 bg-slate-900/90 border border-slate-800 rounded-3xl p-3.5 space-y-1.5 shadow-xl">
            <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
              Preferences
            </div>

            {/* 1. Voice & TTS */}
            <button
              type="button"
              onClick={() => setActiveTab('tts')}
              id="tab-btn-tts"
              className={`w-full flex items-center gap-3.5 py-1.5 pl-1.5 pr-5 rounded-full transition-all text-left group ${
                activeTab === 'tts'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/40 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-300 text-blue-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold truncate">Voice & TTS</span>
            </button>

            {/* 2. AI Models (Groq / Gemini) */}
            <button
              type="button"
              onClick={() => setActiveTab('aimodel')}
              id="tab-btn-aimodel"
              className={`w-full flex items-center gap-3.5 py-1.5 pl-1.5 pr-5 rounded-full transition-all text-left group ${
                activeTab === 'aimodel'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/40 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-300 text-purple-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold truncate">AI Models (Groq / Gemini)</span>
            </button>

            {/* 3. API Keys */}
            <button
              type="button"
              onClick={() => setActiveTab('apikeys')}
              id="tab-btn-apikeys"
              className={`w-full flex items-center gap-3.5 py-1.5 pl-1.5 pr-5 rounded-full transition-all text-left group ${
                activeTab === 'apikeys'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/40 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-sky-300 text-sky-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Key className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold truncate">API Keys</span>
            </button>

            {/* 4. Patient Profile & Style */}
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              id="tab-btn-profile"
              className={`w-full flex items-center gap-3.5 py-1.5 pl-1.5 pr-5 rounded-full transition-all text-left group ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/40 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-300 text-emerald-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold truncate">Patient Profile & Style</span>
            </button>

            {/* 5. Accessibility & Eye-Gaze */}
            <button
              type="button"
              onClick={() => setActiveTab('accessibility')}
              id="tab-btn-accessibility"
              className={`w-full flex items-center gap-3.5 py-1.5 pl-1.5 pr-5 rounded-full transition-all text-left group ${
                activeTab === 'accessibility'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400/40 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-300 text-amber-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold truncate">Accessibility & Eye-Gaze</span>
            </button>

            {onOpenStyleAssessment && (
              <>
                <div className="h-px bg-slate-800 my-2" />
                <button
                  type="button"
                  onClick={onOpenStyleAssessment}
                  id="tab-btn-style-assessment"
                  className="w-full flex items-center gap-3.5 py-1.5 pl-1.5 pr-5 rounded-full transition-all text-left text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-300 text-pink-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold block truncate">Style Questionnaire</span>
                  </div>
                </button>
              </>
            )}
          </aside>

          {/* Right Content Area for Selected Tab */}
          <div className="flex-1 w-full min-w-0 space-y-6">

            {/* Tab 1: Voice & TTS */}
            {activeTab === 'tts' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Main Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Voice & TTS
                  </h1>
                </div>

                {/* Status Tip Banner matching Google Checkup style */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5 shadow-md">
                  <div className="w-9 h-9 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-100 block">
                      Voice synthesis is active
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {localVoiceConfig.engine === 'web-speech'
                        ? 'Using built-in zero-latency Web Speech engine'
                        : 'Configured for natural ElevenLabs AI voice synthesis'}
                    </span>
                  </div>
                </div>

                {/* Section 1: Speech Engine */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Speech engine selection</h2>
                    <p className="text-xs text-slate-400">
                      Choose between browser-native offline speech or high-fidelity AI cloned voices
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
                    {/* Row 1: Engine Switcher */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Primary Speech Engine
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          {localVoiceConfig.engine === 'web-speech'
                            ? 'Web Speech API (offline, zero latency, free)'
                            : 'ElevenLabs AI (hyper-realistic cloned human voice)'}
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            type="button"
                            onClick={() => setLocalVoiceConfig((prev) => ({ ...prev, engine: 'web-speech' }))}
                            id="select-web-speech-engine"
                            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                              localVoiceConfig.engine === 'web-speech'
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>Web Speech</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocalVoiceConfig((prev) => ({ ...prev, engine: 'elevenlabs' }))}
                            id="select-elevenlabs-engine"
                            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                              localVoiceConfig.engine === 'elevenlabs'
                                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>ElevenLabs</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Voice Picker (Web Speech) */}
                    {localVoiceConfig.engine === 'web-speech' && (
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-md">
                          <span className="font-bold text-sm text-slate-100 block">
                            System Voice
                          </span>
                          <span className="text-xs text-slate-400 block leading-relaxed">
                            Select which installed browser voice to use ({availableWebVoices.length} available)
                          </span>
                        </div>
                        <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>Installed Voice Profiles</span>
                            <span className="text-cyan-400 font-mono">{availableWebVoices.length} Found</span>
                          </div>
                          <select
                            value={localVoiceConfig.webSpeechVoiceName}
                            onChange={(e) =>
                              setLocalVoiceConfig((prev) => ({ ...prev, webSpeechVoiceName: e.target.value }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                          >
                            <option value="">Default System Voice</option>
                            {availableWebVoices.map((v) => (
                              <option key={`${v.name}-${v.lang}`} value={v.name}>
                                {v.name} ({v.lang})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Row 2 (ElevenLabs): API Key & Voice selector */}
                    {localVoiceConfig.engine === 'elevenlabs' && (
                      <>
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="space-y-1.5 max-w-md">
                            <span className="font-bold text-sm text-slate-100 block">
                              ElevenLabs API Key
                            </span>
                            <span className="text-xs text-slate-400 block leading-relaxed">
                              Required for voice cloning synthesis from your ElevenLabs account
                            </span>
                          </div>
                          <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                              <span>Secret Token</span>
                              <span className="text-purple-400">elevenlabs.io</span>
                            </div>
                            <div className="relative">
                              <input
                                type={showApiKey ? 'text' : 'password'}
                                value={localVoiceConfig.elevenLabsApiKey || ''}
                                onChange={(e) =>
                                  setLocalVoiceConfig((prev) => ({ ...prev, elevenLabsApiKey: e.target.value }))
                                }
                                placeholder="sk_..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-16 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                              >
                                {showApiKey ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="space-y-1.5 max-w-md">
                            <span className="font-bold text-sm text-slate-100 block">
                              ElevenLabs Voice
                            </span>
                            <span className="text-xs text-slate-400 block leading-relaxed">
                              Fetch and choose your custom cloned vocal profile
                            </span>
                          </div>
                          <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shrink-0">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => fetchElevenLabsVoices(localVoiceConfig.elevenLabsApiKey || '')}
                                disabled={!localVoiceConfig.elevenLabsApiKey || isLoadingVoices}
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVoices ? 'animate-spin' : ''}`} />
                                <span>{isLoadingVoices ? 'Fetching...' : 'Fetch Cloned Voices'}</span>
                              </button>
                              {voiceStatusMsg && (
                                <span className="text-[11px] font-medium text-emerald-400 truncate">
                                  {voiceStatusMsg}
                                </span>
                              )}
                            </div>

                            {elevenLabsVoices.length > 0 && (
                              <select
                                value={localVoiceConfig.elevenLabsVoiceId}
                                onChange={(e) => {
                                  const vId = e.target.value;
                                  const vName = elevenLabsVoices.find((v) => v.voice_id === vId)?.name || 'Custom';
                                  setLocalVoiceConfig((prev) => ({
                                    ...prev,
                                    elevenLabsVoiceId: vId,
                                    elevenLabsVoiceName: vName,
                                  }));
                                }}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                              >
                                {elevenLabsVoices.map((v) => (
                                  <option key={v.voice_id} value={v.voice_id}>
                                    {v.name} ({v.category || 'Cloned'})
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Section 2: Audio Parameters */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Audio parameters</h2>
                    <p className="text-xs text-slate-400">
                      Fine-tune playback rate, cadence, and vocal pitch
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
                    {/* Rate Slider */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Speaking Rate (Speed)
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Adjust speech speed (0.5x slow to 1.8x fast)
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 shrink-0">
                        <input
                          type="range"
                          min="0.5"
                          max="1.8"
                          step="0.1"
                          value={localVoiceConfig.rate}
                          onChange={(e) =>
                            setLocalVoiceConfig((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-black text-cyan-300 w-12 text-right shrink-0 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
                          {localVoiceConfig.rate}x
                        </span>
                      </div>
                    </div>

                    {/* Pitch Slider */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Voice Pitch
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Fine-tune acoustic frequency higher or lower
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 shrink-0">
                        <input
                          type="range"
                          min="0.5"
                          max="1.5"
                          step="0.1"
                          value={localVoiceConfig.pitch}
                          onChange={(e) =>
                            setLocalVoiceConfig((prev) => ({ ...prev, pitch: parseFloat(e.target.value) }))
                          }
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-black text-cyan-300 w-12 text-right shrink-0 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
                          {localVoiceConfig.pitch}x
                        </span>
                      </div>
                    </div>

                    {/* Test Audio Row */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Audition Voice
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Listen to a sample phrase with current settings
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] flex justify-end shrink-0">
                        <button
                          type="button"
                          onClick={handleTestSpeech}
                          disabled={isTestingVoice}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-60 shrink-0"
                        >
                          <Play className={`w-4 h-4 ${isTestingVoice ? 'animate-bounce' : ''}`} />
                          <span>{isTestingVoice ? 'Speaking Sample...' : 'Test Voice Audio'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: AI Models */}
            {activeTab === 'aimodel' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Main Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    AI Models (Groq / Gemini)
                  </h1>
                </div>

                {/* Status Tip Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5 shadow-md">
                  <div className="w-9 h-9 rounded-full bg-emerald-400/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-100 block">
                      AI intelligence provider connected
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Active engine: {localAIConfig.provider === 'gemini' ? 'Google Gemini 2.5 Flash' : 'Groq LPU (Llama 3.3 70B)'}
                    </span>
                  </div>
                </div>

                {/* Section 1: AI Provider */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Inference engine</h2>
                    <p className="text-xs text-slate-400">
                      Select which conversational model generates real-time predictions
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
                    {/* Row 1: AI Provider Choice */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          AI Provider
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          {localAIConfig.provider === 'gemini'
                            ? 'Google Gemini (server-side, rich clinical reasoning)'
                            : 'Groq Cloud (ultra-fast LPU inference)'}
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setLocalAIConfig((prev) => ({
                              ...prev,
                              provider: 'gemini',
                              modelId: 'gemini-3.6-flash',
                            }))
                          }
                          className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            localAIConfig.provider === 'gemini'
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Google Gemini</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLocalAIConfig((prev) => ({
                              ...prev,
                              provider: 'groq',
                              modelId: 'llama-3.3-70b-versatile',
                            }))
                          }
                          className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            localAIConfig.provider === 'groq'
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>Groq Cloud</span>
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Model Version */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Model Version
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Select the specific model identifier
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>Architecture</span>
                          <span className="text-emerald-400">
                            {isLoadingModels ? 'Loading models...' : 'High Precision'}
                          </span>
                        </div>
                        {localAIConfig.provider === 'gemini' ? (
                          <select
                            value={localAIConfig.modelId}
                            onChange={(e) =>
                              setLocalAIConfig((prev) => ({ ...prev, modelId: e.target.value }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                          >
                            {availableGeminiModels.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={localAIConfig.modelId}
                            onChange={(e) =>
                              setLocalAIConfig((prev) => ({ ...prev, modelId: e.target.value }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                          >
                            {availableGroqModels.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Row 3 (Gemini only): API Key */}
                    {localAIConfig.provider === 'gemini' && (
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-md">
                          <span className="font-bold text-sm text-slate-100 block">
                            Gemini API Key
                          </span>
                          <span className="text-xs text-slate-400 block leading-relaxed">
                            Enter your Google AI Studio API key for direct browser generation (bypasses server)
                          </span>
                        </div>
                        <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                          <div className="relative">
                            <input
                              type={showGeminiKey ? 'text' : 'password'}
                              value={localAIConfig.geminiApiKey || ''}
                              onChange={(e) => {
                                const nextKey = e.target.value;
                                setLocalAIConfig((prev) => ({ ...prev, geminiApiKey: nextKey }));
                                if (nextKey) {
                                  loadAvailableModels('gemini', nextKey);
                                }
                              }}
                              placeholder="e.g. AIzaSy..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-16 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowGeminiKey(!showGeminiKey)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                            >
                              {showGeminiKey ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Row 3 (Groq only): API Key */}
                    {localAIConfig.provider === 'groq' && (
                      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-md">
                          <span className="font-bold text-sm text-slate-100 block">
                            Groq API Key
                          </span>
                          <span className="text-xs text-slate-400 block leading-relaxed">
                            Enter your Groq console API key for LPU generation
                          </span>
                        </div>
                        <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                          <div className="relative">
                            <input
                              type={showGroqKey ? 'text' : 'password'}
                              value={localAIConfig.groqApiKey || ''}
                              onChange={(e) => {
                                const nextKey = e.target.value;
                                setLocalAIConfig((prev) => ({ ...prev, groqApiKey: nextKey }));
                                if (nextKey) {
                                  loadAvailableModels('groq', nextKey);
                                }
                              }}
                              placeholder="gsk_..."
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-16 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowGroqKey(!showGroqKey)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                            >
                              {showGroqKey ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Row 4: Connection Test */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Test Connection
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Verify API connectivity with a live test prompt
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] flex justify-end shrink-0">
                        <button
                          type="button"
                          onClick={handleTestAIModel}
                          disabled={isTestingAI}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-60 shrink-0"
                        >
                          <Sparkles className={`w-4 h-4 ${isTestingAI ? 'animate-spin' : ''}`} />
                          <span>{isTestingAI ? 'Testing Connection...' : 'Test AI Connection'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {aiTestResult && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                      {aiTestResult}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: API Keys */}
            {activeTab === 'apikeys' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Main Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    API Keys
                  </h1>
                </div>

                {/* Status Tip Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5 shadow-md">
                  <div className="w-9 h-9 rounded-full bg-blue-400/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-100 block">
                      Credentials stored client-side
                    </span>
                    <span className="text-xs text-slate-400 block">
                      API tokens are saved securely in your browser local storage
                    </span>
                  </div>
                </div>

                {/* Section: Connected Services */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">External service keys</h2>
                    <p className="text-xs text-slate-400">
                      Manage secret tokens for custom integrations
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
                    {/* Row 1: Gemini API Key */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Google Gemini API
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Bypasses the backend server when custom key is provided
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>Token</span>
                          <span className="text-cyan-400">Direct Client Call</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showGeminiKey ? 'text' : 'password'}
                            value={localAIConfig.geminiApiKey || ''}
                            onChange={(e) =>
                              setLocalAIConfig((prev) => ({ ...prev, geminiApiKey: e.target.value }))
                            }
                            placeholder="e.g. AIzaSy..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-16 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                          >
                            {showGeminiKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: ElevenLabs Key */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          ElevenLabs Voice API
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Used for ultra-natural cloned vocal synthesis
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>Token</span>
                          <span className="text-purple-400">Voice Synthesis</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            value={localVoiceConfig.elevenLabsApiKey || ''}
                            onChange={(e) =>
                              setLocalVoiceConfig((prev) => ({ ...prev, elevenLabsApiKey: e.target.value }))
                            }
                            placeholder="sk_..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-16 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                          >
                            {showApiKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Groq Key */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Groq Cloud LPU
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Optional key for high-throughput Llama 3.3 generation
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>Token</span>
                          <span className="text-amber-400">LPU Fast Inference</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showGroqKey ? 'text' : 'password'}
                            value={localAIConfig.groqApiKey || ''}
                            onChange={(e) =>
                              setLocalAIConfig((prev) => ({ ...prev, groqApiKey: e.target.value }))
                            }
                            placeholder="gsk_..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-16 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowGroqKey(!showGroqKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-200"
                          >
                            {showGroqKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Patient Profile & Style */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Main Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Patient Profile & Style
                  </h1>
                </div>

                {/* Status Tip Banner */}
                {onOpenStyleAssessment && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-base text-white">
                          Communication Style Questionnaire
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300">
                        Take the 10-scenario assessment to fine-tune your personalized vocabulary and conversational nuance.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenStyleAssessment}
                      id="open-questionnaire-from-settings"
                      className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shrink-0 transition-all"
                    >
                      <span>Take Questionnaire</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Section: Profile Info */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Personal details</h2>
                    <p className="text-xs text-slate-400">
                      Context used to tailor vocabulary, relationship tone, and phrasing
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
                    {/* Row 1: Name */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Patient Name
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Name of the primary AAC user
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
                        <input
                          type="text"
                          value={localProfile.name}
                          onChange={(e) => setLocalProfile((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-bold focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Row 2: Language */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Primary Language
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Language spoken in daily conversations
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
                        <select
                          value={localProfile.language || 'English'}
                          onChange={(e) =>
                            setLocalProfile((prev) => ({
                              ...prev,
                              language: e.target.value as 'English' | 'Hindi' | 'Hinglish',
                            }))
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Hinglish">Hinglish (Urban Blend)</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Tone */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Preferred Tone
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Default conversational demeanor
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
                        <select
                          value={localProfile.tone}
                          onChange={(e) =>
                            setLocalProfile((prev) => ({
                              ...prev,
                              tone: e.target.value as any,
                            }))
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Warm & Natural">Warm & Natural</option>
                          <option value="Direct & Concise">Direct & Concise</option>
                          <option value="Enthusiastic">Enthusiastic</option>
                          <option value="Formal & Polite">Formal & Polite</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Caregiver Context */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Caregiver Context
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Key family members, aides, or doctors
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
                        <input
                          type="text"
                          value={localProfile.caregiverContext}
                          onChange={(e) =>
                            setLocalProfile((prev) => ({ ...prev, caregiverContext: e.target.value }))
                          }
                          placeholder="e.g. Spouse Sarah & Nurse Maria"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Row 5: Relationships */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Social Circle
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Family, healthcare team, close friends
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
                        <input
                          type="text"
                          value={localProfile.relationships}
                          onChange={(e) =>
                            setLocalProfile((prev) => ({ ...prev, relationships: e.target.value }))
                          }
                          placeholder="e.g. Family, doctors, friends"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* Row 6: Clinical Notes */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Condition & Clinical Notes
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Guidance on speech impairment, preferences, or cognitive details
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
                        <textarea
                          value={localProfile.conditionNotes}
                          onChange={(e) =>
                            setLocalProfile((prev) => ({ ...prev, conditionNotes: e.target.value }))
                          }
                          rows={2}
                          placeholder="e.g. ALS speech impairment, clear cognition"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-400 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Accessibility */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Main Heading */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Accessibility & Eye-Gaze
                  </h1>
                </div>

                {/* Status Tip Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5 shadow-md">
                  <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                    <Eye className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-100 block">
                      Assistive device optimization
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Mode: {isEyeGazeMode ? 'High-Contrast Eye-Gaze Layout Active' : 'Standard Touch / Mouse Layout'}
                    </span>
                  </div>
                </div>

                {/* Section: Assistive Layout */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Assistive navigation settings</h2>
                    <p className="text-xs text-slate-400">
                      Optimize sizing, hit targets, and shortcuts for eye-trackers and single-switch devices
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
                    {/* Row 1: Eye-Gaze Mode Toggle */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Eye-Gaze Friendly Mode
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Enlarges buttons, increases padding, adds high-contrast focus rings, and optimizes spacing for Tobii/PCEye
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between shrink-0">
                        <span className="text-xs text-slate-300 font-semibold">
                          {isEyeGazeMode ? 'High-Contrast & Large Hit Target Mode' : 'Standard Compact Mode'}
                        </span>
                        <button
                          type="button"
                          onClick={onToggleEyeGaze}
                          id="toggle-eyegaze-mode-btn"
                          className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                            isEyeGazeMode ? 'bg-blue-600' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out shadow-md ${
                              isEyeGazeMode ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Keyboard Shortcut Table */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                      <div className="space-y-1.5 max-w-md">
                        <span className="font-bold text-sm text-slate-100 block">
                          Keyboard & Switch Shortcuts
                        </span>
                        <span className="text-xs text-slate-400 block leading-relaxed">
                          Quick access hotkeys for hands-free or single-switch AAC vocalization
                        </span>
                      </div>
                      <div className="w-full sm:w-[380px] md:w-[440px] p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 font-medium">Keys 1, 2, 3, 4</span>
                          <span className="font-bold text-cyan-300">Speak Prediction</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 font-medium">Enter Key</span>
                          <span className="font-bold text-cyan-300">Speak Ready Bar</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 font-medium">Escape Key</span>
                          <span className="font-bold text-cyan-300">Clear Ready Bar</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 font-medium">Double Tap Need</span>
                          <span className="font-bold text-cyan-300">Speak Urgent Need</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-4 pb-8 border-t border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-colors"
          >
            Cancel & Return
          </button>

          <button
            type="button"
            onClick={handleSave}
            id="bottom-save-settings-btn"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-base shadow-xl shadow-cyan-950/60 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Preferences & Return</span>
          </button>
        </div>
      </main>
    </div>
  );
};
