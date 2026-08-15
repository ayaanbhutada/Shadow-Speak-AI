import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  getQuestionsForLanguage,
  getCompiledTraitsAndSummary,
  CommunicationQuestion,
  CommunicationOption
} from '../data/communicationStyleQuestions';
import {
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  Heart,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  Utensils,
  Calendar,
  Languages,
  CheckSquare,
  Square,
  RotateCcw
} from 'lucide-react';

interface CommunicationStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const CommunicationStyleModal: React.FC<CommunicationStyleModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  // Active question step (1 to 10)
  const [activeQuestionId, setActiveQuestionId] = useState<number>(1);

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

  if (!isOpen) return null;

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
        // If clicking already selected item, remove it unless it's the last one, or allow removal
        updatedList = currentList.filter((id) => id !== optionId);
        if (updatedList.length === 0) {
          // If empty, keep at least this option or allow empty
          updatedList = [optionId];
        }
      } else {
        // Add new option to selection
        updatedList = [...currentList, optionId];
      }

      return {
        ...prev,
        [questionId]: updatedList,
      };
    });
  };

  // Select All options for current question
  const handleSelectAllCurrent = (questionId: number) => {
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

    // Update tone automatically if primary single preference is set
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
    onClose();
  };

  const getQuestionIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-purple-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-amber-400" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-teal-400" />;
      default: return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 font-black shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Communication Style Assessment
                </h2>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 whitespace-nowrap">
                  10 Qs • Multi-Answer Selection
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configuring style for <span className="text-cyan-300 font-bold">{userProfile.name}</span>
                {' • '}
                <span className="text-emerald-400 font-bold">{answerCount} preferences active</span>
              </p>
            </div>
          </div>

          {/* Profile Language Inherited Badge & Close Button */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Read-Only Profile Language Badge */}
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
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
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Close Assessment"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Step Tabs (1 to 10) */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {questions.map((q) => {
            const isCurrent = activeQuestionId === q.id;
            const qAnswerList = answers[q.id] || [];
            const selectedCount = qAnswerList.length;

            return (
              <button
                key={q.id}
                onClick={() => setActiveQuestionId(q.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                    : selectedCount > 0
                    ? 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {q.id}
                </span>
                <span>{q.category}</span>
                {selectedCount > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isCurrent
                        ? 'bg-slate-950/80 text-cyan-300'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {selectedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Question Title Header */}
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getQuestionIcon(currentQuestion.iconName)}
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                  Question {currentQuestion.id} of {totalQuestions} • {currentQuestion.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                  {profileLanguage}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {currentQuestion.questionText}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {currentQuestion.subtitle}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-slate-400">Selected Answers:</span>
                <div className="text-sm font-black text-cyan-300">
                  {currentSelectedIds.length} of 10 Options Chosen
                </div>
              </div>

              {/* Quick actions for current question */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectAllCurrent(currentQuestion.id)}
                  className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-800/80 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleResetCurrent(currentQuestion.id)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  title="Reset to Option #1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* 10 Options Grid with Multiple Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                Select Any Combination of Responses ({profileLanguage}):
              </span>
              <span className="text-xs text-slate-400">
                Multiple selections will shape AI predictions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = currentSelectedIds.includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleOption(currentQuestion.id, opt.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 relative group ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/85 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Multi-Select Checkbox & Number Indicator */}
                    <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                      <div
                        className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
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

                    <div className="flex-1 pr-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {opt.title}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${
                            isSelected
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {opt.traitTag}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compiled Style Traits Bar */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live Communication Style Profile Preview ({profileLanguage}):
              </span>
              <span className="text-xs text-slate-400">
                {currentTraits.length} Distinct Traits Selected Across All 10 Questions
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentTraits.map((trait, idx) => (
                <span
                  key={idx}
                  className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>{trait}</span>
                </span>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
              "{currentSummary}"
            </p>
          </div>
        </div>

        {/* Footer Navigation & Save */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeQuestionId > 1 && (
              <button
                type="button"
                onClick={() => setActiveQuestionId((prev) => Math.max(1, prev - 1))}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Q</span>
              </button>
            )}

            {activeQuestionId < totalQuestions && (
              <button
                type="button"
                onClick={() => setActiveQuestionId((prev) => Math.min(totalQuestions, prev + 1))}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Multi-Answer Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
