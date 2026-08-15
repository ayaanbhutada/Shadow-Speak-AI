import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Loader2, Volume2, Wand2, ShieldAlert, Heart, MessageSquare, ArrowRight, CheckCircle2, HelpCircle, Coffee } from 'lucide-react';
import { PredictedResponse, UserProfile } from '../types';

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

interface DetailedInPlaceOption {
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
}

export const PredictedResponses: React.FC<PredictedResponsesProps> = ({
  responses,
  selectedResponseId,
  onSelectResponse,
  onSpeakImmediately,
  onSpeakText,
  onPrepareText,
  onOpenDetails,
  isLoading,
  isEyeGazeMode,
  userProfile,
}) => {
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);

  const lang = userProfile?.language || 'English';

  // Generate 4 detailed in-place options with IDENTICAL intent to the main response
  const getInPlaceDetailedOptions = (resp: PredictedResponse): DetailedInPlaceOption[] => {
    const baseText = resp.text;
    const detailsText = resp.details || baseText;
    const intent = detectResponseIntent(baseText, resp.tag);

    // ==========================================
    // 1. NEGATIVE / REFUSAL / BOUNDARY INTENT
    // ==========================================
    if (intent === 'negative') {
      if (lang === 'Hindi') {
        return [
          {
            id: 'in-neg-1',
            label: 'स्पष्ट एवं दृढ़ अस्वीकृति (Direct Refusal)',
            text: detailsText !== baseText && /नहीं|ना|मना/i.test(detailsText) ? detailsText : `नहीं, मैं इस बात से बिल्कुल सहमत नहीं हूँ। मुझे यह विचार पसंद नहीं आया और मैं ऐसा नहीं करना चाहूँगा।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'in-neg-2',
            label: 'विनम्र अस्वीकृति (Polite Decline)',
            text: `धन्यवाद पूछने के लिए, परंतु मैं विनम्रतापूर्वक मना करता हूँ और कुछ बिल्कुल अलग चुनना चाहता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'in-neg-3',
            label: 'व्यक्तिगत सीमा एवं असुविधा (Boundary & Discomfort)',
            text: `नहीं, मैं इस विकल्प के साथ सहज महसूस नहीं कर रहा हूँ। कृपया इस विषय को यहीं रोक दें।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'in-neg-4',
            label: 'दृढ़ निर्णय (Firm Boundary)',
            text: `नहीं, यह मेरे लिए सही नहीं रहेगा। मेरी राय पर कृपया ध्यान दें और इसे न करें।`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      }

      if (lang === 'Hinglish') {
        return [
          {
            id: 'in-neg-1',
            label: 'डायरेक्ट रिफ्यूजल (Direct Refusal)',
            text: detailsText !== baseText && /नो|डिसअग्री|मना/i.test(detailsText) ? detailsText : `नो, मैं इसके साथ बिल्कुल कम्फर्टेबल नहीं हूँ। मुझे यह आईडिया पसंद नहीं आया और मैं मना करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'in-neg-2',
            label: 'पोलाइट रिफ्यूजल (Polite Decline)',
            text: `थैंक यू पूछने के लिए, पर मैं पोलाइटली मना करूँगा और कुछ एकदम अलग ट्राई करना चाहूँगा।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'in-neg-3',
            label: 'फर्म बाउंड्री (Firm Boundary)',
            text: `नो, यह मेरे लिए वर्क नहीं करेगा। प्लीज़ मेरी इस बाउंड्री को रेस्पेक्ट करो और इसे यहीं ड्रॉप कर दो।`,
            tone: 'negative',
            intent: 'negative',
          },
          {
            id: 'in-neg-4',
            label: 'क्लियर डिसअग्री (Clear Disagreement)',
            text: `नो, मेरा बिल्कुल भी मूड नहीं है और मैं इससे पूरी तरह डिसअग्री करता हूँ।`,
            tone: 'negative',
            intent: 'negative',
          },
        ];
      }

      // Default English Negative
      return [
        {
          id: 'in-neg-1',
          label: 'Direct & Firm Refusal',
          text: detailsText !== baseText && /no|not|disagree|refuse/i.test(detailsText) ? detailsText : `No, I disagree and I am not comfortable with this. I'd strongly prefer we do not proceed.`,
          tone: 'negative',
          intent: 'negative',
        },
        {
          id: 'in-neg-2',
          label: 'Polite & Respectful Decline',
          text: `No thank you, I respectfully decline that option and would rather explore a different approach.`,
          tone: 'negative',
          intent: 'negative',
        },
        {
          id: 'in-neg-3',
          label: 'Personal Boundary & Discomfort',
          text: `No, that really does not feel right or comfortable for me today. Please let's pass on this.`,
          tone: 'negative',
          intent: 'negative',
        },
        {
          id: 'in-neg-4',
          label: 'Firm Decisive Disagreement',
          text: `No, that is not going to work for me right now. I'm firm on my decision to say no.`,
          tone: 'negative',
          intent: 'negative',
        },
      ];
    }

    // ==========================================
    // 2. QUESTION / INQUIRY / FOLLOW-UP INTENT
    // ==========================================
    if (intent === 'question') {
      if (lang === 'Hindi') {
        return [
          {
            id: 'in-q-1',
            label: 'विस्तृत प्रश्न (Detailed Inquiry)',
            text: detailsText !== baseText ? detailsText : `${baseText} क्या आप इसके बारे में थोड़ा और विस्तार से समझा सकते हैं ताकि हम मिलकर निर्णय लें?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'in-q-2',
            label: 'स्पष्टीकरण निवेदन (Clarification Request)',
            text: `${baseText} कृपया मुझे कुछ और विकल्प बताएं ताकि मैं आसानी से समझ सकूँ।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'in-q-3',
            label: 'सहयोगात्मक राय (Collaborative Thought)',
            text: `${baseText} आपकी व्यक्तिगत पसंद या सलाह क्या है, मुझे भी बताएं।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'in-q-4',
            label: 'विनम्र पुनरावृत्ति (Polite Follow-up)',
            text: `माफ़ कीजिए, क्या आप एक बार फिर से समझा सकते हैं? मुझे ठीक से स्पष्ट नहीं हुआ।`,
            tone: 'question',
            intent: 'question',
          },
        ];
      }

      if (lang === 'Hinglish') {
        return [
          {
            id: 'in-q-1',
            label: 'डिटेल्ड क्वेश्चन (Detailed Inquiry)',
            text: detailsText !== baseText ? detailsText : `${baseText} क्या तुम मुझे इसके बारे में थोड़ा और डिटेल्स बता सकते हो ताकि हम साथ मिलकर फैसला लें?`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'in-q-2',
            label: 'क्लैरिफिकेशन रिक्वेस्ट (Clarification Request)',
            text: `${baseText} प्लीज़ मुझे थोड़ा और डिटेल में बताओ ताकि सब कुछ क्लियर हो जाए।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'in-q-3',
            label: 'कोलैबोरेटिव क्वेश्चन (Collaborative Thought)',
            text: `${baseText} तुम्हारा क्या पर्सनल ओपिनियन या सजेशन है, मुझे भी शेयर करो।`,
            tone: 'question',
            intent: 'question',
          },
          {
            id: 'in-q-4',
            label: 'पोलाइट रिपीट (Polite Repeat)',
            text: `सॉरी, क्या तुम एक बार फिर से रिपीट कर सकते हो? लास्ट पार्ट समझ नहीं आया।`,
            tone: 'question',
            intent: 'question',
          },
        ];
      }

      return [
        {
          id: 'in-q-1',
          label: 'Detailed Inquiry',
          text: detailsText !== baseText ? detailsText : `${baseText} Could you share a few more details so we can discuss it thoroughly together?`,
          tone: 'question',
          intent: 'question',
        },
        {
          id: 'in-q-2',
          label: 'Collaborative Question',
          text: `${baseText} I would love to hear your thoughts and recommendation on this as well.`,
          tone: 'question',
          intent: 'question',
        },
        {
          id: 'in-q-3',
          label: 'Contextual Clarification',
          text: `${baseText} Please give me a little more context so we make the best decision.`,
          tone: 'question',
          intent: 'question',
        },
        {
          id: 'in-q-4',
          label: 'Polite Clarification Request',
          text: `Excuse me, could you please repeat or elaborate on that for me? I want to make sure I caught all the details.`,
          tone: 'question',
          intent: 'question',
        },
      ];
    }

    // ==========================================
    // 3. ENERGY / REST / FATIGUE INTENT
    // ==========================================
    if (intent === 'energy') {
      if (lang === 'Hindi') {
        return [
          {
            id: 'in-en-1',
            label: 'विश्राम की आवश्यकता (Rest Context)',
            text: detailsText !== baseText ? detailsText : `${baseText} मेरी ऊर्जा अभी थोड़ी कम है, इसलिए मुझे थोड़ा विश्राम और शांति चाहिए।`,
            tone: 'standard',
            intent: 'energy',
          },
          {
            id: 'in-en-2',
            label: 'शांतिपूर्ण विराम (Peaceful Pause)',
            text: `${baseText} मैं अभी थोड़ा थक गया हूँ, क्या हम थोड़ी देर बाद आराम से बात कर सकते हैं?`,
            tone: 'standard',
            intent: 'energy',
          },
          {
            id: 'in-en-3',
            label: 'ऊर्जा संरक्षण (Energy Conservation)',
            text: `कृपया मुझे थोड़ा समय दें, मुझे अपनी ऊर्जा संचित करने के लिए शांतिपूर्वक आराम की जरूरत है।`,
            tone: 'standard',
            intent: 'energy',
          },
          {
            id: 'in-en-4',
            label: 'सहज स्थिति (Quiet Comfort)',
            text: `मैं अभी ठीक हूँ, परंतु मुझे थोड़ा शांत वातावरण और शारीरिक आराम चाहिए।`,
            tone: 'standard',
            intent: 'energy',
          },
        ];
      }

      if (lang === 'Hinglish') {
        return [
          {
            id: 'in-en-1',
            label: 'एनर्जी & रेस्ट (Rest Context)',
            text: detailsText !== baseText ? detailsText : `${baseText} मेरी ऊर्जा अभी थोड़ी कम है, सो मुझे थोड़ा आराम करने की ज़रूरत है।`,
            tone: 'standard',
            intent: 'energy',
          },
          {
            id: 'in-en-2',
            label: 'पॉज़ रिक्वेस्ट (Peaceful Pause)',
            text: `${baseText} मैं अभी थोड़ा टायर्ड फील कर रहा हूँ, क्या हम थोड़ी देर बाद बात कर सकते हैं?`,
            tone: 'standard',
            intent: 'energy',
          },
          {
            id: 'in-en-3',
            label: 'एनर्जी रीचार्ज (Energy Conservation)',
            text: `प्लीज़ मुझे थोड़ा टाइम दो, मुझे आराम करके अपनी ऊर्जा रीचार्ज करनी है।`,
            tone: 'standard',
            intent: 'energy',
          },
          {
            id: 'in-en-4',
            label: 'क्वाइट कम्फर्ट (Quiet Comfort)',
            text: `आई एम ओके, बस थोड़ा सा क्वाइट टाइम और आराम चाहिए।`,
            tone: 'standard',
            intent: 'energy',
          },
        ];
      }

      return [
        {
          id: 'in-en-1',
          label: 'Physical & Energy State Context',
          text: detailsText !== baseText ? detailsText : `${baseText} My energy is a bit low right now, so I need to rest and take things gently.`,
          tone: 'standard',
          intent: 'energy',
        },
        {
          id: 'in-en-2',
          label: 'Peaceful Pause Request',
          text: `${baseText} I am feeling a bit fatigued right now, so could we pause and talk again in a little while?`,
          tone: 'standard',
          intent: 'energy',
        },
        {
          id: 'in-en-3',
          label: 'Energy Conservation Need',
          text: `Please allow me a quiet moment to rest and conserve my energy.`,
          tone: 'standard',
          intent: 'energy',
        },
        {
          id: 'in-en-4',
          label: 'Quiet Rest & Comfort',
          text: `I am doing alright, but I really need a calm and restful environment right now.`,
          tone: 'standard',
          intent: 'energy',
        },
      ];
    }

    // ==========================================
    // 4. ALTERNATIVE / PREFERENCE INTENT
    // ==========================================
    if (intent === 'alternative') {
      if (lang === 'Hindi') {
        return [
          {
            id: 'in-alt-1',
            label: 'पसंदीदा विकल्प (Clear Preference)',
            text: detailsText !== baseText ? detailsText : `${baseText} क्योंकि यह मेरे लिए इस समय सबसे बेहतर और सुविधाजनक रहेगा।`,
            tone: 'warm',
            intent: 'alternative',
          },
          {
            id: 'in-alt-2',
            label: 'विस्तृत सुझाव (Detailed Suggestion)',
            text: `${baseText} क्या हम इसके साथ कुछ हल्का और ताज़ा भी शामिल कर सकते हैं?`,
            tone: 'warm',
            intent: 'alternative',
          },
          {
            id: 'in-alt-3',
            label: 'स्पष्ट प्राथमिकता (Specific Choice)',
            text: `${baseText} आज मेरा मन इसी का आनंद लेने का है, कृपया यही व्यवस्था करें।`,
            tone: 'warm',
            intent: 'alternative',
          },
          {
            id: 'in-alt-4',
            label: 'विनम्र चयन (Polite Selection)',
            text: `धन्यवाद पूछने के लिए, मैं आज इसी विकल्प को सबसे अधिक प्राथमिकता देना चाहता हूँ।`,
            tone: 'polite',
            intent: 'alternative',
          },
        ];
      }

      if (lang === 'Hinglish') {
        return [
          {
            id: 'in-alt-1',
            label: 'प्रेफर्ड चॉइस (Clear Preference)',
            text: detailsText !== baseText ? detailsText : `${baseText} क्योंकि यह मेरे मूड के हिसाब से आज सबसे बेस्ट रहेगा।`,
            tone: 'warm',
            intent: 'alternative',
          },
          {
            id: 'in-alt-2',
            label: 'डिटेल्ड सजेशन (Detailed Suggestion)',
            text: `${baseText} क्या हम इसके साथ कुछ लाइट और फ्रेश भी ऐड कर सकते हैं?`,
            tone: 'warm',
            intent: 'alternative',
          },
          {
            id: 'in-alt-3',
            label: 'स्पेसिफिक चॉइस (Specific Choice)',
            text: `${baseText} आज मेरा मूड यही एन्जॉय करने का है, सो प्लीज़ यही फाइनल करते हैं।`,
            tone: 'warm',
            intent: 'alternative',
          },
          {
            id: 'in-alt-4',
            label: 'पोलाइट प्रेफरेंस (Polite Selection)',
            text: `थैंक्स मुझसे पूछने के लिए, आज मैं इसी ऑप्शन को सबसे ज्यादा प्रेफर करूँगा।`,
            tone: 'polite',
            intent: 'alternative',
          },
        ];
      }

      return [
        {
          id: 'in-alt-1',
          label: 'Specific Alternative Preference',
          text: detailsText !== baseText ? detailsText : `${baseText} as that feels like the tastiest and most comfortable choice for me today.`,
          tone: 'warm',
          intent: 'alternative',
        },
        {
          id: 'in-alt-2',
          label: 'Detailed Suggestion & Pairing',
          text: `${baseText} Could we also pair that with something light and fresh on the side?`,
          tone: 'warm',
          intent: 'alternative',
        },
        {
          id: 'in-alt-3',
          label: 'Clear Priority Selection',
          text: `${baseText} That is truly what I'm in the mood for right now, so let's go with that.`,
          tone: 'warm',
          intent: 'alternative',
        },
        {
          id: 'in-alt-4',
          label: 'Polite Preference Choice',
          text: `Thank you for asking—I would definitely prefer that option over anything else today.`,
          tone: 'polite',
          intent: 'alternative',
        },
      ];
    }

    // ==========================================
    // 5. GRATITUDE INTENT
    // ==========================================
    if (intent === 'gratitude') {
      if (lang === 'Hindi') {
        return [
          {
            id: 'in-gr-1',
            label: 'हार्दिक आभार (Warm Gratitude)',
            text: detailsText !== baseText ? detailsText : `${baseText} आपकी सहायता और समझदारी मेरे लिए बहुत मायने रखती है।`,
            tone: 'warm',
            intent: 'gratitude',
          },
          {
            id: 'in-gr-2',
            label: 'सहानुभूतिपूर्ण धन्यवाद (Appreciative Thanks)',
            text: `${baseText} मेरा ध्यान रखने और समय निकालने के लिए आपका बहुत-बहुत धन्यवाद।`,
            tone: 'warm',
            intent: 'gratitude',
          },
          {
            id: 'in-gr-3',
            label: 'विनम्र पावती (Polite Acknowledgment)',
            text: `मुझे बताने के लिए धन्यवाद, मैं पूरी तरह समझ गया हूँ और तैयार हूँ।`,
            tone: 'polite',
            intent: 'gratitude',
          },
          {
            id: 'in-gr-4',
            label: 'गहरी कृतज्ञता (Deep Appreciation)',
            text: `आपके सहयोग और धैर्य की मैं दिल से सराहना करता हूँ। धन्यवाद!`,
            tone: 'warm',
            intent: 'gratitude',
          },
        ];
      }

      if (lang === 'Hinglish') {
        return [
          {
            id: 'in-gr-1',
            label: 'वार्म थैंक्स (Warm Gratitude)',
            text: detailsText !== baseText ? detailsText : `${baseText} तुम्हारा सपोर्ट मेरे लिए बहुत वैल्यूएबल है, थैंक यू सो मच।`,
            tone: 'warm',
            intent: 'gratitude',
          },
          {
            id: 'in-gr-2',
            label: 'अप्रिशिएटिव थैंक्स (Appreciative Thanks)',
            text: `${baseText} मेरी इतनी केयर करने और टाइम निकालने के लिए बहुत-बहुत शुक्रिया।`,
            tone: 'warm',
            intent: 'gratitude',
          },
          {
            id: 'in-gr-3',
            label: 'पोलाइट थैंक्स (Polite Acknowledgment)',
            text: `थैंक यू सो मच बताने के लिए, मैं पूरी तरह समझ गया हूँ।`,
            tone: 'polite',
            intent: 'gratitude',
          },
          {
            id: 'in-gr-4',
            label: 'डीप अप्रिशिएशन (Deep Appreciation)',
            text: `तुम्हारे पेशेंस और हेल्प की मैं दिल से कद्र करता हूँ। थैंक्स अ लॉट!`,
            tone: 'warm',
            intent: 'gratitude',
          },
        ];
      }

      return [
        {
          id: 'in-gr-1',
          label: 'Warm Appreciation',
          text: detailsText !== baseText ? detailsText : `${baseText} Your support and understanding truly mean the world to me.`,
          tone: 'warm',
          intent: 'gratitude',
        },
        {
          id: 'in-gr-2',
          label: 'Heartfelt Thanks',
          text: `${baseText} Thank you so much for taking such wonderful care of me and taking the time to help.`,
          tone: 'warm',
          intent: 'gratitude',
        },
        {
          id: 'in-gr-3',
          label: 'Polite Acknowledgment',
          text: `Thank you for letting me know, I completely understand and appreciate the update.`,
          tone: 'polite',
          intent: 'gratitude',
        },
        {
          id: 'in-gr-4',
          label: 'Kind Gratitude',
          text: `I truly appreciate your patience and kindness with me today. Thank you!`,
          tone: 'warm',
          intent: 'gratitude',
        },
      ];
    }

    // ==========================================
    // 6. POSITIVE / AFFIRMATIVE INTENT (Default)
    // ==========================================
    if (lang === 'Hindi') {
      return [
        {
          id: 'in-pos-1',
          label: 'विस्तृत एवं सौम्य सहमति (Elaborate & Warm Affirmation)',
          text: detailsText !== baseText ? detailsText : `${baseText} मुझे लगता है कि यह बहुत अच्छा विकल्प रहेगा और हम सब मिलकर इसका आनंद ले सकते हैं।`,
          tone: 'warm',
          intent: 'positive',
        },
        {
          id: 'in-pos-2',
          label: 'उत्साही पूर्ण सहमति (Enthusiastic Agreement)',
          text: `हाँ, बिल्कुल! यह विचार मुझे बहुत पसंद आया और मैं इसके लिए पूरी तरह तैयार हूँ।`,
          tone: 'warm',
          intent: 'positive',
        },
        {
          id: 'in-pos-3',
          label: 'सहानुभूतिपूर्ण स्वीकृति (Warm Appreciation)',
          text: `हाँ, यह बहुत बढ़िया रहेगा! पूछने और मेरा ध्यान रखने के लिए आपका बहुत-बहुत धन्यवाद।`,
          tone: 'warm',
          intent: 'positive',
        },
        {
          id: 'in-pos-4',
          label: 'सहयोगात्मक सहमति (Collaborative Action)',
          text: `हाँ, चलिए इसी योजना पर आगे बढ़ते हैं, मुझे यह सबसे उत्तम और सरल समाधान लग रहा है।`,
          tone: 'warm',
          intent: 'positive',
        },
      ];
    }

    if (lang === 'Hinglish') {
      return [
        {
          id: 'in-pos-1',
          label: 'इलाबोरेट & वार्म सहमति (Elaborate & Warm Affirmation)',
          text: detailsText !== baseText ? detailsText : `${baseText} आई थिंक यह आईडिया एकदम बेस्ट रहेगा और हम सब एन्जॉय करेंगे।`,
          tone: 'warm',
          intent: 'positive',
        },
        {
          id: 'in-pos-2',
          label: 'फुल अग्रीमेंट (Enthusiastic Agreement)',
          text: `हाँ बिल्कुल, यह एकदम परफेक्ट प्लान है और मैं इसके लिए 100% रेडी हूँ!`,
          tone: 'warm',
          intent: 'positive',
        },
        {
          id: 'in-pos-3',
          label: 'वार्म अप्रिशिएशन (Warm Appreciation)',
          text: `यस, यह बहुत बढ़िया रहेगा! थैंक यू सो मच मुझसे पूछने और केयर करने के लिए।`,
          tone: 'warm',
          intent: 'positive',
        },
        {
          id: 'in-pos-4',
          label: 'कोलैबोरेटिव अग्री (Collaborative Choice)',
          text: `यस, चलो इसी के साथ आगे बढ़ते हैं, यह हम सबके लिए सबसे बेस्ट ऑप्शन है।`,
          tone: 'warm',
          intent: 'positive',
        },
      ];
    }

    // Default English Positive
    return [
      {
        id: 'in-pos-1',
        label: 'Elaborate & Warm Affirmation',
        text: detailsText !== baseText ? detailsText : `${baseText} I feel this is the best path forward, and I really appreciate you including me in this decision.`,
        tone: 'warm',
        intent: 'positive',
      },
      {
        id: 'in-pos-2',
        label: 'Enthusiastic Agreement',
        text: `Yes, absolutely! That sounds fantastic and I am completely on board with that plan.`,
        tone: 'warm',
        intent: 'positive',
      },
      {
        id: 'in-pos-3',
        label: 'Warm Appreciation & Affirmation',
        text: `Yes, that works wonderfully for me. Thank you so much for checking with me and making this easy.`,
        tone: 'warm',
        intent: 'positive',
      },
      {
        id: 'in-pos-4',
        label: 'Collaborative Action & Agreement',
        text: `Yes, let's go ahead with that right away—I think it will be great for everyone involved.`,
        tone: 'warm',
        intent: 'positive',
      },
    ];
  };

  const handleToggleDetails = (resp: PredictedResponse) => {
    onSelectResponse(resp);
    // Toggle in-place expansion
    setExpandedResponseId((prev) => (prev === resp.id ? null : resp.id));
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

            const detailedOptions = getInPlaceDetailedOptions(resp);

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
                      title="Expand detailed option variations with identical intent"
                    >
                      <Wand2 className="w-4 h-4 shrink-0" />
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
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                          {respIntent === 'negative'
                            ? 'Negative / Boundary Variations (Identical Intent)'
                            : respIntent === 'question'
                            ? 'Question / Inquiry Variations (Identical Intent)'
                            : respIntent === 'energy'
                            ? 'Energy & Rest Variations (Identical Intent)'
                            : respIntent === 'alternative'
                            ? 'Alternative Choice Variations (Identical Intent)'
                            : respIntent === 'gratitude'
                            ? 'Gratitude Variations (Identical Intent)'
                            : 'Positive & Affirmative Variations (Identical Intent)'}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" /> Tap any detailed response to speak aloud immediately
                      </span>
                    </div>

                    {/* 4 In-Place Detailed Options - 1-Tap Direct Speak (No separate buttons) */}
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
                                <p className="text-base sm:text-xl font-bold text-slate-100 group-hover/card:text-cyan-200 transition-colors leading-relaxed">
                                  "{opt.text}"
                                </p>
                              </div>
                            </div>

                            {/* Live Audio Indicator Badge on Hover/Focus */}
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
                      <span>Want custom sentence length or AI variations?</span>
                      <button
                        onClick={() => onOpenDetails(resp)}
                        className="px-2.5 py-1 rounded-lg font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 flex items-center gap-1 transition-colors text-xs"
                      >
                        <span>Open AI Studio Modal</span>
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


