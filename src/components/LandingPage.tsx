import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getCompiledTraitsAndSummary } from '../data/communicationStyleQuestions';
import { Eye, User, UserPlus, Check, Sparkles, Volume2, Globe, Shield, ArrowRight, Trash2, HeartHandshake, Speech, ArrowLeft, Play, Cpu, MessageSquare } from 'lucide-react';

interface LandingPageProps {
  profiles: UserProfile[];
  activeProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  onCreateProfile: (newProfile: UserProfile) => void;
  onDeleteProfile: (profileName: string) => void;
  onOpenStyleAssessment?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onOpenStyleAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<'splash' | 'select' | 'create'>('splash');

  // Form state for Create Profile
  const [name, setName] = useState('');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [tone, setTone] = useState<'Warm & Natural' | 'Direct & Concise' | 'Enthusiastic' | 'Formal & Polite'>('Warm & Natural');
  const [caregiverContext, setCaregiverContext] = useState('');
  const [relationships, setRelationships] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a profile name.');
      return;
    }

    const defaultAnswers: Record<number, number[]> = {
      1: [1],
      2: [1],
      3: [1],
      4: [1],
      5: [1],
      6: [1],
      7: [1],
      8: [1],
      9: [1],
      10: [1],
    };

    const { traits, summaryText } = getCompiledTraitsAndSummary(defaultAnswers, language);

    const newProfile: UserProfile = {
      name: name.trim(),
      language,
      tone,
      caregiverContext: caregiverContext.trim() || 'Caregivers & Family',
      relationships: relationships.trim() || 'Family, healthcare team, friends',
      conditionNotes: conditionNotes.trim() || 'Speech assistance requested',
      communicationAnswers: defaultAnswers,
      communicationStyleSummary: summaryText,
      communicationStyleTraits: traits,
    };

    onCreateProfile(newProfile);
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Brand Header */}
      <header className="border-b border-slate-900 bg-slate-900/80 backdrop-blur py-4 px-6 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Home Click */}
          <button
            onClick={() => setActiveTab('splash')}
            className="flex items-center space-x-3 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Eye className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Shadow Speak <span className="text-cyan-400">AI</span>
              </span>
            </div>
          </button>

          {/* Top Right Corner Profile Navigation Options */}
          <div className="flex items-center gap-2">
            {activeTab !== 'splash' && (
              <button
                onClick={() => setActiveTab('splash')}
                className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Splash Screen</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('select')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border ${
                activeTab === 'select'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Select Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border ${
                activeTab === 'create'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Profile</span>
            </button>

            <button
              onClick={() => onSelectProfile(activeProfile)}
              className="hidden md:flex items-center gap-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md hover:opacity-95 transition-opacity"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch App ({activeProfile.name.split(' ')[0]})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Main Body Content */}
      {activeTab === 'splash' && (
        /* Pure Splash Screen Landing Page */
        <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16 w-full flex-1 flex flex-col justify-center items-center text-center">
          {/* Hero Content */}
          <div className="space-y-6 max-w-3xl">
            {/* Giant Bold Headline */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              Shadow Speak <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">AI</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 font-semibold leading-relaxed max-w-2xl mx-auto">
              Empowering speech-impaired individuals with real-time ambient conversation intelligence.
            </p>

            {/* Launch & Action Callout Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onSelectProfile(activeProfile)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 shadow-xl shadow-cyan-500/20 hover:opacity-95 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Launch App ({activeProfile.name})</span>
              </button>

              <button
                onClick={() => setActiveTab('select')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm sm:text-base bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-5 h-5 text-cyan-400" />
                <span>Select Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm sm:text-base bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center justify-center gap-2 transition-colors"
              >
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Create New Profile</span>
              </button>
            </div>
          </div>

          {/* Feature Highlight Cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Ambient Context AI</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Listens to surrounding conversations in real-time and continuously updates predicted response options.
              </p>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">1-Tap Expansion</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Click any predicted response to expand into 4 detailed reasoning options matching the exact same intent.
              </p>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Voice Synthesis</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Integrates ElevenLabs neural voice cloning and Web Speech TTS for immediate speech generation.
              </p>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Multilingual Tone</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Supports English, Hindi, and Hinglish with customizable boundary refusal and tone adjustments.
              </p>
            </div>
          </div>
        </main>
      )}

      {activeTab === 'select' && (
        /* Dedicated Full Page: Select Profile */
        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => setActiveTab('splash')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Splash Screen</span>
              </button>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Select User Profile</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Choose a profile to launch Shadow Speak AI with personalized language and caregiver context.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New</span>
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((prof, idx) => {
                const isSelected = activeProfile.name === prof.name;

                return (
                  <div
                    key={prof.name || idx}
                    className={`group relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      {/* Profile Card Top */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-black text-white text-lg shadow-md">
                            {prof.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                              {prof.name}
                              {isSelected && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                                  Active
                                </span>
                              )}
                            </h3>
                            <span className="text-xs font-semibold text-slate-400">
                              Language: {prof.language || 'English'}
                            </span>
                          </div>
                        </div>

                        {profiles.length > 1 && !isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProfile(prof.name);
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Delete profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Profile Attributes */}
                      <div className="space-y-2 my-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Speech className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-medium">Tone:</span>
                          <span className="font-bold text-slate-200">{prof.tone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-300">
                          <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium">Caregiver:</span>
                          <span className="font-bold text-slate-200 truncate">{prof.caregiverContext}</span>
                        </div>

                        {/* Communication Style 10-Question Assessment Traits */}
                        <div className="pt-1 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Communication Style:
                            </span>
                            {onOpenStyleAssessment && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectProfile(prof);
                                  onOpenStyleAssessment();
                                }}
                                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 underline"
                              >
                                {prof.communicationStyleTraits && prof.communicationStyleTraits.length > 0 ? 'Edit Style (10 Qs)' : 'Take Style Quiz'}
                              </button>
                            )}
                          </div>

                          {prof.communicationStyleTraits && prof.communicationStyleTraits.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {prof.communicationStyleTraits.slice(0, 5).map((trait, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                                >
                                  {trait}
                                </span>
                              ))}
                              {prof.communicationStyleTraits.length > 5 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-400">
                                  +{prof.communicationStyleTraits.length - 5}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500 italic">
                              Default speech style • Tap "Take Style Quiz" to set 10 custom Q&A preferences.
                            </p>
                          )}
                        </div>

                        {prof.conditionNotes && (
                          <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80 italic">
                            "{prof.conditionNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Select & Start Action */}
                    <button
                      onClick={() => onSelectProfile(prof)}
                      className={`w-full mt-2 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                        isSelected
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Continue as {prof.name}</span>
                        </>
                      ) : (
                        <>
                          <span>Select & Launch AAC</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {activeTab === 'create' && (
        /* Dedicated Full Page: Create Profile */
        <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12 w-full flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <button
              onClick={() => setActiveTab('splash')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Splash Screen</span>
            </button>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Create New User Profile</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure speech preferences, caregiver names, and communication tone for real-time predictions.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs font-bold rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Profile Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    User Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Patel or Grandfather Arthur"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>

                {/* Primary Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Primary Language
                  </label>
                  <select
                    value={language}
                    onChange={(e: any) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none transition-colors"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Hinglish">Hinglish (Conversational)</option>
                  </select>
                </div>

                {/* Speaking Tone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Default Communication Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e: any) => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none transition-colors"
                  >
                    <option value="Warm & Natural">Warm & Natural</option>
                    <option value="Direct & Concise">Direct & Concise</option>
                    <option value="Enthusiastic">Enthusiastic & Energetic</option>
                    <option value="Formal & Polite">Formal & Polite</option>
                  </select>
                </div>

                {/* Caregiver Context */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Caregiver & Family Names
                  </label>
                  <input
                    type="text"
                    value={caregiverContext}
                    onChange={(e) => setCaregiverContext(e.target.value)}
                    placeholder="e.g. Spouse Sarah & Nurse Maria"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>

                {/* Key Relationships */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Relationships & Social Circle
                  </label>
                  <input
                    type="text"
                    value={relationships}
                    onChange={(e) => setRelationships(e.target.value)}
                    placeholder="e.g. Family, healthcare team, doctors, close friends"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>

                {/* Speech / Health Condition Notes */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Speech & Voice Preferences (Notes for AI Engine)
                  </label>
                  <textarea
                    rows={2}
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    placeholder="e.g. ALS speech impairment - prefers direct answers with full boundary refusal options."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('splash')}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Profile & Launch AAC</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        Shadow Speak AI · Real-Time AAC & Ambient Conversation Assistant
      </footer>
    </div>
  );
};
