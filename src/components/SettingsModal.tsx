import React, { useState, useEffect } from 'react';
import { X, Volume2, Key, User, Sliders, Check, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { VoiceEngineConfig, UserProfile, ElevenLabsVoice } from '../types';
import { SpeechSynthesisService } from '../lib/speechServices';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceConfig: VoiceEngineConfig;
  onSaveVoiceConfig: (config: VoiceEngineConfig) => void;
  userProfile: UserProfile;
  onSaveUserProfile: (profile: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  voiceConfig,
  onSaveVoiceConfig,
  userProfile,
  onSaveUserProfile,
}) => {
  const [localVoiceConfig, setLocalVoiceConfig] = useState<VoiceEngineConfig>(voiceConfig);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [availableWebVoices, setAvailableWebVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [elevenLabsVoices, setElevenLabsVoices] = useState<ElevenLabsVoice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState('');

  useEffect(() => {
    setLocalVoiceConfig(voiceConfig);
  }, [voiceConfig]);

  useEffect(() => {
    setLocalProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    if (isOpen) {
      const voices = SpeechSynthesisService.getAvailableWebVoices();
      setAvailableWebVoices(voices);

      // Listen for voiceschanged event if browser populates voices asynchronously
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
          'x-elevenlabs-key': apiKey
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid API Key or network issue');
      }
      const data = await res.json();
      if (data.voices) {
        setElevenLabsVoices(data.voices);
        setVoiceStatusMsg(`Loaded ${data.voices.length} ElevenLabs voices!`);
        if (!localVoiceConfig.elevenLabsVoiceId && data.voices.length > 0) {
          setLocalVoiceConfig((prev) => ({
            ...prev,
            elevenLabsVoiceId: data.voices[0].voice_id,
            elevenLabsVoiceName: data.voices[0].name
          }));
        }
      }
    } catch (err: any) {
      setVoiceStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveVoiceConfig(localVoiceConfig);
    onSaveUserProfile(localProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Voice & Profile Settings</h2>
          </div>
          <button
            onClick={onClose}
            id="close-settings-btn"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Section 1: TTS Engine Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Text-To-Speech (TTS) Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalVoiceConfig({ ...localVoiceConfig, engine: 'web-speech' })}
                id="select-web-speech-engine"
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  localVoiceConfig.engine === 'web-speech'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Web Speech API (Default)</span>
                  {localVoiceConfig.engine === 'web-speech' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400">
                  Built-in browser synthesis. Works instantly without any external API keys or cost.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLocalVoiceConfig({ ...localVoiceConfig, engine: 'elevenlabs' })}
                id="select-elevenlabs-engine"
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  localVoiceConfig.engine === 'elevenlabs'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30'
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
                  Ultra-realistic zero-shot voice cloning & natural expression (Optional API key required).
                </p>
              </button>
            </div>
          </div>

          {/* Section 2 Engine Details */}
          {localVoiceConfig.engine === 'elevenlabs' ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Key className="w-4 h-4" /> ElevenLabs Voice Clone Setup
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">ElevenLabs API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={localVoiceConfig.elevenLabsApiKey}
                    onChange={(e) =>
                      setLocalVoiceConfig({ ...localVoiceConfig, elevenLabsApiKey: e.target.value })
                    }
                    placeholder="e.g. sk_12345..."
                    id="elevenlabs-api-key-input"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => fetchElevenLabsVoices(localVoiceConfig.elevenLabsApiKey)}
                    disabled={isLoadingVoices || !localVoiceConfig.elevenLabsApiKey}
                    id="fetch-elevenlabs-voices-btn"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                  >
                    {isLoadingVoices ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Fetch Voices'}
                  </button>
                </div>
                {voiceStatusMsg && (
                  <p className="text-xs mt-1 text-cyan-300 font-mono">{voiceStatusMsg}</p>
                )}
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
                        elevenLabsVoiceName: selected?.name || 'Cloned Voice'
                      });
                    }}
                    id="elevenlabs-voice-select"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {elevenLabsVoices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {v.name} ({v.category || 'Custom Cloned Voice'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={localVoiceConfig.elevenLabsVoiceId}
                    onChange={(e) =>
                      setLocalVoiceConfig({ ...localVoiceConfig, elevenLabsVoiceId: e.target.value })
                    }
                    placeholder="Enter Voice ID (e.g. 21m00Tcm4TlvDq8ikWAM)"
                    id="elevenlabs-voice-id-input"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Web Speech Voice Settings
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Browser System Voice</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Speech Rate ({localVoiceConfig.rate}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={localVoiceConfig.rate}
                    onChange={(e) =>
                      setLocalVoiceConfig({
                        ...localVoiceConfig,
                        rate: parseFloat(e.target.value)
                      })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Pitch ({localVoiceConfig.pitch}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={localVoiceConfig.pitch}
                    onChange={(e) =>
                      setLocalVoiceConfig({
                        ...localVoiceConfig,
                        pitch: parseFloat(e.target.value)
                      })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3 User Profile for AI Context */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Patient & AI Personalization Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={localProfile.name}
                  onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                  id="profile-name-input"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Preferred Response Tone</label>
                <select
                  value={localProfile.tone}
                  onChange={(e) =>
                    setLocalProfile({
                      ...localProfile,
                      tone: e.target.value as UserProfile['tone']
                    })
                  }
                  id="profile-tone-select"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
                >
                  <option value="Warm & Natural">Warm & Natural</option>
                  <option value="Direct & Concise">Direct & Concise</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Formal & Polite">Formal & Polite</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Caregiver / Family Context</label>
              <input
                type="text"
                value={localProfile.caregiverContext}
                onChange={(e) =>
                  setLocalProfile({ ...localProfile, caregiverContext: e.target.value })
                }
                placeholder="e.g. Spouse Sarah, Nurse Maria, Family members"
                id="profile-caregiver-input"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            id="save-settings-btn"
            className="px-6 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/60"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
