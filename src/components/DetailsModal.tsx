import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Loader2,
  ShieldAlert,
  Heart,
  MessageSquare,
  RefreshCw,
  Wand2,
  BookmarkPlus,
  Send,
  Zap,
} from 'lucide-react';
import { PredictedResponse, UserProfile, AIModelConfig } from '../types';
import { detectResponseIntent, ResponseIntent } from './PredictedResponses';

interface DetailedOption {
  id: string;
  label: string;
  text: string;
  tone: 'warm' | 'negative' | 'polite' | 'question' | 'standard';
  intent?: ResponseIntent;
}

interface DetailsModalProps {
  response: PredictedResponse | null;
  onClose: () => void;
  onSpeakText: (text: string) => void;
  onPrepareText: (text: string) => void;
  userProfile?: UserProfile;
  aiModelConfig?: AIModelConfig;
  transcript?: string;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  response,
  onClose,
  onSpeakText,
  onPrepareText,
  userProfile,
  aiModelConfig,
  transcript,
}) => {
  if (!response) return null;

  const [customText, setCustomText] = useState(response.details || response.text);
  const [options, setOptions] = useState<DetailedOption[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'options' | 'custom'>('options');
  const [detailLevel, setDetailLevel] = useState<'concise' | 'elaborate' | 'expressive'>('elaborate');

  const lang = userProfile?.language || 'English';
  const mainIntent = detectResponseIntent(response.text, response.tag);

  // Apply detail level transformations to option texts
  const getAdjustedText = (text: string, tone: string, level: 'concise' | 'elaborate' | 'expressive'): string => {
    if (level === 'concise') {
      const firstSentence = text.split('.')[0];
      return firstSentence.length > 5 ? firstSentence + '.' : text;
    }

    if (level === 'expressive') {
      if (tone === 'negative') {
        if (lang === 'Hindi') {
          return `${text} मैं अपनी राय पर कायम हूँ और कृपया मेरी इस सीमा का सम्मान करें।`;
        } else if (lang === 'Hinglish') {
          return `${text} मैं अपनी बात पर फर्म हूँ और प्लीज़ मेरी इस बाउंड्री को रेस्पेक्ट करो।`;
        }
        return `${text} I am firm in my decision and I kindly ask that you respect this boundary.`;
      }

      if (tone === 'warm') {
        if (lang === 'Hindi') {
          return `${text} आपका सहयोग मेरे लिए बहुत मूल्यवान है और मैं आपसे बात करके बहुत खुश हूँ।`;
        } else if (lang === 'Hinglish') {
          return `${text} तुम्हारा सपोर्ट मेरे लिए बहुत वैल्यूएबल है और तुमसे बात करके बहुत अच्छा लग रहा है।`;
        }
        return `${text} Your understanding and support mean a lot to me, and I appreciate sharing this with you.`;
      }

      if (tone === 'polite') {
        if (lang === 'Hindi') {
          return `${text} समझने के लिए बहुत-बहुत धन्यवाद, मुझे आपकी समझदारी की सराहना है।`;
        } else if (lang === 'Hinglish') {
          return `${text} समझने के लिए थैंक यू सो मच, आई रियली अप्रिशिएट योर अंडरस्टेंडिंग।`;
        }
        return `${text} Thank you very much for your understanding, I deeply appreciate your patience and kindness.`;
      }

      if (tone === 'question') {
        if (lang === 'Hindi') {
          return `${text} ताकि हम मिलकर सबसे सही निर्णय ले सकें और मुझे भी पूरा विषय स्पष्ट हो सके।`;
        } else if (lang === 'Hinglish') {
          return `${text} ताकि हम साथ मिलकर बेस्ट डिसीज़न ले सकें और मुझे भी सब क्लियर हो जाए।`;
        }
        return `${text} so that we can make an informed decision together and ensure everything is crystal clear for both of us.`;
      }

      if (lang === 'Hindi') {
        return `${text} कृपया मुझे थोड़ा समय दें ताकि मैं अपनी बात शांति से रख सकूँ।`;
      } else if (lang === 'Hinglish') {
        return `${text} प्लीज़ मुझे थोड़ा टाइम दो ताकि मैं अपनी बात शांति से कह सकूँ।`;
      }
      return `${text} Please allow me a moment so I can express my thought peacefully and clearly.`;
    }

    // Default 'elaborate'
    return text;
  };

  // Build initial options strictly based on the intent of the main response
  useEffect(() => {
    if (!response) return;

    const baseText = response.text;
    const expText = response.details || baseText;
    const intent = detectResponseIntent(baseText, response.tag);

    let defaultList: DetailedOption[] = [];

    // 1. NEGATIVE INTENT
    if (intent === 'negative') {
      if (lang === 'Hindi') {
        defaultList = [
          {
            id: 'opt-neg-1',
            label: 'स्पष्ट अस्वीकृति (Direct Refusal)',
            text: expText !== baseText && /नहीं|ना|मना/i.test(expText) ? expText : `नहीं, मैं इस बात से बिल्कुल सहमत नहीं हूँ। मुझे यह विचार पसंद नहीं आया और मैं ऐसा नहीं करना चाहूँगा।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-2',
            label: 'विनम्र अस्वीकृति (Polite Decline)',
            text: `धन्यवाद पूछने के लिए, परंतु मैं विनम्रतापूर्वक मना करता हूँ और कुछ बिल्कुल अलग चुनना चाहता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-3',
            label: 'व्यक्तिगत सीमा (Boundary & Comfort)',
            text: `नहीं, मैं इस विकल्प के साथ सहज महसूस नहीं कर रहा हूँ। कृपया इस विषय को यहीं रोक दें।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-4',
            label: 'दृढ़ निर्णय (Firm Boundary)',
            text: `नहीं, यह मेरे लिए सही नहीं रहेगा। मेरी राय पर कृपया ध्यान दें और इसे न करें।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-5',
            label: 'थकान व असुविधा (Uncomfortable / Pass)',
            text: `नहीं, मुझे अभी इस विषय पर बात नहीं करनी है, कृपया मुझे थोड़ा शांत समय दें।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-6',
            label: 'तत्काल इनकार (Firm Disagreement)',
            text: `नहीं, यह योजना मुझे बिल्कुल स्वीकार्य नहीं है। कृपया इसे रद्द करें।`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      } else if (lang === 'Hinglish') {
        defaultList = [
          {
            id: 'opt-neg-1',
            label: 'डायरेक्ट रिफ्यूजल (Direct Refusal)',
            text: expText !== baseText && /नो|डिसअग्री|मना/i.test(expText) ? expText : `नो, मैं इसके साथ बिल्कुल कम्फर्टेबल नहीं हूँ। मुझे यह आईडिया पसंद नहीं आया और मैं मना करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-2',
            label: 'पोलाइट रिफ्यूजल (Polite Decline)',
            text: `थैंक यू पूछने के लिए, पर मैं पोलाइटली मना करूँगा और कुछ एकदम अलग ट्राई करना चाहूँगा।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-3',
            label: 'फर्म बाउंड्री (Firm Boundary)',
            text: `नो, यह मेरे लिए वर्क नहीं करेगा। प्लीज़ मेरी इस बाउंड्री को रेस्पेक्ट करो और इसे यहीं ड्रॉप कर दो।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-4',
            label: 'क्लियर डिसअग्री (Clear Disagreement)',
            text: `नो, मेरा बिल्कुल भी मूड नहीं है और मैं इससे पूरी तरह डिसअग्री करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-5',
            label: 'क्वाइट पॉज़ (Not In The Mood)',
            text: `नो, मैं अभी इस बारे में बात नहीं कर सकता, प्लीज़ मुझे थोड़ा सा क्वाइट टाइम दो।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-6',
            label: 'स्ट्रॉन्ग नो (Strong No)',
            text: `नो, यह ऑप्शन मेरे लिए बिल्कुल सही नहीं है। चलो इसे ड्रॉप करते हैं।`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      } else {
        defaultList = [
          {
            id: 'opt-neg-1',
            label: 'Direct & Firm Refusal',
            text: expText !== baseText && /no|not|disagree|refuse/i.test(expText) ? expText : `No, I disagree and I am not comfortable with this. I'd strongly prefer we do not proceed.`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-2',
            label: 'Polite & Respectful Decline',
            text: `No thank you, I respectfully decline that option and would rather explore a different approach.`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-3',
            label: 'Personal Boundary & Discomfort',
            text: `No, that really does not feel right or comfortable for me today. Please let's pass on this.`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-4',
            label: 'Firm Decisive Disagreement',
            text: `No, that is not going to work for me right now. I'm firm on my decision to say no.`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-5',
            label: 'Clear Preference to Stop',
            text: `No, I would rather not discuss or do this right now. Please give me some space on this topic.`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'opt-neg-6',
            label: 'Direct Refusal with Alternative Request',
            text: `No, I definitely do not want that option. Let's completely rethink and choose something else.`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      }
    }
    // 2. QUESTION / INQUIRY INTENT
    else if (intent === 'question') {
      if (lang === 'Hindi') {
        defaultList = [
          {
            id: 'opt-q-1',
            label: 'विस्तृत प्रश्न (Detailed Inquiry)',
            text: expText !== baseText ? expText : `${baseText} क्या आप इसके बारे में थोड़ा और विस्तार से समझा सकते हैं ताकि हम मिलकर निर्णय लें?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-2',
            label: 'स्पष्टीकरण निवेदन (Clarification Request)',
            text: `${baseText} कृपया मुझे कुछ और विकल्प बताएं ताकि मैं आसानी से समझ सकूँ।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-3',
            label: 'सहयोगात्मक राय (Collaborative Thought)',
            text: `${baseText} आपकी व्यक्तिगत पसंद या सलाह क्या है, मुझे भी बताएं।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-4',
            label: 'विनम्र पुनरावृत्ति (Polite Follow-up)',
            text: `माफ़ कीजिए, क्या आप एक बार फिर से समझा सकते हैं? मुझे ठीक से स्पष्ट नहीं हुआ।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-5',
            label: 'समय और विवरण (Time & Logistics)',
            text: `${baseText} इसमें कितना समय लगेगा और इसके मुख्य चरण क्या हैं?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-6',
            label: 'सरल स्पष्टीकरण (Simple Summary)',
            text: `कृपया इसे एक वाक्य में संक्षेप में बताएं ताकि मैं तुरंत निर्णय ले सकूँ।`,
            tone: 'question',
            intent: 'question',
          },
        ];
      } else if (lang === 'Hinglish') {
        defaultList = [
          {
            id: 'opt-q-1',
            label: 'डिटेल्ड क्वेश्चन (Detailed Inquiry)',
            text: expText !== baseText ? expText : `${baseText} क्या तुम मुझे इसके बारे में थोड़ा और डिटेल्स बता सकते हो ताकि हम साथ मिलकर फैसला लें?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-2',
            label: 'क्लैरिफिकेशन रिक्वेस्ट (Clarification Request)',
            text: `${baseText} प्लीज़ मुझे थोड़ा और डिटेल में बताओ ताकि सब कुछ क्लियर हो जाए।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-3',
            label: 'कोलैबोरेटिव क्वेश्चन (Collaborative Thought)',
            text: `${baseText} तुम्हारा क्या पर्सनल ओपिनियन या सजेशन है, मुझे भी शेयर करो।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-4',
            label: 'पोलाइट रिपीट (Polite Repeat)',
            text: `सॉरी, क्या तुम एक बार फिर से रिपीट कर सकते हो? लास्ट पार्ट समझ नहीं आया।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-5',
            label: 'टाइम & प्लानिंग (Time & Logistics)',
            text: `${baseText} इसमें कितना टाइम लगेगा और क्या प्लान है?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-6',
            label: 'क्विक समरी (Quick Summary)',
            text: `प्लीज़ मुझे शार्ट में समराइज़ कर दो ताकि मैं तुरंत फैसला कर सकूँ।`,
            tone: 'question',
            intent: 'question',
          },
        ];
      } else {
        defaultList = [
          {
            id: 'opt-q-1',
            label: 'Detailed Inquiry',
            text: expText !== baseText ? expText : `${baseText} Could you share a few more details so we can discuss it thoroughly together?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-2',
            label: 'Collaborative Question',
            text: `${baseText} I would love to hear your thoughts and recommendation on this as well.`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-3',
            label: 'Contextual Clarification',
            text: `${baseText} Please give me a little more context so we make the best decision.`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-4',
            label: 'Polite Clarification Request',
            text: `Excuse me, could you please repeat or elaborate on that for me? I want to make sure I caught all the details.`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-5',
            label: 'Timing & Logistics Question',
            text: `${baseText} What is the timeline and what are the exact steps we would take?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'opt-q-6',
            label: 'Concise Summary Request',
            text: `Could you give me a quick high-level summary so I can respond easily?`,
            tone: 'question',
            intent: 'question',
          },
        ];
      }
    }
    // 3. POSITIVE / AFFIRMATIVE INTENT (Default)
    else {
      if (lang === 'Hindi') {
        defaultList = [
          {
            id: 'opt-pos-1',
            label: 'विस्तृत एवं सौम्य सहमति (Elaborate & Warm Affirmation)',
            text: expText !== baseText ? expText : `${baseText} मुझे लगता है कि यह बहुत अच्छा विकल्प रहेगा और हम सब मिलकर इसका आनंद ले सकते हैं।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-2',
            label: 'उत्साही पूर्ण सहमति (Enthusiastic Agreement)',
            text: `हाँ, बिल्कुल! यह विचार मुझे बहुत पसंद आया और मैं इसके लिए पूरी तरह तैयार हूँ।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-3',
            label: 'सहानुभूतिपूर्ण स्वीकृति (Warm Appreciation)',
            text: `हाँ, यह बहुत बढ़िया रहेगा! पूछने और मेरा ध्यान रखने के लिए आपका बहुत-बहुत धन्यवाद।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-4',
            label: 'सहयोगात्मक सहमति (Collaborative Action)',
            text: `हाँ, चलिए इसी योजना पर आगे बढ़ते हैं, मुझे यह सबसे उत्तम और सरल समाधान लग रहा है।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-5',
            label: 'सरल व स्पष्ट स्वीकृति (Clear Positive)',
            text: `हाँ, मैं पूरी तरह सहमत हूँ और यही मेरे लिए सबसे सुखद रहेगा।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-6',
            label: 'हार्दिक समर्थन (Heartfelt Support)',
            text: `हाँ, मुझे यह बहुत अच्छा लगा। आपके इस विचार का मैं पूरा समर्थन करता हूँ!`,
            tone: 'warm',
            intent: 'positive',
          },
        ];
      } else if (lang === 'Hinglish') {
        defaultList = [
          {
            id: 'opt-pos-1',
            label: 'इलाबोरेट & वार्म सहमति (Elaborate & Warm Affirmation)',
            text: expText !== baseText ? expText : `${baseText} आई थिंक यह आईडिया एकदम बेस्ट रहेगा और हम सब एन्जॉय करेंगे।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-2',
            label: 'फुल अग्रीमेंट (Enthusiastic Agreement)',
            text: `हाँ बिल्कुल, यह एकदम परफेक्ट प्लान है और मैं इसके लिए 100% रेडी हूँ!`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-3',
            label: 'वार्म अप्रिशिएशन (Warm Appreciation)',
            text: `यस, यह बहुत बढ़िया रहेगा! थैंक यू सो मच मुझसे पूछने और केयर करने के लिए।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-4',
            label: 'कोलैबोरेटिव अग्री (Collaborative Choice)',
            text: `यस, चलो इसी के साथ आगे बढ़ते हैं, यह हम सबके लिए सबसे बेस्ट ऑप्शन है।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-5',
            label: 'क्लियर पॉजिटिव (Clear Positive)',
            text: `यस, मैं पूरी तरह अग्री करता हूँ और मुझे यह बहुत पसंद आया।`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-6',
            label: 'सुपर एक्साइटेड (Enthusiastic Choice)',
            text: `हाँ, लेट्स डू दिस! यह आईडिया मुझे बहुत अमेजिंग लग रहा है।`,
            tone: 'warm',
            intent: 'positive',
          },
        ];
      } else {
        defaultList = [
          {
            id: 'opt-pos-1',
            label: 'Elaborate & Warm Affirmation',
            text: expText !== baseText ? expText : `${baseText} I feel this is the best path forward, and I really appreciate you including me in this decision.`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-2',
            label: 'Enthusiastic Agreement',
            text: `Yes, absolutely! That sounds fantastic and I am completely on board with that plan.`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-3',
            label: 'Warm Appreciation & Affirmation',
            text: `Yes, that works wonderfully for me. Thank you so much for checking with me and making this easy.`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-4',
            label: 'Collaborative Action & Agreement',
            text: `Yes, let's go ahead with that right away—I think it will be great for everyone involved.`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-5',
            label: 'Direct & Joyful Confirmation',
            text: `Yes, I am happy with that choice and excited to move forward with it.`,
            tone: 'warm',
            intent: 'positive',
          },
          {
            id: 'opt-pos-6',
            label: 'Grateful & Reassured Agreement',
            text: `Yes, that gives me great peace of mind. Thank you for making this so simple and caring.`,
            tone: 'warm',
            intent: 'positive',
          },
        ];
      }
    }

    setOptions(defaultList);
    setCustomText(expText);
  }, [response, lang]);

  // Fetch brand new AI expanded options from backend API matching exact intent
  const handleFetchAIOptions = async () => {
    setIsLoadingMore(true);
    try {
      const res = await fetch('/api/expand-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseText: response.text,
          tag: response.tag,
          transcript,
          userProfile,
          aiModelConfig,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.options && Array.isArray(data.options)) {
          const formatted: DetailedOption[] = data.options.map((item: any, idx: number) => ({
            id: `ai-opt-${Date.now()}-${idx}`,
            label: item.label || `AI Variation ${idx + 1}`,
            text: item.text,
            tone: item.tone || (mainIntent === 'negative' ? 'negative' : 'warm'),
            intent: mainIntent,
          }));

          setOptions([
            { id: 'opt-short', label: `Short Base Phrase (${response.tag})`, text: response.text, tone: mainIntent === 'negative' ? 'negative' : 'warm', intent: mainIntent },
            ...formatted,
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching expanded options:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSpeakShort = () => {
    onSpeakText(response.text);
    onClose();
  };

  const handleSpeakSelected = (text: string) => {
    onSpeakText(text);
    onClose();
  };

  // Quick tone transformations on custom text
  const applyTransformation = (type: 'firm-refusal' | 'polite' | 'reason' | 'devanagari' | 'shorter') => {
    if (type === 'firm-refusal') {
      if (lang === 'Hindi') {
        setCustomText('नहीं, मैं इससे बिल्कुल भी सहमत नहीं हूँ। कृपया ऐसा न करें।');
      } else if (lang === 'Hinglish') {
        setCustomText('नो, मैं इसके साथ कम्फर्टेबल नहीं हूँ। प्लीज़ ऐसा मत करो।');
      } else {
        setCustomText("No, I'm not comfortable with this and I disagree with this option.");
      }
    } else if (type === 'polite') {
      if (lang === 'Hindi') {
        setCustomText(`धन्यवाद, पर मैं विनम्रतापूर्वक कुछ और चुनना चाहूँगा।`);
      } else if (lang === 'Hinglish') {
        setCustomText(`थैंक यू सो मच, पर मैं पोलाइटली कुछ और ट्राय करना चाहूँगा।`);
      } else {
        setCustomText(`Thank you for offering, but I would politely prefer a different option.`);
      }
    } else if (type === 'reason') {
      if (lang === 'Hindi') {
        setCustomText(`${customText} इसका मुख्य कारण यह है कि मैं अभी थोड़ा विश्राम करना चाहता हूँ।`);
      } else if (lang === 'Hinglish') {
        setCustomText(`${customText} इसका मेन रीज़न यह है कि मुझे अभी थोड़ा रेस्ट चाहिए।`);
      } else {
        setCustomText(`${customText} The main reason is that I need to rest and conserve my energy.`);
      }
    } else if (type === 'devanagari') {
      setCustomText(`हाँ, यह बिल्कुल सही निर्णय है। धन्यवाद!`);
    } else if (type === 'shorter') {
      const words = customText.split(' ');
      if (words.length > 6) {
        setCustomText(words.slice(0, 6).join(' ') + '.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base sm:text-lg">
                Expanded Response Options & Variations
              </h3>
              <p className="text-xs text-slate-400">
                {mainIntent === 'negative'
                  ? 'All detailed options match your negative/refusal intent with clear boundaries'
                  : mainIntent === 'question'
                  ? 'All detailed options match your question & clarification intent'
                  : 'All detailed options match your positive affirmative intent with rich nuances'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short & Detailed Baseline Bar */}
        <div className="bg-slate-950/90 px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                mainIntent === 'negative'
                  ? 'text-amber-300 bg-amber-950 border-amber-800'
                  : 'text-cyan-400 bg-cyan-950 border-cyan-800'
              }`}>
                Tag: {response.tag} ({mainIntent.toUpperCase()})
              </span>
            </div>
            <div className={`text-sm sm:text-base font-black ${
              mainIntent === 'negative' ? 'text-amber-300' : 'text-cyan-300'
            }`}>
              "{response.text}"
            </div>
            {response.details && (
              <div className="text-xs text-slate-300 font-medium italic">
                Full Details: "{response.details}"
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleSpeakShort}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" /> Speak Short
            </button>
            {response.details && (
              <button
                onClick={() => {
                  onSpeakText(response.details!);
                  onClose();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all ${
                  mainIntent === 'negative'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" /> Speak Full Details
              </button>
            )}
          </div>
        </div>

        {/* AI Action Header & Tab Switcher */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('options')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'options'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Detailed Options ({options.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'custom'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Custom Editor & Style AI
            </button>
          </div>

          <button
            onClick={handleFetchAIOptions}
            disabled={isLoadingMore}
            className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating AI Variations...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Generate AI Variations
              </>
            )}
          </button>
        </div>

        {/* Modal Body - Options List or Custom Editor */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 min-h-[260px]">
          {activeTab === 'options' ? (
            <div className="space-y-3">
              {/* Detail Depth Control Bar */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sentence Detail Level:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDetailLevel('concise')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      detailLevel === 'concise'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Short
                  </button>
                  <button
                    onClick={() => setDetailLevel('elaborate')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      detailLevel === 'elaborate'
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setDetailLevel('expressive')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      detailLevel === 'expressive'
                        ? 'bg-purple-600 text-white shadow-md font-extrabold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              {/* Options List - 1-Tap Direct Speak (No separate buttons) */}
              {options.map((opt, idx) => {
                const isNeg = opt.tone === 'negative' || mainIntent === 'negative';
                const finalPhrase = getAdjustedText(opt.text, opt.tone, detailLevel);
                const wordCount = finalPhrase.trim().split(/\s+/).length;

                return (
                  <div
                    key={opt.id || idx}
                    onClick={() => handleSpeakSelected(finalPhrase)}
                    className={`group/card p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3.5 cursor-pointer select-none ${
                      isNeg
                        ? 'bg-amber-950/25 border-amber-800/80 hover:border-amber-400 hover:bg-amber-950/50 shadow-amber-950/30'
                        : 'bg-slate-950/80 border-slate-800 hover:border-cyan-400 hover:bg-cyan-950/40 shadow-cyan-950/30'
                    } hover:shadow-lg active:scale-[0.99]`}
                    title="Tap to speak this detailed variation immediately"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span
                        className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border transition-colors ${
                          isNeg
                            ? 'bg-amber-900/80 text-amber-200 border-amber-700 group-hover/card:bg-amber-500 group-hover/card:text-slate-950'
                            : 'bg-slate-800 text-cyan-300 border-slate-700 group-hover/card:bg-cyan-400 group-hover/card:text-slate-950'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-bold text-slate-100 group-hover/card:text-cyan-200 transition-colors leading-relaxed">
                          "{finalPhrase}"
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {wordCount} words
                          </span>
                          {isNeg && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                              <ShieldAlert className="w-3 h-3" /> Refusal / Boundary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center shrink-0">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition-all ${
                          isNeg
                            ? 'bg-amber-900/60 text-amber-200 group-hover/card:bg-amber-500 group-hover/card:text-slate-950'
                            : 'bg-cyan-950/80 text-cyan-300 group-hover/card:bg-emerald-500 group-hover/card:text-slate-950'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Tap to Speak</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Custom Text Box (Edit or Transform with 1-Tap)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-base text-slate-100 font-semibold focus:outline-none focus:border-cyan-500 min-h-[110px] shadow-inner"
                  placeholder="Type or transform custom message..."
                />
              </div>

              {/* 1-Tap Style Transformers */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                  1-Tap Instant Style & Tone Adjusters
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyTransformation('firm-refusal')}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-700 flex items-center gap-1"
                  >
                    ⚡ Firm Refusal / Disagree
                  </button>
                  <button
                    onClick={() => applyTransformation('polite')}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-blue-950/90 hover:bg-blue-900 text-blue-200 border border-blue-700 flex items-center gap-1"
                  >
                    🌸 Make Polite
                  </button>
                  <button
                    onClick={() => applyTransformation('reason')}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 flex items-center gap-1"
                  >
                    💡 Add Reasoning
                  </button>
                  <button
                    onClick={() => applyTransformation('devanagari')}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-700 flex items-center gap-1"
                  >
                    🌐 Hindi Devanagari
                  </button>
                  <button
                    onClick={() => applyTransformation('shorter')}
                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
                  >
                    ✂️ Trim / Shorter
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleSpeakSelected(customText)}
                  className="px-5 py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md"
                >
                  <Volume2 className="w-4 h-4" /> Speak Custom Version
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Tap any option above to speak aloud immediately.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

