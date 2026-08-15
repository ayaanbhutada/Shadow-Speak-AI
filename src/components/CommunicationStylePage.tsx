import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  getQuestionsForLanguage,
  getCompiledTraitsAndSummary,
  CommunicationQuestion,
  CommunicationOption,
} from '../data/communicationStyleQuestions';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  Heart,
  Sliders,
  ArrowRight,
  Save,
  Check,
  Utensils,
  Calendar,
  Languages,
  CheckSquare,
  Square,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface CommunicationStylePageProps {
  onBack: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

const QUESTION_STYLE_CONFIG: Record<
  number,
  { bgClass: string; textClass: string; icon: React.FC<{ className?: string }> }
> = {
  1: { bgClass: 'bg-blue-300', textClass: 'text-blue-950', icon: MessageSquare },
  2: { bgClass: 'bg-purple-300', textClass: 'text-purple-950', icon: Heart },
  3: { bgClass: 'bg-emerald-300', textClass: 'text-emerald-950', icon: Sparkles },
  4: { bgClass: 'bg-amber-300', textClass: 'text-amber-950', icon: ShieldAlert },
  5: { bgClass: 'bg-sky-300', textClass: 'text-sky-950', icon: Stethoscope },
  6: { bgClass: 'bg-pink-300', textClass: 'text-pink-950', icon: Utensils },
  7: { bgClass: 'bg-violet-300', textClass: 'text-violet-950', icon: Calendar },
  8: { bgClass: 'bg-rose-300', textClass: 'text-rose-950', icon: ShieldAlert },
  9: { bgClass: 'bg-orange-300', textClass: 'text-orange-950', icon: Sliders },
  10: { bgClass: 'bg-teal-300', textClass: 'text-teal-950', icon: Languages },
};

export const CommunicationStylePage: React.FC<CommunicationStylePageProps> = ({
  onBack,
  userProfile,
  onSaveProfile,
}) => {
  // Active question step (1 to 10)
  const [activeQuestionId, setActiveQuestionId] = useState<number>(1);
  const [hasSaved, setHasSaved] = useState(false);

  // Directly derive the language from the created/selected patient profile data
  const profileLanguage: 'English' | 'Hindi' | 'Hinglish' = userProfile.language || 'English';

  // Multi-select answers map: questionId -> array of optionIds (1 to 10)
  const [answers, setAnswers] = useState<Record<number, number[]>>(() => {
    const raw = userProfile.communicationAnswers;
    if (raw && typeof raw === 'object') {
      const normalized: Record<number, number[]> = {};
      for (let i = 1; i <= 10; i++) {
        const val = raw[i];
        if (Array.isArray(val)) {
          normalized[i] = val.length > 0 ? val : [1];
        } else if (typeof val === 'number' && val > 0) {
          normalized[i] = [val];
        } else {
          normalized[i] = [1];
        }
      }
      return normalized;
    }

    return {
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
  });

  // Retrieve questions dynamically according to the patient profile language
  const questions: CommunicationQuestion[] = getQuestionsForLanguage(profileLanguage);
  const totalQuestions = questions.length;
  const currentQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0];

  // Selected options for current question
  const currentSelectedIds = answers[activeQuestionId] || [];

  // Toggle multi-select option
  const handleToggleOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const currentList = prev[questionId] || [];
      const isAlreadySelected = currentList.includes(optionId);

      let updatedList: number[];
      if (isAlreadySelected) {
        updatedList = currentList.filter((id) => id !== optionId);
        if (updatedList.length === 0) {
          updatedList = [optionId];
        }
      } else {
        updatedList = [...currentList, optionId];
      }

      return {
        ...prev,
        [questionId]: updatedList,
      };
    });
  };

  // Select all 10 options for current question
  const handleSelectAll = (questionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }));
  };

  // Reset to default single option for current question
  const handleResetCurrent = (questionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [1],
    }));
  };

  const { traits: currentTraits, summaryText: currentSummary, answerCount } =
    getCompiledTraitsAndSummary(answers, profileLanguage);

  const handleSave = () => {
    const { traits, summaryText } = getCompiledTraitsAndSummary(answers, profileLanguage);

    let updatedTone = userProfile.tone;
    const q1List = answers[1] || [1];
    if (q1List.includes(8)) updatedTone = 'Direct & Concise';
    else if (q1List.includes(2) || q1List.includes(5)) updatedTone = 'Warm & Natural';
    else if (q1List.includes(4) || q1List.includes(7)) updatedTone = 'Formal & Polite';
    else if (q1List.includes(3) || q1List.includes(9)) updatedTone = 'Enthusiastic';

    const updatedProfile: UserProfile = {
      ...userProfile,
      language: profileLanguage,
      tone: updatedTone,
      communicationAnswers: answers,
      communicationStyleSummary: summaryText,
      communicationStyleTraits: traits,
    };

    onSaveProfile(updatedProfile);
    setHasSaved(true);
    setTimeout(() => {
      onBack();
    }, 300);
  };

  const getQuestionIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-purple-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5 text-amber-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-teal-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Full Webpage Navigation Header */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white px-4 py-3.5 sm:px-8 sticky top-0 z-30 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              id="style-back-btn"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Return to Previous Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Board</span>
            </button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 rounded-xl text-slate-950 font-black shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    Communication Style Assessment
                  </h1>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 hidden md:inline">
                    10 Questions • Multi-Selection
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Configuring style for <span className="text-cyan-300 font-bold">{userProfile.name}</span>
                  {' • '}
                  <span className="text-emerald-400 font-bold">{answerCount} preferences active</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Action & Language Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
              <Languages className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">
                  Profile Language
                </span>
                <span className="text-xs font-black text-cyan-300 leading-tight">
                  {profileLanguage}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              id="top-save-style-btn"
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

      {/* Main Full Page Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col space-y-6">
        {/* Top 10-Question Navigation: 2 Rows of 5 Questions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Style Scenarios (10 Questions)
            </span>
            <span className="text-xs font-bold text-cyan-400">
              Select any scenario to customize
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {questions.map((q) => {
              const isCurrent = activeQuestionId === q.id;
              const qAnswerList = answers[q.id] || [];
              const selectedCount = qAnswerList.length;
              const styleMeta = QUESTION_STYLE_CONFIG[q.id] || {
                bgClass: 'bg-cyan-300',
                textClass: 'text-cyan-950',
                icon: Sparkles,
              };
              const IconComponent = styleMeta.icon;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveQuestionId(q.id)}
                  id={`step-question-btn-${q.id}`}
                  className={`flex items-center justify-between gap-2.5 py-2 pl-2 pr-3.5 rounded-full transition-all text-left group ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50 font-bold scale-[1.02]'
                      : 'bg-slate-950/70 border border-slate-800/80 text-slate-200 hover:text-white hover:bg-slate-800/70 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full ${styleMeta.bgClass} ${styleMeta.textClass} flex items-center justify-center font-black text-xs shrink-0 shadow-sm`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold truncate block">
                        {q.id}. {q.category}
                      </span>
                    </div>
                  </div>

                  {selectedCount > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                        isCurrent
                          ? 'bg-blue-950 text-blue-200 border border-blue-400/40'
                          : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}
                    >
                      {selectedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Question Title & Scenario Banner: Subheadings on Left, Rich Details Box on Right */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Subheadings & Metadata */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-full ${
                    QUESTION_STYLE_CONFIG[currentQuestion.id]?.bgClass || 'bg-cyan-300'
                  } ${
                    QUESTION_STYLE_CONFIG[currentQuestion.id]?.textClass || 'text-cyan-950'
                  } flex items-center justify-center font-bold shrink-0 shadow-md`}
                >
                  {getQuestionIcon(currentQuestion.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                      Scenario {currentQuestion.id} of {totalQuestions}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {currentQuestion.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                    {currentQuestion.subtitle}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Personalize how the AAC model constructs phrases for this clinical/social scenario.
              </p>

              {/* Bulk Selection Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectAll(currentQuestion.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-colors"
                  title="Select all 10 variations"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select All (10)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResetCurrent(currentQuestion.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                  title="Reset to 1 primary option"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Right Column: Expanded Rich Details Box */}
            <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-inner space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Primary Conversational Prompt
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800">
                    {profileLanguage}
                  </span>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    {currentSelectedIds.length} Active
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                  {currentQuestion.questionText}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Multi-option selection enabled
                </span>
                <span>•</span>
                <span>Synthesizes in user's preferred cadence</span>
              </div>
            </div>
          </div>

          {/* 10 Option Multi-Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span>Select all phrasing variations that sound natural to you:</span>
              <span className="text-cyan-400 font-bold">
                {currentSelectedIds.length} of {currentQuestion.options.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentSelectedIds.includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleOption(currentQuestion.id, opt.id)}
                    id={`option-card-${currentQuestion.id}-${opt.id}`}
                    className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start space-x-4 group cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    {/* Custom Checkbox & Number Indicator */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 mt-0.5">
                      <div
                        className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                        }`}
                      >
                        #{opt.id}
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-cyan-400 border-cyan-300 text-slate-950'
                            : 'border-slate-700 bg-slate-900/80 group-hover:border-slate-500'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Rich Option Details */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {opt.title}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                            isSelected
                              ? 'bg-cyan-900/80 text-cyan-200 border-cyan-600'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {opt.traitTag}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/70">
                        <p
                          className={`text-xs sm:text-sm font-medium leading-relaxed italic transition-colors ${
                            isSelected
                              ? 'text-slate-100'
                              : 'text-slate-300 group-hover:text-slate-100'
                          }`}
                        >
                          "{opt.description}"
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls between questions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveQuestionId((prev) => Math.max(1, prev - 1))}
              disabled={activeQuestionId === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <span className="text-xs font-extrabold text-slate-400 hidden sm:inline">
              Step {activeQuestionId} of {totalQuestions}
            </span>

            {activeQuestionId < totalQuestions ? (
              <button
                type="button"
                onClick={() => setActiveQuestionId((prev) => Math.min(totalQuestions, prev + 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Finish & Save Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Compiled Style Summary Preview Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-black text-white">
                Live Compiled Communication Persona
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              {currentTraits.length} Distinct Traits Active
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentTraits.map((trait, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-cyan-900/60 shadow-sm"
              >
                {trait}
              </span>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 font-mono bg-slate-950/80 p-4 rounded-2xl border border-slate-800 leading-relaxed">
            {currentSummary}
          </p>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-2 pb-8 border-t border-slate-800">
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
            id="bottom-save-style-btn"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-base shadow-xl shadow-cyan-950/60 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Style Profile & Return</span>
          </button>
        </div>
      </main>
    </div>
  );
};
