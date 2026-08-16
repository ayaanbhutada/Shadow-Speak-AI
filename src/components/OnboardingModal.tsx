import React, { useEffect, useState } from 'react';
import { User, Check, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveUserProfile: (profile: UserProfile) => void;
}

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Hinglish', 'Kannada'];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveUserProfile,
}) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);

  useEffect(() => {
    setLocalProfile(userProfile);
  }, [userProfile]);

  const toggleLanguage = (language: string) => {
    setLocalProfile((prev) => ({
      ...prev,
      languagePreferences: prev.languagePreferences?.includes(language)
        ? prev.languagePreferences.filter((item) => item !== language)
        : [...(prev.languagePreferences || []), language],
    }));
  };

  const handleSave = () => {
    onSaveUserProfile(localProfile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Welcome to Shadow Speak AI</h2>
            <p className="text-sm text-slate-400">Create a static profile to personalize speech suggestions and language context.</p>
          </div>
        </div>

        <div className="p-6 space-y-6 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Name</label>
              <input
                type="text"
                value={localProfile.name}
                onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                placeholder="Enter name"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Age</label>
              <input
                type="number"
                min="0"
                value={localProfile.age}
                onChange={(e) => setLocalProfile({ ...localProfile, age: e.target.value })}
                placeholder="Age"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Job / Role</label>
              <input
                type="text"
                value={localProfile.job}
                onChange={(e) => setLocalProfile({ ...localProfile, job: e.target.value })}
                placeholder="e.g. Engineer, Student"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Education</label>
              <input
                type="text"
                value={localProfile.education}
                onChange={(e) => setLocalProfile({ ...localProfile, education: e.target.value })}
                placeholder="e.g. High School, College"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Preferred Language(s)</label>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGE_OPTIONS.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    localProfile.languagePreferences.includes(language)
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-200'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                  }`}
                >
                  <span>{language}</span>
                  {localProfile.languagePreferences.includes(language) && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              Profile context helps the AI choose more natural, useful speech suggestions.
            </div>
            <p>We will use this information to personalize responses and keep language preferences in mind for future suggestions.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-6 py-5 border-t border-slate-800 bg-slate-900 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-slate-600 hover:bg-slate-700"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
