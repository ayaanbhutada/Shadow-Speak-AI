import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Loader2, Volume2, Wand2, ArrowRight, RotateCw } from 'lucide-react';
import { PredictedResponse, UserProfile, AIModelConfig } from '../types';
import { shouldBypassServer, expandResponseDirectly } from '../lib/clientAiService';

export type ResponseIntent = 'negative' | 'positive' | 'question' | 'energy' | 'alternative' | 'gratitude';

export function detectResponseIntent(text: string = '', tag: string = ''): ResponseIntent {
  const combined = `${text} ${tag}`.toLowerCase();

  // Negative / Refusal / Boundary / Disagreement
  const negativeRegex = /\b(no|not|don't|dont|disagree|refuse|boundary|stop|unwell|frustrated|hate|never|neither|can't|cannot|won't|wont|bad|skip|pass)\b|नहीं|ना|मना|अस्वीकृति|असहमति|डिसअग्री|रिफ्यूजल|कम्फर्टेबल नहीं|पसंद नहीं/i;
  if (negativeRegex.test(combined)) {
    return 'negative';
  }

  // Question / Clarification / Inquiry
  const questionRegex = /\?|\b(what|how|why|when|where|who|which|could you|can you|repeat|clarify|tell me)\b|क्या|कहाँ|कब|कैसे|कौन|बताओ|पूछ|प्रश्न|क्वेश्चन/i;
  if (questionRegex.test(combined)) {
    return 'question';
  }

  // Energy / Rest / Fatigue / Comfort
  const energyRegex = /\b(tired|rest|energy|sleep|exhausted|quiet|break|nap|pain|lie down|relax|hungry)\b|आराम|थक|नींद|एनर्जी|रेस्ट|विश्राम|शांति/i;
  if (energyRegex.test(combined)) {
    return 'energy';
  }

  // Alternative / Preference
  const alternativeRegex = /\b(prefer|instead|alternative|other|rather|choice|another)\b|दूसरा|अन्य|ऑप्शन|विकल्प|प्रेफर/i;
  if (alternativeRegex.test(combined)) {
    return 'alternative';
  }

  // Gratitude / Thanks
  const gratitudeRegex = /\b(thank|thanks|grateful|appreciate)\b|धन्यवाद|शुक्रिया|थैंक्स|आभार|अप्रिशिएट/i;
  if (gratitudeRegex.test(combined)) {
    return 'gratitude';
  }

  // Default is Positive / Affirmative
  return 'positive';
}

export interface DetailedInPlaceOption {
  id: string;
  label: string;
  text: string;
  tone: 'warm' | 'negative' | 'polite' | 'question' | 'standard';
  intent: ResponseIntent;
}

interface PredictedResponsesProps {
  responses: PredictedResponse[];
  selectedResponseId: string | null;
  onSelectResponse: (resp: PredictedResponse) => void;
  onSpeakImmediately: (resp: PredictedResponse) => void;
  onSpeakText?: (text: string) => void;
  onPrepareText?: (text: string) => void;
  onOpenDetails: (resp: PredictedResponse) => void;
  isLoading: boolean;
  isEyeGazeMode: boolean;
  userProfile?: UserProfile;
  transcript?: string;
  aiModelConfig?: AIModelConfig;
}

export const PredictedResponses: React.FC<PredictedResponsesProps> = ({
  responses,
  selectedResponseId,
  onSelectResponse,
  onSpeakImmediately,
  onSpeakText,
  onOpenDetails,
  isLoading,
  isEyeGazeMode,
  userProfile,
  transcript = '',
  aiModelConfig,
}) => {
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);
  const [aiDetailsMap, setAiDetailsMap] = useState<Record<string, { loading: boolean; options: DetailedInPlaceOption[]; error?: string }>>({});

  const lang = userProfile?.language || 'English';

  // Fallback in-place options customized for the exact response text & intent
  const getFallbackInPlaceOptions = (resp: PredictedResponse): DetailedInPlaceOption[] => {
    const baseText = resp.text;
    const detailsText = resp.details || baseText;
    const intent = detectResponseIntent(baseText, resp.tag);

    if (intent === 'negative') {
      if (lang === 'Hindi') {
        return [
          {
            id: `fb-neg-1-${resp.id}`,
            label: 'स्पष्ट अस्वीकृति (Direct Refusal)',
            text: detailsText !== baseText && /नहीं|ना|मना/i.test(detailsText) ? detailsText : `${baseText} मैं इससे बिल्कुल सहमत नहीं हूँ और ऐसा नहीं करना चाहूँगा।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: `fb-neg-2-${resp.id}`,
            label: 'विनम्र अस्वीकृति (Polite Decline)',
            text: `${baseText} धन्यवाद पूछने के लिए, परंतु मैं विनम्रतापूर्वक मना करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: `fb-neg-3-${resp.id}`,
            label: 'व्यक्तिगत सीमा (Personal Boundary)',
            text: `${baseText} मैं इसके साथ सहज महसूस नहीं कर रहा हूँ, कृपया इसे रहने दें।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: `fb-neg-4-${resp.id}`,
            label: 'दृढ़ निर्णय (Firm Choice)',
            text: `${baseText} यह विकल्प मेरे लिए सही नहीं रहेगा, कृपया इसे न करें।`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      }

      if (lang === 'Hinglish') {
        return [
          {
            id: `fb-neg-1-${resp.id}`,
            label: 'डायरेक्ट रिफ्यूजल (Direct Refusal)',
            text: detailsText !== baseText && /नो|डिसअग्री|मना/i.test(detailsText) ? detailsText : `${baseText} मैं इसके साथ बिल्कुल कम्फर्टेबल नहीं हूँ और मना करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: `fb-neg-2-${resp.id}`,
            label: 'पोलाइट रिफ्यूजल (Polite Decline)',
            text: `${baseText} थैंक यू पूछने के लिए, पर मैं पोलाइटली मना करूँगा।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: `fb-neg-3-${resp.id}`,
            label: 'फर्म बाउंड्री (Firm Boundary)',
            text: `${baseText} यह मेरे लिए वर्क नहीं करेगा, सो प्लीज़ इसे यहीं ड्रॉप कर दो।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: `fb-neg-4-${resp.id}`,
            label: 'क्लियर डिसअग्री (Clear Disagreement)',
            text: `${baseText} मेरा बिल्कुल मूड नहीं है और मैं डिसअग्री करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      }

      return [
        {
          id: `fb-neg-1-${resp.id}`,
          label: 'Direct & Firm Refusal',
          text: detailsText !== baseText && !detailsText.toLowerCase().includes('great') ? detailsText : `${baseText} I disagree with this option and strongly prefer we do not proceed.`,
          tone: 'negative',
          intent: 'negative',
        },
        {
          id: `fb-neg-2-${resp.id}`,
          label: 'Polite & Respectful Decline',
          text: `${baseText} Thank you for asking, but I respectfully decline this choice today.`,
          tone: 'negative',
          intent: 'negative',
        },
        {
          id: `fb-neg-3-${resp.id}`,
          label: 'Personal Boundary & Comfort',
          text: `${baseText} That really does not feel right or comfortable for me right now.`,
          tone: 'negative',
          intent: 'negative',
        },
        {
          id: `fb-neg-4-${resp.id}`,
          label: 'Firm Decisive Disagreement',
          text: `${baseText} That is not going to work for me and I am firm on my decision.`,
          tone: 'negative',
          intent: 'negative',
        },
      ];
    }

    if (intent === 'question') {
      if (lang === 'Hindi') {
        return [
          {
            id: `fb-q-1-${resp.id}`,
            label: 'विस्तृत प्रश्न (Detailed Inquiry)',
            text: detailsText !== baseText ? detailsText : `${baseText} क्या आप इसके बारे में थोड़ा और विस्तार से समझा सकते हैं?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: `fb-q-2-${resp.id}`,
            label: 'सहयोगात्मक राय (Collaborative Input)',
            text: `${baseText} आपकी व्यक्तिगत पसंद या सलाह क्या है, मुझे भी बताएं।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: `fb-q-3-${resp.id}`,
            label: 'समय व योजना (Logistics Question)',
            text: `${baseText} इसमें कितना समय लगेगा और हमारी क्या योजना है?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: `fb-q-4-${resp.id}`,
            label: 'स्पष्टीकरण निवेदन (Clarification)',
            text: `${baseText} कृपया थोड़ा और स्पष्ट करें ताकि हम सही फैसला लें।`,
            tone: 'question',
            intent: 'question',
          },
        ];
      }

      return [
        {
          id: `fb-q-1-${resp.id}`,
          label: 'Detailed Inquiry',
          text: detailsText !== baseText ? detailsText : `${baseText} Could you share a few more details so we can discuss it thoroughly?`,
          tone: 'question',
          intent: 'question',
        },
        {
          id: `fb-q-2-${resp.id}`,
          label: 'Collaborative Question',
          text: `${baseText} I would love to hear your thoughts and recommendation on this as well.`,
          tone: 'question',
          intent: 'question',
        },
        {
          id: `fb-q-3-${resp.id}`,
          label: 'Timing & Logistics',
          text: `${baseText} What is the timeline and what are the exact steps we would take?`,
          tone: 'question',
          intent: 'question',
        },
        {
          id: `fb-q-4-${resp.id}`,
          label: 'Contextual Clarification',
          text: `${baseText} Please give me a little more context so we make the best decision.`,
          tone: 'question',
          intent: 'question',
        },
      ];
    }

    // Affirmative / Alternative / Energy / General Positive
    if (lang === 'Hindi') {
      return [
        {
          id: `fb-pos-1-${resp.id}`,
          label: 'विस्तृत एवं सौम्य (Detailed & Warm)',
          text: detailsText !== baseText ? detailsText : `${baseText} मुझे लगता है कि यह बहुत अच्छा विकल्प रहेगा और हम सब इसका आनंद ले सकते हैं।`,
          tone: 'warm',
          intent: intent,
        },
        {
          id: `fb-pos-2-${resp.id}`,
          label: 'उत्साही सहमति (Enthusiastic Confirmation)',
          text: `${baseText} यह विचार मुझे बहुत पसंद आया और मैं इसके लिए पूरी तरह तैयार हूँ।`,
          tone: 'warm',
          intent: intent,
        },
        {
          id: `fb-pos-3-${resp.id}`,
          label: 'सहयोगात्मक योजना (Collaborative Action)',
          text: `${baseText} चलिए इसी योजना पर आगे बढ़ते हैं, यही सबसे उत्तम समाधान है।`,
          tone: 'warm',
          intent: intent,
        },
        {
          id: `fb-pos-4-${resp.id}`,
          label: 'आभार व पुष्टि (Grateful Confirmation)',
          text: `${baseText} पूछने और मेरा ध्यान रखने के लिए आपका बहुत-बहुत धन्यवाद।`,
          tone: 'warm',
          intent: intent,
        },
      ];
    }

    if (lang === 'Hinglish') {
      return [
        {
          id: `fb-pos-1-${resp.id}`,
          label: 'इलाबोरेट & वार्म (Detailed & Warm)',
          text: detailsText !== baseText ? detailsText : `${baseText} आई थिंक यह आईडिया एकदम बेस्ट रहेगा और हम सब एन्जॉय करेंगे।`,
          tone: 'warm',
          intent: intent,
        },
        {
          id: `fb-pos-2-${resp.id}`,
          label: 'फुल अग्रीमेंट (Enthusiastic)',
          text: `${baseText} यह एकदम परफेक्ट प्लान है और मैं इसके लिए 100% रेडी हूँ!`,
          tone: 'warm',
          intent: intent,
        },
        {
          id: `fb-pos-3-${resp.id}`,
          label: 'कोलैबोरेटिव अग्री (Collaborative)',
          text: `${baseText} चलो इसी के साथ आगे बढ़ते हैं, यह हमारे लिए सबसे बेस्ट ऑप्शन है।`,
          tone: 'warm',
          intent: intent,
        },
        {
          id: `fb-pos-4-${resp.id}`,
          label: 'वार्म अप्रिशिएशन (Grateful Confirmation)',
          text: `${baseText} थैंक यू सो मच मुझसे पूछने और केयर करने के लिए।`,
          tone: 'warm',
          intent: intent,
        },
      ];
    }

    return [
      {
        id: `fb-pos-1-${resp.id}`,
        label: 'Elaborate & Warm',
        text: detailsText !== baseText ? detailsText : `${baseText} I feel this is the best path forward, and I really appreciate you checking with me.`,
        tone: 'warm',
        intent: intent,
      },
      {
        id: `fb-pos-2-${resp.id}`,
        label: 'Enthusiastic Confirmation',
        text: `${baseText} That sounds wonderful and I am completely on board with that choice.`,
        tone: 'warm',
        intent: intent,
      },
      {
        id: `fb-pos-3-${resp.id}`,
        label: 'Collaborative Action',
        text: `${baseText} Let's go ahead with that right away—I think it will work out great.`,
        tone: 'warm',
        intent: intent,
      },
      {
        id: `fb-pos-4-${resp.id}`,
        label: 'Thoughtful Nuance',
        text: `${baseText} That fits my preferences and gives me great comfort right now.`,
        tone: 'warm',
        intent: intent,
      },
    ];
  };

  // Fetch AI detailed options sending the question (transcript) and selected option (resp.text)
  const fetchAiDetailedOptions = async (resp: PredictedResponse, forceRefresh = false) => {
    const existing = aiDetailsMap[resp.id];
    if (existing?.options?.length && !forceRefresh && !existing.loading) {
      return;
    }

    const initialFallbacks = getFallbackInPlaceOptions(resp);
    setAiDetailsMap((prev) => ({
      ...prev,
      [resp.id]: { loading: true, options: prev[resp.id]?.options?.length ? prev[resp.id].options : initialFallbacks },
    }));

    const detectedIntent = detectResponseIntent(resp.text, resp.tag);

    try {
      if (shouldBypassServer(aiModelConfig)) {
        const result = await expandResponseDirectly(
          resp.text,
          resp.tag,
          transcript || '',
          userProfile || null,
          aiModelConfig!
        );
        if (result && result.options && Array.isArray(result.options) && result.options.length > 0) {
          const formatted: DetailedInPlaceOption[] = result.options.slice(0, 4).map((item: any, idx: number) => ({
            id: `ai-det-${resp.id}-${Date.now()}-${idx}`,
            label: item.label || `Variation ${idx + 1}`,
            text: item.text,
            tone: item.tone || (detectedIntent === 'negative' ? 'negative' : detectedIntent === 'question' ? 'question' : 'warm'),
            intent: detectedIntent,
          }));

          setAiDetailsMap((prev) => ({
            ...prev,
            [resp.id]: { loading: false, options: formatted },
          }));
          return;
        }
      }

      const res = await fetch('/api/expand-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseText: resp.text,
          tag: resp.tag,
          transcript: transcript || '',
          userProfile,
          aiModelConfig,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.options && Array.isArray(data.options) && data.options.length > 0) {
          const formatted: DetailedInPlaceOption[] = data.options.slice(0, 4).map((item: any, idx: number) => ({
            id: `ai-det-${resp.id}-${Date.now()}-${idx}`,
            label: item.label || `Variation ${idx + 1}`,
            text: item.text,
            tone: item.tone || (detectedIntent === 'negative' ? 'negative' : detectedIntent === 'question' ? 'question' : 'warm'),
            intent: detectedIntent,
          }));

          setAiDetailsMap((prev) => ({
            ...prev,
            [resp.id]: { loading: false, options: formatted },
          }));
          return;
        }
      }

      // If backend responded without options, keep fallbacks
      setAiDetailsMap((prev) => ({
        ...prev,
        [resp.id]: { loading: false, options: initialFallbacks },
      }));
    } catch (err: any) {
      console.error('Failed to fetch AI detailed options:', err);
      setAiDetailsMap((prev) => ({
        ...prev,
        [resp.id]: { loading: false, options: initialFallbacks, error: err?.message },
      }));
    }
  };

  const handleToggleDetails = (resp: PredictedResponse) => {
    onSelectResponse(resp);
    const willExpand = expandedResponseId !== resp.id;
    setExpandedResponseId(willExpand ? resp.id : null);

    if (willExpand) {
      fetchAiDetailedOptions(resp);
    }
  };

  // Direct speak on tapping a detailed option card
  const handleDetailedOptionClick = (optionText: string, resp: PredictedResponse) => {
    onSelectResponse({ ...resp, text: optionText });
    if (onSpeakText) {
      onSpeakText(optionText);
    } else {
      onSpeakImmediately(resp);
    }
  };

  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl">
      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2 bg-slate-950/60 rounded-xl border border-slate-800">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
          <p className="text-xs sm:text-sm text-cyan-300 font-semibold animate-pulse">
            Generating contextual smart responses via Gemini AI...
          </p>
        </div>
      ) : responses.length === 0 ? (
        <div className="py-6 text-center text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800 text-sm">
          No responses predicted yet. Click "Regenerate Predictions" above.
        </div>
      ) : (
        <div className="space-y-2.5">
          {responses.slice(0, 6).map((resp, idx) => {
            const num = idx + 1;
            const isSelected = selectedResponseId === resp.id;
            const isExpanded = expandedResponseId === resp.id;
            const respIntent = detectResponseIntent(resp.text, resp.tag);
            const isNegativeTag = respIntent === 'negative';

            const detailsState = aiDetailsMap[resp.id];
            const isDetailsLoading = detailsState?.loading ?? false;
            const detailedOptions = detailsState?.options || getFallbackInPlaceOptions(resp);

            return (
              <div
                key={resp.id || idx}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  isSelected || isExpanded
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : isNegativeTag
                    ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600 hover:bg-amber-950/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900'
                }`}
              >
                {/* Primary Option Header Row (Clicking card immediately speaks) */}
                <div
                  onClick={() => onSpeakImmediately(resp)}
                  id={`predicted-option-${num}`}
                  className={`group flex items-center justify-between gap-3.5 p-3.5 sm:p-4 cursor-pointer select-none transition-colors ${
                    isEyeGazeMode ? 'p-4 sm:p-5' : ''
                  }`}
                  title="Click to speak immediately"
                >
                  {/* Number Badge & Main Text */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <span
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 transition-colors ${
                        isSelected || isExpanded
                          ? 'bg-cyan-400 text-slate-950 shadow-md'
                          : isNegativeTag
                          ? 'bg-amber-900/80 text-amber-200 group-hover:bg-amber-600 group-hover:text-white'
                          : 'bg-blue-900/60 text-cyan-300 group-hover:bg-cyan-600 group-hover:text-white'
                      }`}
                    >
                      {num}
                    </span>

                    <div className="flex items-center min-w-0 flex-1">
                      <span className="font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-tight text-slate-100 group-hover:text-cyan-200 transition-colors leading-snug">
                        "{resp.text}"
                      </span>
                    </div>
                  </div>

                  {/* Details Button */}
                  <div className="flex items-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDetails(resp);
                      }}
                      id={`details-option-btn-${num}`}
                      className={`flex items-center gap-1.5 text-sm sm:text-base font-bold px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl border transition-all shadow-sm ${
                        isExpanded
                          ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-cyan-500/20'
                          : 'bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 hover:text-white border-cyan-800/90 hover:border-cyan-600'
                      }`}
                      title="Generate detailed AI variations matching this option's intent"
                    >
                      {isDetailsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-300 shrink-0" />
                      ) : (
                        <Wand2 className="w-4 h-4 shrink-0" />
                      )}
                      <span>{isExpanded ? 'Expanded' : 'Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* In-Place Expanded Detailed Variations Panel */}
                {isExpanded && (
                  <div className="bg-slate-950/95 border-t border-cyan-900/60 p-3 sm:p-4 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {isDetailsLoading ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                          {isDetailsLoading ? 'Generating AI variations...' : `AI Detailed Variations for "${resp.text}"`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchAiDetailedOptions(resp, true);
                          }}
                          disabled={isDetailsLoading}
                          className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800 flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Generate fresh AI variations"
                        >
                          <RotateCw className={`w-3 h-3 ${isDetailsLoading ? 'animate-spin text-cyan-400' : ''}`} />
                          <span>Regenerate AI</span>
                        </button>
                        <span className="text-xs text-emerald-400 font-bold hidden sm:flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5" /> 1-Tap to Speak
                        </span>
                      </div>
                    </div>

                    {/* Loading status text if fetching */}
                    {isDetailsLoading && (
                      <div className="py-2 flex items-center justify-center gap-2 text-xs text-cyan-300 bg-cyan-950/30 rounded-lg border border-cyan-900/50">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating 4 detailed responses with matching intent using Gemini AI...</span>
                      </div>
                    )}

                    {/* 4 In-Place Detailed Options - 1-Tap Direct Speak */}
                    <div className="grid grid-cols-1 gap-2.5">
                      {detailedOptions.map((opt, oIdx) => {
                        const isNegOption = opt.tone === 'negative';

                        return (
                          <div
                            key={opt.id || oIdx}
                            onClick={() => handleDetailedOptionClick(opt.text, resp)}
                            id={`detailed-variation-${num}-${oIdx + 1}`}
                            className={`group/card p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3.5 cursor-pointer select-none ${
                              isNegOption
                                ? 'bg-amber-950/30 border-amber-800/80 hover:border-amber-400 hover:bg-amber-950/60 shadow-amber-950/30'
                                : 'bg-slate-900/90 border-slate-800 hover:border-cyan-400 hover:bg-cyan-950/40 shadow-cyan-950/30'
                            } hover:shadow-lg active:scale-[0.99]`}
                            title="Tap to speak this detailed response aloud immediately"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <span
                                className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center shrink-0 border transition-colors ${
                                  isNegOption
                                    ? 'bg-amber-900/80 text-amber-200 border-amber-700 group-hover/card:bg-amber-500 group-hover/card:text-slate-950'
                                    : 'bg-slate-800 text-cyan-300 border-slate-700 group-hover/card:bg-cyan-400 group-hover/card:text-slate-950'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>

                              <div className="min-w-0 flex-1">
                                {opt.label && (
                                  <span className="block text-xs font-bold text-slate-400 mb-0.5 tracking-wide">
                                    {opt.label}
                                  </span>
                                )}
                                <p className="text-base sm:text-xl font-bold text-slate-100 group-hover/card:text-cyan-200 transition-colors leading-relaxed">
                                  "{opt.text}"
                                </p>
                              </div>
                            </div>

                            {/* Live Audio Indicator Badge */}
                            <div className="flex items-center shrink-0">
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition-all ${
                                  isNegOption
                                    ? 'bg-amber-900/60 text-amber-200 group-hover/card:bg-amber-500 group-hover/card:text-slate-950'
                                    : 'bg-cyan-950/80 text-cyan-300 group-hover/card:bg-emerald-500 group-hover/card:text-slate-950'
                                }`}
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Tap to Speak</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer link to open Full AI Editor Modal */}
                    <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                      <span>Want custom sentence length, editing, or nuance sliders?</span>
                      <button
                        onClick={() => onOpenDetails(resp)}
                        className="px-2.5 py-1 rounded-lg font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 flex items-center gap-1 transition-colors text-xs"
                      >
                        <span>Open Details Modal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
