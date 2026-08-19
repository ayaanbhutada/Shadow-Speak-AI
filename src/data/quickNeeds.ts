import { QuickNeed, SimulatedScenario, PredictedResponse } from '../types';

export const QUICK_NEEDS_BY_LANGUAGE: Record<'English' | 'Hindi' | 'Hinglish', QuickNeed[]> = {
  English: [
    {
      id: 'need-water',
      label: 'Water / Drink',
      phrase: 'Could I please have a glass of water?',
      icon: 'GlassWater',
      color: 'bg-blue-950/80 border-blue-700/60 text-blue-200 hover:bg-blue-900/90'
    },
    {
      id: 'need-washroom',
      label: 'Washroom',
      phrase: 'I need help going to the washroom.',
      icon: 'Bath',
      color: 'bg-indigo-950/80 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/90'
    },
    {
      id: 'need-pain',
      label: 'In Pain / Help',
      phrase: 'I am in pain or uncomfortable, please come help me right away.',
      icon: 'AlertTriangle',
      color: 'bg-red-950/90 border-red-600 text-red-100 hover:bg-red-900 shadow-lg shadow-red-950/50',
      isUrgent: true
    },
    {
      id: 'need-adjust',
      label: 'Adjust Position',
      phrase: 'Could you please help adjust my seating or lying position?',
      icon: 'Armchair',
      color: 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
    }
  ],
  Hindi: [
    {
      id: 'need-water',
      label: 'पानी / पेय',
      phrase: 'क्या मुझे कृपया एक गिलास पानी मिल सकता है?',
      icon: 'GlassWater',
      color: 'bg-blue-950/80 border-blue-700/60 text-blue-200 hover:bg-blue-900/90'
    },
    {
      id: 'need-washroom',
      label: 'शौचालय',
      phrase: 'मुझे शौचालय जाने में सहायता चाहिए।',
      icon: 'Bath',
      color: 'bg-indigo-950/80 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/90'
    },
    {
      id: 'need-pain',
      label: 'दर्द / तुरंत मदद',
      phrase: 'मुझे दर्द या असहजता हो रही है, कृपया तुरंत आकर मदद करें।',
      icon: 'AlertTriangle',
      color: 'bg-red-950/90 border-red-600 text-red-100 hover:bg-red-900 shadow-lg shadow-red-950/50',
      isUrgent: true
    },
    {
      id: 'need-adjust',
      label: 'स्थिति बदलें',
      phrase: 'क्या आप कृपया मेरे बैठने या लेटने की स्थिति ठीक कर सकते हैं?',
      icon: 'Armchair',
      color: 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
    }
  ],
  Hinglish: [
    {
      id: 'need-water',
      label: 'Water / Paani',
      phrase: 'Mujhe please ek glass paani de do.',
      icon: 'GlassWater',
      color: 'bg-blue-950/80 border-blue-700/60 text-blue-200 hover:bg-blue-900/90'
    },
    {
      id: 'need-washroom',
      label: 'Washroom',
      phrase: 'Mujhe washroom jaane mein help chahiye.',
      icon: 'Bath',
      color: 'bg-indigo-950/80 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/90'
    },
    {
      id: 'need-pain',
      label: 'In Pain / Help',
      phrase: 'Mujhe bohot pain ho raha hai, please jaldi meri help karo.',
      icon: 'AlertTriangle',
      color: 'bg-red-950/90 border-red-600 text-red-100 hover:bg-red-900 shadow-lg shadow-red-950/50',
      isUrgent: true
    },
    {
      id: 'need-adjust',
      label: 'Adjust Position',
      phrase: 'Please meri seating ya lying position adjust kar do.',
      icon: 'Armchair',
      color: 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:bg-slate-800'
    }
  ]
};

export function getQuickNeedsForLanguage(language?: string): QuickNeed[] {
  const langKey = (language || 'English') as 'English' | 'Hindi' | 'Hinglish';
  return QUICK_NEEDS_BY_LANGUAGE[langKey] || QUICK_NEEDS_BY_LANGUAGE.English;
}

export const QUICK_NEEDS: QuickNeed[] = QUICK_NEEDS_BY_LANGUAGE.English;

export function getSimulatedScenariosForLanguage(
  language?: string,
  userName: string = 'Alex'
): SimulatedScenario[] {
  const lang = language || 'English';

  if (lang === 'Hindi') {
    return [
      {
        id: 'scen-dinner',
        title: 'रात का भोजन (Dinner)',
        speaker: 'परिवार का सदस्य',
        text: `नमस्ते ${userName}! हम रात का खाना ऑर्डर कर रहे हैं। आप आज रात क्या लेना पसंद करेंगे?`,
        icon: 'Utensils'
      },
      {
        id: 'scen-checkup',
        title: 'देखभालकर्ता जाँच',
        speaker: 'देखभालकर्ता / नर्स',
        text: `शुभ प्रभात ${userName}! कल रात आपकी नींद कैसी रही और अभी कैसा लग रहा है?`,
        icon: 'HeartPulse'
      },
      {
        id: 'scen-family',
        title: 'परिवार से भेंट',
        speaker: 'जीवनसाथी',
        text: `दोपहर में सब मिलने आ रहे हैं! क्या हमें लिविंग रूम में बैठना चाहिए या बाहर?`,
        icon: 'Users'
      },
      {
        id: 'scen-movie',
        title: 'शाम का विश्राम',
        speaker: 'मित्र',
        text: `हम कोई अच्छी फ़िल्म या संगीत शुरू कर रहे हैं। क्या आपकी कोई विशेष पसंद है?`,
        icon: 'Film'
      }
    ];
  }

  if (lang === 'Hinglish') {
    return [
      {
        id: 'scen-dinner',
        title: 'Ordering Dinner',
        speaker: 'Family Member',
        text: `Hey ${userName}! Hum abhi dinner order kar rahe hain. Aaj pizza loge ya pasta?`,
        icon: 'Utensils'
      },
      {
        id: 'scen-checkup',
        title: 'Caregiver Checkup',
        speaker: 'Caregiver / Rita',
        text: `Good morning ${userName}! Kal raat neend kaisi thi, and comfortable feel ho raha hai?`,
        icon: 'HeartPulse'
      },
      {
        id: 'scen-family',
        title: 'Family Visit',
        speaker: 'Family',
        text: `Grandkids aa rahe hain afternoon mein! Patio mein baithein ya living room mein?`,
        icon: 'Users'
      },
      {
        id: 'scen-movie',
        title: 'Evening Relaxing',
        speaker: 'Friend',
        text: `Koi movie ya show lagayein? Action, comedy ya family show kya dekhoge?`,
        icon: 'Film'
      }
    ];
  }

  return [
    {
      id: 'scen-dinner',
      title: 'Ordering Dinner',
      speaker: 'Family Member',
      text: `Hey ${userName}! We are ordering dinner now. Do you want pizza or pasta tonight?`,
      icon: 'Utensils'
    },
    {
      id: 'scen-checkup',
      title: 'Caregiver Checkup',
      speaker: 'Caregiver / Nurse',
      text: `Good morning ${userName}. How did you sleep last night, and are you feeling comfortable?`,
      icon: 'HeartPulse'
    },
    {
      id: 'scen-family',
      title: 'Family Visit',
      speaker: 'Spouse',
      text: 'The grandkids are coming over this afternoon! Should we sit out in the patio or in the living room?',
      icon: 'Users'
    },
    {
      id: 'scen-movie',
      title: 'Evening Relaxing',
      speaker: 'Friend',
      text: 'We are picking a movie to watch. Do you prefer action, comedy, or a documentary?',
      icon: 'Film'
    }
  ];
}

export const SIMULATED_SCENARIOS: SimulatedScenario[] = getSimulatedScenariosForLanguage('English');

export function getInitialResponsesForLanguage(language?: string): PredictedResponse[] {
  const lang = language || 'English';

  if (lang === 'Hindi') {
    return [
      {
        id: 'p1',
        text: 'पिज़्ज़ा बहुत अच्छा रहेगा!',
        tag: 'सीधा उत्तर',
        details: 'पिज़्ज़ा बहुत अच्छा रहेगा! मुझे एक स्लाइस बहुत पसंद आएगी।'
      },
      {
        id: 'p2',
        text: 'आज मैं पास्ता लेना पसंद करूँगा।',
        tag: 'वैकल्पिक पसंद',
        details: 'आज मैं पास्ता और थोड़ा सा ताज़ा सलाद लेना पसंद करूँगा।'
      },
      {
        id: 'p3',
        text: 'मुझे अभी ज़्यादा भूख नहीं है।',
        tag: 'अस्वीकृति / स्थिति',
        details: 'मुझे अभी ज़्यादा भूख नहीं है, शायद सिर्फ थोड़ा गर्म सूप या पेय।'
      },
      {
        id: 'p4',
        text: 'आप अपने लिए क्या मँगा रहे हैं?',
        tag: 'सवाल / पूछना',
        details: 'आप अपने लिए क्या मँगा रहे हैं? अपनी पसंद का कुछ भी मँगा लीजिए!'
      }
    ];
  }

  if (lang === 'Hinglish') {
    return [
      {
        id: 'p1',
        text: 'Pizza sounds great!',
        tag: 'Direct Answer',
        details: 'Pizza sounds great! Ek slice mere liye bhi order kar do please.'
      },
      {
        id: 'p2',
        text: 'Aaj main pasta prefer karunga.',
        tag: 'Alternative',
        details: 'Aaj main pasta prefer karunga with a fresh salad.'
      },
      {
        id: 'p3',
        text: 'Mujhe abhi zyada bhookh nahi hai.',
        tag: 'Statement / Refusal',
        details: 'Mujhe abhi zyada bhookh nahi hai, bas warm drink chalegi.'
      },
      {
        id: 'p4',
        text: 'Aap kya order kar rahe ho?',
        tag: 'Follow-up Question',
        details: 'Aap kya order kar rahe ho? Apni favorite choice surprise kar do!'
      }
    ];
  }

  return [
    {
      id: 'p1',
      text: 'Pizza sounds great!',
      tag: 'Direct Answer',
      details: 'Pizza sounds great! I would love a slice of pepperoni or cheese.'
    },
    {
      id: 'p2',
      text: "I'd prefer pasta today.",
      tag: 'Alternative',
      details: "I'd prefer pasta today with a fresh garden salad."
    },
    {
      id: 'p3',
      text: "I'm not very hungry right now.",
      tag: 'Statement',
      details: "I'm not very hungry right now, maybe just a warm soup or drink."
    },
    {
      id: 'p4',
      text: 'What are you having?',
      tag: 'Follow-up',
      details: 'What are you having? Surprise me with your favorite choice!'
    }
  ];
}
