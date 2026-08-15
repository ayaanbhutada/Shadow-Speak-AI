export interface LocalizedOptionContent {
  title: string;
  description: string;
  traitTag: string;
}

export interface LocalizedQuestionContent {
  category: string;
  questionText: string;
  subtitle: string;
}

export interface CommunicationOption {
  id: number; // 1 to 10
  title: string;
  description: string;
  traitTag: string;
  localized?: {
    English?: LocalizedOptionContent;
    Hindi?: LocalizedOptionContent;
    Hinglish?: LocalizedOptionContent;
  };
}

export interface CommunicationQuestion {
  id: number; // 1 to 10
  category: string;
  questionText: string;
  subtitle: string;
  iconName: string;
  localized?: {
    English?: LocalizedQuestionContent;
    Hindi?: LocalizedQuestionContent;
    Hinglish?: LocalizedQuestionContent;
  };
  options: CommunicationOption[];
}

export const COMMUNICATION_QUESTIONS_RAW: CommunicationQuestion[] = [
  {
    id: 1,
    category: "Day-to-Day Need / Hydration",
    questionText: "1. \"Would you like a glass of water?\"",
    subtitle: "Select the responses that match how you would naturally answer this daily question.",
    iconName: "MessageSquare",
    localized: {
      English: {
        category: "Day-to-Day Need / Hydration",
        questionText: "1. \"Would you like a glass of water?\"",
        subtitle: "Select the responses that match how you would naturally answer this daily question.",
      },
      Hindi: {
        category: "दैनिक आवश्यकता / जलपान",
        questionText: "1. \"क्या आप एक गिलास पानी लेना चाहेंगे?\"",
        subtitle: "उन विकल्पों को चुनें जो आपके स्वाभाविक उत्तर से मेल खाते हैं।",
      },
      Hinglish: {
        category: "Daily Need / Paani & Hydration",
        questionText: "1. \"Kya aapko ek glass paani chahiye?\"",
        subtitle: "Wo options select karein jo aapke natural style se match karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"Yes, please.\"",
        description: "Short, polite, and directly affirmative.",
        traitTag: "Short & Polite",
        localized: {
          English: { title: "\"Yes, please.\"", description: "Short, polite, and directly affirmative.", traitTag: "Short & Polite" },
          Hindi: { title: "\"हाँ, कृपया।\"", description: "संक्षिप्त, विनम्र और सीधा उत्तर।", traitTag: "विनम्र व संक्षिप्त" },
          Hinglish: { title: "\"Haan, please.\"", description: "Short, polite aur direct answer.", traitTag: "Short & Polite" }
        }
      },
      {
        id: 2,
        title: "\"Just a small sip, thank you.\"",
        description: "Gentle, specific, and considerate.",
        traitTag: "Gentle & Specific",
        localized: {
          English: { title: "\"Just a small sip, thank you.\"", description: "Gentle, specific, and considerate.", traitTag: "Gentle & Specific" },
          Hindi: { title: "\"बस थोड़ा सा घूंट, धन्यवाद।\"", description: "सौम्य और सीमित मात्रा का अनुरोध।", traitTag: "सौम्य व स्पष्ट" },
          Hinglish: { title: "\"Bas thoda sa sip, thank you.\"", description: "Gentle and specific amount request.", traitTag: "Gentle Sip" }
        }
      },
      {
        id: 3,
        title: "\"Ice cold water with lemon if possible!\"",
        description: "Detailed, expressive, and specific preference.",
        traitTag: "Detailed Preference",
        localized: {
          English: { title: "\"Ice cold water with lemon if possible!\"", description: "Detailed, expressive, and specific preference.", traitTag: "Detailed Preference" },
          Hindi: { title: "\"यदि संभव हो तो नींबू के साथ ठंडा पानी!\"", description: "विस्तृत और विशिष्ट पसंद।", traitTag: "विशिष्ट पसंद" },
          Hinglish: { title: "\"Ice cold paani lemon ke saath please!\"", description: "Detailed aur specific preference.", traitTag: "Detailed Preference" }
        }
      },
      {
        id: 4,
        title: "\"Water is fine, but I'd love warm tea instead.\"",
        description: "Polite counter-offer and alternative choice.",
        traitTag: "Counter-Offer",
        localized: {
          English: { title: "\"Water is fine, but I'd love warm tea instead.\"", description: "Polite counter-offer and alternative choice.", traitTag: "Counter-Offer" },
          Hindi: { title: "\"पानी ठीक है, लेकिन मुझे गर्म चाय पसंद आएगी।\"", description: "विनम्र वैकल्पिक सुझाव।", traitTag: "वैकल्पिक चाय" },
          Hinglish: { title: "\"Paani chalega, but garam chai milegi?\"", description: "Polite counter-offer for tea.", traitTag: "Tea Preference" }
        }
      },
      {
        id: 5,
        title: "\"No thanks, I'm okay for now.\"",
        description: "Courteous refusal without fluff.",
        traitTag: "Polite Refusal",
        localized: {
          English: { title: "\"No thanks, I'm okay for now.\"", description: "Courteous refusal without fluff.", traitTag: "Polite Refusal" },
          Hindi: { title: "\"नहीं धन्यवाद, अभी आवश्यकता नहीं है।\"", description: "शिष्टतापूर्वक मना करना।", traitTag: "शिष्ट अस्वीकृति" },
          Hinglish: { title: "\"No thanks, abhi nahi chahiye.\"", description: "Courteous refusal without extra words.", traitTag: "Polite Refusal" }
        }
      },
      {
        id: 6,
        title: "\"Paani de do thoda sa, thanks!\"",
        description: "Conversational Hinglish / local blend phrasing.",
        traitTag: "Hinglish Blend",
        localized: {
          English: { title: "\"Could you give me a little water, thanks!\"", description: "Casual and friendly conversational tone.", traitTag: "Conversational" },
          Hindi: { title: "\"कृपया थोड़ा पानी दे दीजिए, धन्यवाद!\"", description: "अनौपचारिक और मित्रवत लहजा।", traitTag: "अनौपचारिक अनुरोध" },
          Hinglish: { title: "\"Paani de do thoda sa, thanks!\"", description: "Conversational Hinglish / local blend phrasing.", traitTag: "Hinglish Blend" }
        }
      },
      {
        id: 7,
        title: "\"Please ask my caregiver to help me drink it.\"",
        description: "Delegating assistance to caregiver.",
        traitTag: "Caregiver Assisted",
        localized: {
          English: { title: "\"Please ask my caregiver to help me drink it.\"", description: "Delegating assistance to caregiver.", traitTag: "Caregiver Assisted" },
          Hindi: { title: "\"कृपया मेरे देखभालकर्ता से मुझे पानी पिलाने में मदद करने को कहें।\"", description: "देखभालकर्ता को सहायता के लिए कहना।", traitTag: "देखभालकर्ता सहायता" },
          Hinglish: { title: "\"Caregiver ko bolo help kar dein drink karne mein.\"", description: "Delegating assistance to caregiver.", traitTag: "Caregiver Assisted" }
        }
      },
      {
        id: 8,
        title: "\"Water!\"",
        description: "Ultra-brief 1-word answer to save energy.",
        traitTag: "1-Word Energy Saver",
        localized: {
          English: { title: "\"Water!\"", description: "Ultra-brief 1-word answer to save energy.", traitTag: "1-Word Energy Saver" },
          Hindi: { title: "\"पानी!\"", description: "ऊर्जा बचाने के लिए 1-शब्द का त्वरित उत्तर।", traitTag: "1-शब्द उत्तर" },
          Hinglish: { title: "\"Paani!\"", description: "Ultra-brief 1-word answer to save energy.", traitTag: "1-Word Energy Saver" }
        }
      },
      {
        id: 9,
        title: "\"Haha, only if it magically turns into coffee!\"",
        description: "Playful, humorous banter.",
        traitTag: "Playful Humor",
        localized: {
          English: { title: "\"Haha, only if it magically turns into coffee!\"", description: "Playful, humorous banter.", traitTag: "Playful Humor" },
          Hindi: { title: "\"हाहा, केवल तभी जब यह कॉफी बन जाए!\"", description: "मजाकिया और हल्का-फुल्का संवाद।", traitTag: "हास्य विनोद" },
          Hinglish: { title: "\"Haha, bas coffee ban jaaye toh maza aa jaye!\"", description: "Playful, humorous banter.", traitTag: "Playful Banter" }
        }
      },
      {
        id: 10,
        title: "\"Not right now, maybe in 20 minutes.\"",
        description: "Polite postponement with time context.",
        traitTag: "Postponement",
        localized: {
          English: { title: "\"Not right now, maybe in 20 minutes.\"", description: "Polite postponement with time context.", traitTag: "Postponement" },
          Hindi: { title: "\"अभी नहीं, शायद 20 मिनट बाद।\"", description: "समय सीमा के साथ विनम्र टालना।", traitTag: "समय स्थगित" },
          Hinglish: { title: "\"Abhi nahi, thodi der baad 20 mins mein.\"", description: "Polite postponement with time context.", traitTag: "Postponement" }
        }
      },
    ]
  },
  {
    id: 2,
    category: "Daily Small Talk & Socializing",
    questionText: "2. \"Did you watch the game last night?\"",
    subtitle: "Select the responses that match how you react to casual small talk or social questions.",
    iconName: "Sliders",
    localized: {
      English: {
        category: "Daily Small Talk & Socializing",
        questionText: "2. \"Did you watch the game last night?\"",
        subtitle: "Select how you react to casual small talk or social questions.",
      },
      Hindi: {
        category: "दैनिक बातचीत व सामाजिक संवाद",
        questionText: "2. \"क्या आपने कल रात का मैच देखा?\"",
        subtitle: "चुनें कि आप सामान्य बातचीत में कैसे उत्तर देना पसंद करते हैं।",
      },
      Hinglish: {
        category: "Daily Small Talk & Socializing",
        questionText: "2. \"Kal raat ka match dekha kya?\"",
        subtitle: "Select karein aap casual baatcheet mein kaise react karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"Yes! What a crazy ending!\"",
        description: "Upbeat, excited, and enthusiastic engagement.",
        traitTag: "Enthusiastic",
        localized: {
          English: { title: "\"Yes! What a crazy ending!\"", description: "Upbeat, excited, and enthusiastic engagement.", traitTag: "Enthusiastic" },
          Hindi: { title: "\"हाँ! कितना रोमांचक अंत था!\"", description: "उत्साही और ऊर्जावान जुड़ाव।", traitTag: "उत्साही" },
          Hinglish: { title: "\"Haan! Kya mast ending thi match ki!\"", description: "Upbeat and excited engagement.", traitTag: "Enthusiastic" }
        }
      },
      {
        id: 2,
        title: "\"No, I fell asleep early.\"",
        description: "Direct, simple, and honest factual answer.",
        traitTag: "Direct & Honest",
        localized: {
          English: { title: "\"No, I fell asleep early.\"", description: "Direct, simple, and honest factual answer.", traitTag: "Direct & Honest" },
          Hindi: { title: "\"नहीं, मैं जल्दी सो गया था।\"", description: "सीधा, सरल और सच्चा उत्तर।", traitTag: "सरल व स्पष्ट" },
          Hinglish: { title: "\"Nahi, main jaldi so gaya tha.\"", description: "Direct, simple and honest answer.", traitTag: "Direct & Honest" }
        }
      },
      {
        id: 3,
        title: "\"I caught the highlights this morning!\"",
        description: "Casual update with modern context.",
        traitTag: "Casual Update",
        localized: {
          English: { title: "\"I caught the highlights this morning!\"", description: "Casual update with modern context.", traitTag: "Casual Update" },
          Hindi: { title: "\"मैंने सुबह हाइलाइट्स देख लिए थे!\"", description: "हाइलाइट्स देखने की जानकारी।", traitTag: "संक्षिप्त समीक्षा" },
          Hinglish: { title: "\"Subah highlights dekh liye the maine!\"", description: "Casual update with morning highlights.", traitTag: "Casual Highlights" }
        }
      },
      {
        id: 4,
        title: "\"I don't really watch sports much, but how was it?\"",
        description: "Polite deflection into a question.",
        traitTag: "Polite Question",
        localized: {
          English: { title: "\"I don't really watch sports much, but how was it?\"", description: "Polite deflection into a question.", traitTag: "Polite Question" },
          Hindi: { title: "\"मैं खेल कम देखता हूँ, लेकिन मैच कैसा रहा?\"", description: "सामने वाले से सवाल पूछने का विनम्र तरीका।", traitTag: "जिज्ञासु व विनम्र" },
          Hinglish: { title: "\"Main sports kam dekhta hoon, kaisa tha waise?\"", description: "Polite inquiry into the score/match.", traitTag: "Polite Inquiry" }
        }
      },
      {
        id: 5,
        title: "\"Arre missed it! Who won the match?\"",
        description: "Hinglish social banter and curiosity.",
        traitTag: "Hinglish Banter",
        localized: {
          English: { title: "\"Oh I missed it! Who won?\"", description: "Friendly and curious question.", traitTag: "Curious Followup" },
          Hindi: { title: "\"अरे छूट गया! कौन जीता मैच?\"", description: "जिज्ञासा से भरपूर प्रश्न।", traitTag: "मित्रवत जिज्ञासा" },
          Hinglish: { title: "\"Arre missed it! Who won the match?\"", description: "Hinglish social banter and curiosity.", traitTag: "Hinglish Banter" }
        }
      },
      {
        id: 6,
        title: "\"Yes! Our team played terribly though.\"",
        description: "Witty, slightly opinionated banter.",
        traitTag: "Witty & Opinionated",
        localized: {
          English: { title: "\"Yes! Our team played terribly though.\"", description: "Witty, slightly opinionated banter.", traitTag: "Witty & Opinionated" },
          Hindi: { title: "\"हाँ! लेकिन हमारी टीम ने बहुत खराब खेला।\"", description: "स्पष्ट और विनोदी राय।", traitTag: "स्पष्टवादी" },
          Hinglish: { title: "\"Haan! Team ne bilkul bekaar khela kal.\"", description: "Witty, slightly opinionated banter.", traitTag: "Witty Banter" }
        }
      },
      {
        id: 7,
        title: "\"No, I preferred listening to music / reading.\"",
        description: "Quiet, personal, and relaxed activity.",
        traitTag: "Quiet & Relaxed",
        localized: {
          English: { title: "\"No, I preferred listening to music / reading.\"", description: "Quiet, personal, and relaxed activity.", traitTag: "Quiet & Relaxed" },
          Hindi: { title: "\"नहीं, मैंने संगीत सुनना/पढ़ना पसंद किया।\"", description: "शांत और व्यक्तिगत गतिविधि।", traitTag: "शांत विश्राम" },
          Hinglish: { title: "\"Nahi, main music sun raha tha aaram se.\"", description: "Quiet personal relaxation preference.", traitTag: "Quiet Relax" }
        }
      },
      {
        id: 8,
        title: "\"Missed it. Fill me in on the score!\"",
        description: "Action-focused request for information.",
        traitTag: "Action-Focused",
        localized: {
          English: { title: "\"Missed it. Fill me in on the score!\"", description: "Action-focused request for information.", traitTag: "Action-Focused" },
          Hindi: { title: "\"छूट गया। मुझे स्कोर बताइए!\"", description: "सीधा स्कोर पूछना।", traitTag: "स्कोर अपडेट" },
          Hinglish: { title: "\"Miss ho gaya. Score batao zara!\"", description: "Action-focused inquiry for score.", traitTag: "Quick Score" }
        }
      },
      {
        id: 9,
        title: "\"Too tired last night to watch anything.\"",
        description: "Sharing physical energy level.",
        traitTag: "Fatigue Context",
        localized: {
          English: { title: "\"Too tired last night to watch anything.\"", description: "Sharing physical energy level.", traitTag: "Fatigue Context" },
          Hindi: { title: "\"कल रात बहुत थकान थी, कुछ देख नहीं सका।\"", description: "थकान की ईमानदार अभिव्यक्ति।", traitTag: "थकान की जानकारी" },
          Hinglish: { title: "\"Kal bahut thakaan thi, kuch nahi dekh paaya.\"", description: "Sharing physical energy level honestly.", traitTag: "Rest Context" }
        }
      },
      {
        id: 10,
        title: "\"No.\"",
        description: "Minimalist 1-word response.",
        traitTag: "Minimalist",
        localized: {
          English: { title: "\"No.\"", description: "Minimalist 1-word response.", traitTag: "Minimalist" },
          Hindi: { title: "\"नहीं।\"", description: "1-शब्द का न्यूनतम उत्तर।", traitTag: "न्यूनतम उत्तर" },
          Hinglish: { title: "\"Nahi.\"", description: "Minimalist 1-word response.", traitTag: "Minimalist" }
        }
      },
    ]
  },
  {
    id: 3,
    category: "Daily Health & Mood Check",
    questionText: "3. \"How are you feeling right now?\"",
    subtitle: "Select how you prefer to share your physical comfort and mood with others.",
    iconName: "Stethoscope",
    localized: {
      English: {
        category: "Daily Health & Mood Check",
        questionText: "3. \"How are you feeling right now?\"",
        subtitle: "Select how you prefer to share your physical comfort and mood with others.",
      },
      Hindi: {
        category: "दैनिक स्वास्थ्य व मनःस्थिति",
        questionText: "3. \"अभी आप कैसा महसूस कर रहे हैं?\"",
        subtitle: "चुनें कि आप अपने स्वास्थ्य और मनोदशा को कैसे व्यक्त करते हैं।",
      },
      Hinglish: {
        category: "Daily Health & Mood Check",
        questionText: "3. \"Abhi tabiyat aur mood kaisa lag raha hai?\"",
        subtitle: "Select karein aap apna physical comfort aur mood kaise share karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"I'm feeling good and well-rested!\"",
        description: "Positive, encouraging, and cheerful.",
        traitTag: "Upbeat & Positive",
        localized: {
          English: { title: "\"I'm feeling good and well-rested!\"", description: "Positive, encouraging, and cheerful.", traitTag: "Upbeat & Positive" },
          Hindi: { title: "\"मैं अच्छा और तरोताजा महसूस कर रहा हूँ!\"", description: "सकारात्मक, उत्साहजनक और प्रसन्न।", traitTag: "सकारात्मक व प्रसन्न" },
          Hinglish: { title: "\"Tabiyat achhi hai aur well-rested feel ho raha hai!\"", description: "Positive, cheerful and energetic update.", traitTag: "Upbeat & Positive" }
        }
      },
      {
        id: 2,
        title: "\"A bit tired, but holding up okay.\"",
        description: "Balanced, realistic, and calm.",
        traitTag: "Balanced Realist",
        localized: {
          English: { title: "\"A bit tired, but holding up okay.\"", description: "Balanced, realistic, and calm.", traitTag: "Balanced Realist" },
          Hindi: { title: "\"थोड़ी थकान है, पर सब ठीक संभल रहा है।\"", description: "संतुलित, यथार्थवादी और शांत।", traitTag: "संतुलित यथार्थ" },
          Hinglish: { title: "\"Thoda tired hoon, but all good overall.\"", description: "Balanced, realistic and calm status.", traitTag: "Balanced Realist" }
        }
      },
      {
        id: 3,
        title: "\"In a bit of discomfort—could use my medication.\"",
        description: "Clinical, symptom-focused, and urgent.",
        traitTag: "Symptom Focused",
        localized: {
          English: { title: "\"In a bit of discomfort—could use my medication.\"", description: "Clinical, symptom-focused, and urgent.", traitTag: "Symptom Focused" },
          Hindi: { title: "\"थोड़ी असुविधा है—दवा की आवश्यकता हो सकती है।\"", description: "लक्षण-केंद्रित और समय पर दवा का अनुरोध।", traitTag: "दवा की आवश्यकता" },
          Hinglish: { title: "\"Thoda discomfort hai—dawai mil sakti hai please?\"", description: "Symptom-focused medicine request.", traitTag: "Symptom Focused" }
        }
      },
      {
        id: 4,
        title: "\"Sab theek hai, baseline is fine.\"",
        description: "Conversational Hinglish reassurance.",
        traitTag: "Hinglish Baseline",
        localized: {
          English: { title: "\"Everything is fine, baseline is stable.\"", description: "Calm and steady reassurance.", traitTag: "Stable Baseline" },
          Hindi: { title: "\"सब ठीक है, स्थिति स्थिर है।\"", description: "सहज और आश्वस्त करने वाला उत्तर।", traitTag: "स्थिर स्थिति" },
          Hinglish: { title: "\"Sab theek hai, baseline is fine.\"", description: "Conversational Hinglish reassurance.", traitTag: "Hinglish Baseline" }
        }
      },
      {
        id: 5,
        title: "\"Feeling great! Ready for the day.\"",
        description: "High-energy motivation.",
        traitTag: "High Energy",
        localized: {
          English: { title: "\"Feeling great! Ready for the day.\"", description: "High-energy motivation.", traitTag: "High Energy" },
          Hindi: { title: "\"बहुत बढ़िया लग रहा है! दिन के लिए तैयार हूँ।\"", description: "ऊर्जा और उत्साह से भरा।", traitTag: "उच्च ऊर्जा" },
          Hinglish: { title: "\"Feeling great! Aaj ka din shuru karte hain.\"", description: "High-energy motivation and optimism.", traitTag: "High Energy" }
        }
      },
      {
        id: 6,
        title: "\"A little quiet today, just resting peacefully.\"",
        description: "Gentle, peaceful, and soft tone.",
        traitTag: "Peaceful & Soft",
        localized: {
          English: { title: "\"A little quiet today, just resting peacefully.\"", description: "Gentle, peaceful, and soft tone.", traitTag: "Peaceful & Soft" },
          Hindi: { title: "\"आज मन शांत है, बस आराम कर रहा हूँ।\"", description: "कोमल, शांत और विश्रामपूर्ण।", traitTag: "शांत विश्राम" },
          Hinglish: { title: "\"Aaj mood quiet hai, aaram se rest kar raha hoon.\"", description: "Gentle, peaceful, soft tone.", traitTag: "Peaceful Rest" }
        }
      },
      {
        id: 7,
        title: "\"Surviving! Haha, one day at a time.\"",
        description: "Dry wit and resilient humor.",
        traitTag: "Resilient Humor",
        localized: {
          English: { title: "\"Surviving! Haha, one day at a time.\"", description: "Dry wit and resilient humor.", traitTag: "Resilient Humor" },
          Hindi: { title: "\"चल रहा है! हाहा, हर दिन एक नई चुनौती।\"", description: "हौसले और विनोदपूर्ण शैली।", traitTag: "हंसमुख धैर्य" },
          Hinglish: { title: "\"Bas chal raha hai! One day at a time haha.\"", description: "Dry wit and resilient everyday humor.", traitTag: "Resilient Humor" }
        }
      },
      {
        id: 8,
        title: "\"Better than yesterday, thank you for asking!\"",
        description: "Warm, appreciative, and gracious.",
        traitTag: "Warm & Grateful",
        localized: {
          English: { title: "\"Better than yesterday, thank you for asking!\"", description: "Warm, appreciative, and gracious.", traitTag: "Warm & Grateful" },
          Hindi: { title: "\"कल से बेहतर हूँ, पूछने के लिए धन्यवाद!\"", description: "आभार और स्नेह से भरा उत्तर।", traitTag: "कृतज्ञ व स्नेही" },
          Hinglish: { title: "\"Kal se better lag raha hai, puchne ke liye thanks!\"", description: "Warm, appreciative and gracious phrasing.", traitTag: "Warm & Grateful" }
        }
      },
      {
        id: 9,
        title: "\"Please check my vitals / pulse with caregiver.\"",
        description: "Redirecting to medical caregiver.",
        traitTag: "Caregiver Redirect",
        localized: {
          English: { title: "\"Please check my vitals / pulse with caregiver.\"", description: "Redirecting to medical caregiver.", traitTag: "Caregiver Redirect" },
          Hindi: { title: "\"कृपया मेरे देखभालकर्ता से नब्ज/तापमान जांचने को कहें।\"", description: "चिकित्सीय देखभालकर्ता को निर्देश।", traitTag: "चिकित्सीय निर्देश" },
          Hinglish: { title: "\"Caregiver se keh kar vitals check karwa lo please.\"", description: "Redirecting to medical caregiver.", traitTag: "Caregiver Redirect" }
        }
      },
      {
        id: 10,
        title: "\"Okay.\"",
        description: "Ultra-brief acknowledgment.",
        traitTag: "Ultra-Brief",
        localized: {
          English: { title: "\"Okay.\"", description: "Ultra-brief acknowledgment.", traitTag: "Ultra-Brief" },
          Hindi: { title: "\"ठीक।\"", description: "अति-संक्षिप्त पुष्टि।", traitTag: "अति-संक्षिप्त" },
          Hinglish: { title: "\"Theek.\"", description: "Ultra-brief 1-word acknowledgement.", traitTag: "Ultra-Brief" }
        }
      },
    ]
  },
  {
    id: 4,
    category: "Daily Activity & Choice",
    questionText: "4. \"What would you like to do this afternoon?\"",
    subtitle: "Select how you express autonomy and decision-making for daily activities.",
    iconName: "Heart",
    localized: {
      English: {
        category: "Daily Activity & Choice",
        questionText: "4. \"What would you like to do this afternoon?\"",
        subtitle: "Select how you express autonomy and decision-making for daily activities.",
      },
      Hindi: {
        category: "दैनिक गतिविधि व विकल्प",
        questionText: "4. \"आज दोपहर आप क्या करना चाहेंगे?\"",
        subtitle: "चुनें कि आप गतिविधियों के लिए अपनी पसंद कैसे व्यक्त करते हैं।",
      },
      Hinglish: {
        category: "Daily Activity & Choice",
        questionText: "4. \"Aaj dopahar ko kya karne ka mann hai?\"",
        subtitle: "Select karein aap daily activities ke decisions kaise convey karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"I'd love to go outside for fresh air.\"",
        description: "Outdoor & nature-oriented preference.",
        traitTag: "Outdoor Fresh Air",
        localized: {
          English: { title: "\"I'd love to go outside for fresh air.\"", description: "Outdoor & nature-oriented preference.", traitTag: "Outdoor Fresh Air" },
          Hindi: { title: "\"मैं ताजी हवा के लिए बाहर जाना पसंद करूँगा।\"", description: "बाहर जाने और ताजी हवा लेने की इच्छा।", traitTag: "ताजी हवा / बाहर" },
          Hinglish: { title: "\"Thodi der bahar fresh air mein baithna chahta hoon.\"", description: "Outdoor fresh air preference.", traitTag: "Outdoor Fresh Air" }
        }
      },
      {
        id: 2,
        title: "\"Let me watch a show or movie together.\"",
        description: "Shared, cozy entertainment.",
        traitTag: "Shared Entertainment",
        localized: {
          English: { title: "\"Let me watch a show or movie together.\"", description: "Shared, cozy entertainment.", traitTag: "Shared Entertainment" },
          Hindi: { title: "\"साथ में कोई शो या फिल्म देखते हैं।\"", description: "साथ बैठकर मनोरंजन का आनंद लेना।", traitTag: "फिल्म/शो मनोरंजन" },
          Hinglish: { title: "\"Saath mein koi accha show ya movie dekhte hain.\"", description: "Shared cozy entertainment together.", traitTag: "Movie Together" }
        }
      },
      {
        id: 3,
        title: "\"I'd prefer some quiet rest in my room.\"",
        description: "Low-energy quiet time.",
        traitTag: "Quiet Rest",
        localized: {
          English: { title: "\"I'd prefer some quiet rest in my room.\"", description: "Low-energy quiet time.", traitTag: "Quiet Rest" },
          Hindi: { title: "\"मैं अपने कमरे में शांति से आराम करना चाहूँगा।\"", description: "शांत विश्राम की प्राथमिकता।", traitTag: "शांत विश्राम" },
          Hinglish: { title: "\"Room mein thoda quiet rest lena chahta hoon.\"", description: "Low-energy quiet room rest.", traitTag: "Quiet Rest" }
        }
      },
      {
        id: 4,
        title: "\"Thoda outdoor walk kar lete hain.\"",
        description: "Hinglish activity suggestion.",
        traitTag: "Hinglish Walk",
        localized: {
          English: { title: "\"Let's go for a short walk or stroll.\"", description: "Casual outdoor movement suggestion.", traitTag: "Short Stroll" },
          Hindi: { title: "\"थोड़ी देर टहलने चलते हैं।\"", description: "थोड़ा घूमने का सुझाव।", traitTag: "टहलने की इच्छा" },
          Hinglish: { title: "\"Thoda outdoor walk kar lete hain.\"", description: "Hinglish activity suggestion.", traitTag: "Hinglish Walk" }
        }
      },
      {
        id: 5,
        title: "\"Surprise me—whatever you'd like to do!\"",
        description: "Flexible, easygoing, and agreeable.",
        traitTag: "Easygoing",
        localized: {
          English: { title: "\"Surprise me—whatever you'd like to do!\"", description: "Flexible, easygoing, and agreeable.", traitTag: "Easygoing" },
          Hindi: { title: "\"आप जो चाहें वही करेंगे!\"", description: "लचीला और सहज दृष्टिकोण।", traitTag: "सहज व सहमत" },
          Hinglish: { title: "\"Aap decide karo—jo bhi aapko pasand ho!\"", description: "Flexible, easygoing and agreeable attitude.", traitTag: "Easygoing" }
        }
      },
      {
        id: 6,
        title: "\"I want to listen to music or an audiobook.\"",
        description: "Audio relaxation preference.",
        traitTag: "Audio Relaxation",
        localized: {
          English: { title: "\"I want to listen to music or an audiobook.\"", description: "Audio relaxation preference.", traitTag: "Audio Relaxation" },
          Hindi: { title: "\"मैं संगीत या ऑडियोबुक सुनना चाहता हूँ।\"", description: "ध्वनि आधारित शांत मनोरंजन।", traitTag: "संगीत/ऑडियोबुक" },
          Hinglish: { title: "\"Music ya audiobook sunne ka mann hai.\"", description: "Audio relaxation preference.", traitTag: "Audio Relaxation" }
        }
      },
      {
        id: 7,
        title: "\"Can we video call a family member or friend?\"",
        description: "Social connection & outreach.",
        traitTag: "Social Outreach",
        localized: {
          English: { title: "\"Can we video call a family member or friend?\"", description: "Social connection & outreach.", traitTag: "Social Outreach" },
          Hindi: { title: "\"क्या हम परिवार या दोस्त से वीडियो कॉल कर सकते हैं?\"", description: "अपनों से संपर्क और बातचीत।", traitTag: "वीडियो कॉल" },
          Hinglish: { title: "\"Family ya friends ko video call karein kya?\"", description: "Social video call connection.", traitTag: "Social Video Call" }
        }
      },
      {
        id: 8,
        title: "\"Resting now, maybe we can decide in an hour.\"",
        description: "Deferred choice.",
        traitTag: "Deferred Choice",
        localized: {
          English: { title: "\"Resting now, maybe we can decide in an hour.\"", description: "Deferred choice.", traitTag: "Deferred Choice" },
          Hindi: { title: "\"अभी आराम कर रहा हूँ, एक घंटे बाद तय करेंगे।\"", description: "निर्णय को कुछ समय के लिए टालना।", traitTag: "विलंबित निर्णय" },
          Hinglish: { title: "\"Abhi aaram kar raha hoon, 1 hour baad decide karein?\"", description: "Deferred activity decision.", traitTag: "Deferred Choice" }
        }
      },
      {
        id: 9,
        title: "\"Whatever is planned on my care schedule.\"",
        description: "Schedule & routine compliance.",
        traitTag: "Routine Compliance",
        localized: {
          English: { title: "\"Whatever is planned on my care schedule.\"", description: "Schedule & routine compliance.", traitTag: "Routine Compliance" },
          Hindi: { title: "\"जो भी मेरी दैनिक दिनचर्या में तय है।\"", description: "नियत समय सारणी का पालन।", traitTag: "दिनचर्या पालन" },
          Hinglish: { title: "\"Jo routine chart mein set hai wahi follow karte hain.\"", description: "Schedule & routine compliance.", traitTag: "Routine Compliance" }
        }
      },
      {
        id: 10,
        title: "\"Nothing.\"",
        description: "Direct 1-word answer.",
        traitTag: "1-Word Direct",
        localized: {
          English: { title: "\"Nothing.\"", description: "Direct 1-word answer.", traitTag: "1-Word Direct" },
          Hindi: { title: "\"कुछ नहीं।\"", description: "सीधा 1-शब्द उत्तर।", traitTag: "सीधा उत्तर" },
          Hinglish: { title: "\"Kuch nahi.\"", description: "Direct 1-word response.", traitTag: "1-Word Direct" }
        }
      },
    ]
  },
  {
    id: 5,
    category: "Caregiver Departure & Needs Check",
    questionText: "5. \"Is there anything else you need before I leave?\"",
    subtitle: "Select how you wrap up daily interactions with caregivers or visitors.",
    iconName: "ShieldAlert",
    localized: {
      English: {
        category: "Caregiver Departure & Needs Check",
        questionText: "5. \"Is there anything else you need before I leave?\"",
        subtitle: "Select how you wrap up daily interactions with caregivers or visitors.",
      },
      Hindi: {
        category: "देखभालकर्ता प्रस्थान व सुरक्षा जांच",
        questionText: "5. \"मेरे जाने से पहले क्या आपको कुछ और चाहिए?\"",
        subtitle: "चुनें कि आप दिन के अंत या प्रस्थान के समय कैसे संवाद करते हैं।",
      },
      Hinglish: {
        category: "Caregiver Departure & Needs Check",
        questionText: "5. \"Jaane se pehle kuch aur chahiye kya?\"",
        subtitle: "Select karein aap caregiver ya visitor ke departure par kaise wrap-up karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"No, I'm all set! Thank you so much.\"",
        description: "Warm, complete, and grateful wrap-up.",
        traitTag: "Warm Gratitude",
        localized: {
          English: { title: "\"No, I'm all set! Thank you so much.\"", description: "Warm, complete, and grateful wrap-up.", traitTag: "Warm Gratitude" },
          Hindi: { title: "\"नहीं, सब ठीक है! आपका बहुत-बहुत धन्यवाद।\"", description: "कृतज्ञता और पूर्ण संतुष्टि के साथ विदाई।", traitTag: "हार्दिक आभार" },
          Hinglish: { title: "\"Nahi, sab sorted hai! Thank you so much.\"", description: "Warm, complete, grateful wrap-up.", traitTag: "Warm Gratitude" }
        }
      },
      {
        id: 2,
        title: "\"Could you pass me my water bottle first?\"",
        description: "Specific physical task request.",
        traitTag: "Task Request",
        localized: {
          English: { title: "\"Could you pass me my water bottle first?\"", description: "Specific physical task request.", traitTag: "Task Request" },
          Hindi: { title: "\"कृपया जाने से पहले पानी की बोतल पास रख दें?\"", description: "पानी की बोतल पास रखने का स्पष्ट अनुरोध।", traitTag: "पानी का अनुरोध" },
          Hinglish: { title: "\"Pehle paani ki bottle paas rakh do please.\"", description: "Specific physical bottle request.", traitTag: "Water Bottle" }
        }
      },
      {
        id: 3,
        title: "\"Please make sure my call bell & remote are close.\"",
        description: "Safety & accessibility check.",
        traitTag: "Safety Check",
        localized: {
          English: { title: "\"Please make sure my call bell & remote are close.\"", description: "Safety & accessibility check.", traitTag: "Safety Check" },
          Hindi: { title: "\"कृपया कॉल बेल और रिमोट को पास सुनिश्चित करें।\"", description: "सुरक्षा और पहुंच की पूर्व जांच।", traitTag: "सुरक्षा जांच" },
          Hinglish: { title: "\"Call bell aur remote paas rakh dena please.\"", description: "Safety & accessibility check.", traitTag: "Safety Check" }
        }
      },
      {
        id: 4,
        title: "\"Bas theek hai, thanks a lot!\"",
        description: "Hinglish warm farewell.",
        traitTag: "Hinglish Farewell",
        localized: {
          English: { title: "\"That's all, thank you very much!\"", description: "Casual, warm sendoff.", traitTag: "Warm Sendoff" },
          Hindi: { title: "\"बस सब ठीक है, बहुत धन्यवाद!\"", description: "आत्मीय विदाई।", traitTag: "आत्मीय विदाई" },
          Hinglish: { title: "\"Bas theek hai, thanks a lot!\"", description: "Hinglish warm farewell.", traitTag: "Hinglish Farewell" }
        }
      },
      {
        id: 5,
        title: "\"Can you adjust my pillow and blanket?\"",
        description: "Physical comfort positioning.",
        traitTag: "Comfort Task",
        localized: {
          English: { title: "\"Can you adjust my pillow and blanket?\"", description: "Physical comfort positioning.", traitTag: "Comfort Task" },
          Hindi: { title: "\"क्या आप तकिया और कंबल ठीक कर सकते हैं?\"", description: "आरामदायक स्थिति बनाने का अनुरोध।", traitTag: "तकिया/कंबल ठीक करना" },
          Hinglish: { title: "\"Pillow aur blanket theek se adjust kar do please.\"", description: "Physical comfort positioning.", traitTag: "Comfort Adjust" }
        }
      },
      {
        id: 6,
        title: "\"Please tell my caregiver I'm taking a nap.\"",
        description: "Relaying message to caregiver.",
        traitTag: "Caregiver Message",
        localized: {
          English: { title: "\"Please tell my caregiver I'm taking a nap.\"", description: "Relaying message to caregiver.", traitTag: "Caregiver Message" },
          Hindi: { title: "\"कृपया देखभालकर्ता को बता दें कि मैं सो रहा हूँ।\"", description: "नींद की सूचना देना।", traitTag: "सूचना प्रेषण" },
          Hinglish: { title: "\"Caregiver ko bata dena main nap le raha hoon.\"", description: "Relaying sleep message to caregiver.", traitTag: "Nap Message" }
        }
      },
      {
        id: 7,
        title: "\"Just a smile and a warm wave!\"",
        description: "Affectionate social bond.",
        traitTag: "Affectionate",
        localized: {
          English: { title: "\"Just a smile and a warm wave!\"", description: "Affectionate social bond.", traitTag: "Affectionate" },
          Hindi: { title: "\"बस एक मुस्कान और हाथ हिलाकर विदा!\"", description: "स्नेहपूर्ण और सकारात्मक विदाई।", traitTag: "स्नेहपूर्ण विदाई" },
          Hinglish: { title: "\"Bas ek smile aur warm wave!\"", description: "Affectionate sendoff.", traitTag: "Affectionate" }
        }
      },
      {
        id: 8,
        title: "\"Please turn off the lights and TV on your way out.\"",
        description: "Clear environmental commands.",
        traitTag: "Direct Command",
        localized: {
          English: { title: "\"Please turn off the lights and TV on your way out.\"", description: "Clear environmental commands.", traitTag: "Direct Command" },
          Hindi: { title: "\"जाते समय लाइट और टीवी बंद कर दीजिएगा।\"", description: "पर्यावरण नियंत्रण का स्पष्ट निर्देश।", traitTag: "लाइट/टीवी बंद करना" },
          Hinglish: { title: "\"Jaate waqt lights aur TV off kar dena please.\"", description: "Clear environmental room commands.", traitTag: "Lights / TV Off" }
        }
      },
      {
        id: 9,
        title: "\"I'm good for now, see you later!\"",
        description: "Upbeat casual farewell.",
        traitTag: "Upbeat Farewell",
        localized: {
          English: { title: "\"I'm good for now, see you later!\"", description: "Upbeat casual farewell.", traitTag: "Upbeat Farewell" },
          Hindi: { title: "\"अभी सब ठीक है, फिर मिलते हैं!\"", description: "उत्साही और अनौपचारिक विदाई।", traitTag: "पुनर्मिलन विदाई" },
          Hinglish: { title: "\"Main theek hoon abhi, see you later!\"", description: "Upbeat casual sendoff.", traitTag: "Upbeat Farewell" }
        }
      },
      {
        id: 10,
        title: "\"All good.\"",
        description: "Ultra-brief confirmation.",
        traitTag: "Ultra-Brief",
        localized: {
          English: { title: "\"All good.\"", description: "Ultra-brief confirmation.", traitTag: "Ultra-Brief" },
          Hindi: { title: "\"सब ठीक।\"", description: "अति-संक्षिप्त पुष्टि।", traitTag: "अति-संक्षिप्त" },
          Hinglish: { title: "\"All good.\"", description: "Ultra-brief 2-word confirmation.", traitTag: "All Good" }
        }
      },
    ]
  },
  {
    id: 6,
    category: "Meals & Food Preferences",
    questionText: "6. \"What would you like to have for dinner / lunch?\"",
    subtitle: "Select how you express dietary preferences, comfort food, and meal requests.",
    iconName: "Utensils",
    localized: {
      English: {
        category: "Meals & Food Preferences",
        questionText: "6. \"What would you like to have for dinner / lunch?\"",
        subtitle: "Select how you express dietary preferences, comfort food, and meal requests.",
      },
      Hindi: {
        category: "भोजन व खानपान की पसंद",
        questionText: "6. \"रात के खाने / दोपहर के भोजन में आप क्या लेना चाहेंगे?\"",
        subtitle: "चुनें कि आप भोजन की पसंद, सुपाच्य आहार व फरमाइश कैसे व्यक्त करते हैं।",
      },
      Hinglish: {
        category: "Meals & Khana Preferences",
        questionText: "6. \"Dinner / Lunch mein kya khaane ka mann hai?\"",
        subtitle: "Select karein aap meal preferences aur comfort food request kaise karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"Something warm and easy to swallow, like soup.\"",
        description: "Comforting, safe, and gentle meal choice.",
        traitTag: "Gentle Soup / Warm",
        localized: {
          English: { title: "\"Something warm and easy to swallow, like soup.\"", description: "Comforting, safe, and gentle meal choice.", traitTag: "Gentle Soup / Warm" },
          Hindi: { title: "\"कुछ गर्म और निगलने में आसान, जैसे सूप।\"", description: "सुपाच्य, सुरक्षित और आरामदायक भोजन।", traitTag: "गर्म सूप / सुपाच्य" },
          Hinglish: { title: "\"Kuch garam aur easy to swallow, jaise soup.\"", description: "Comforting, safe and gentle meal choice.", traitTag: "Warm Soup" }
        }
      },
      {
        id: 2,
        title: "\"Whatever you are cooking, I'll happily have!\"",
        description: "Flexible, easygoing, and accommodating.",
        traitTag: "Easygoing Food",
        localized: {
          English: { title: "\"Whatever you are cooking, I'll happily have!\"", description: "Flexible, easygoing, and accommodating.", traitTag: "Easygoing Food" },
          Hindi: { title: "\"आप जो भी बना रहे हैं, मैं खुशी से खाऊँगा!\"", description: "लचीला और आभारी स्वभाव।", traitTag: "सहज खानपान" },
          Hinglish: { title: "\"Jo bhi bana rahe ho, main khushi se khaa loonga!\"", description: "Flexible, easygoing and accommodating.", traitTag: "Easygoing Food" }
        }
      },
      {
        id: 3,
        title: "\"Dal khichdi or soft homemade comfort food.\"",
        description: "Traditional comfort food choice.",
        traitTag: "Comfort Food",
        localized: {
          English: { title: "\"Dal khichdi or soft homemade comfort food.\"", description: "Traditional comfort food choice.", traitTag: "Comfort Food" },
          Hindi: { title: "\"दाल खिचड़ी या हल्का घर का बना भोजन।\"", description: "पारंपरिक और पौष्टिक सुपाच्य आहार।", traitTag: "दाल खिचड़ी" },
          Hinglish: { title: "\"Dal khichdi ya soft homemade comfort food.\"", description: "Traditional comfort food choice.", traitTag: "Dal Khichdi" }
        }
      },
      {
        id: 4,
        title: "\"I'm craving something tasty—pasta or flavorful curry.\"",
        description: "Rich, flavorful, and specific cravings.",
        traitTag: "Flavorful Craving",
        localized: {
          English: { title: "\"I'm craving something tasty—pasta or flavorful curry.\"", description: "Rich, flavorful, and specific cravings.", traitTag: "Flavorful Craving" },
          Hindi: { title: "\"मुझे कुछ स्वादिष्ट चाहिए—पास्ता या मसालेदार करी।\"", description: "स्वादिष्ट और खास भोजन की इच्छा।", traitTag: "स्वादिष्ट व्यंजन" },
          Hinglish: { title: "\"Kuch tasty khaane ka mann hai—pasta ya curry.\"", description: "Rich, flavorful and specific cravings.", traitTag: "Flavorful Craving" }
        }
      },
      {
        id: 5,
        title: "\"Just a fresh fruit smoothie or protein shake for now.\"",
        description: "Nutritious liquid or light option.",
        traitTag: "Smoothie / Protein",
        localized: {
          English: { title: "\"Just a fresh fruit smoothie or protein shake for now.\"", description: "Nutritious liquid or light option.", traitTag: "Smoothie / Protein" },
          Hindi: { title: "\"अभी के लिए बस एक फ्रूट स्मूदी या प्रोटीन शेक।\"", description: "पौष्टिक तरल आहार।", traitTag: "स्मूदी / प्रोटीन शेक" },
          Hinglish: { title: "\"Bas fresh fruit smoothie ya protein shake for now.\"", description: "Nutritious liquid or light meal.", traitTag: "Smoothie / Protein" }
        }
      },
      {
        id: 6,
        title: "\"Not feeling very hungry right now, maybe later.\"",
        description: "Polite postponement of meal.",
        traitTag: "Low Appetite",
        localized: {
          English: { title: "\"Not feeling very hungry right now, maybe later.\"", description: "Polite postponement of meal.", traitTag: "Low Appetite" },
          Hindi: { title: "\"अभी भूख नहीं लग रही है, शायद थोड़ी देर बाद।\"", description: "विनम्रतापूर्वक भोजन टालना।", traitTag: "कम भूख" },
          Hinglish: { title: "\"Abhi bhook nahi hai zyada, baad mein khata hoon.\"", description: "Polite meal delay due to low appetite.", traitTag: "Low Appetite" }
        }
      },
      {
        id: 7,
        title: "\"Please check my nutritional chart with caregiver.\"",
        description: "Dietary plan compliance and guidance.",
        traitTag: "Dietary Guidance",
        localized: {
          English: { title: "\"Please check my nutritional chart with caregiver.\"", description: "Dietary plan compliance and guidance.", traitTag: "Dietary Guidance" },
          Hindi: { title: "\"कृपया देखभालकर्ता से मेरा डाइट चार्ट देख लें।\"", description: "आहार योजना का नियमपूर्वक पालन।", traitTag: "डाइट चार्ट" },
          Hinglish: { title: "\"Caregiver se nutrition chart check kar lo please.\"", description: "Dietary plan compliance and guidance.", traitTag: "Dietary Guidance" }
        }
      },
      {
        id: 8,
        title: "\"Thoda garam khana bana do please!\"",
        description: "Warm Hinglish meal request.",
        traitTag: "Hinglish Meal",
        localized: {
          English: { title: "\"Please prepare something fresh and warm!\"", description: "Warm, fresh meal preference.", traitTag: "Fresh Warm Food" },
          Hindi: { title: "\"कृपया कुछ ताजा और गर्म खाना बना दीजिए!\"", description: "ताजा गर्म भोजन का अनुरोध।", traitTag: "ताजा गर्म खाना" },
          Hinglish: { title: "\"Thoda garam khana bana do please!\"", description: "Warm Hinglish meal request.", traitTag: "Hinglish Meal" }
        }
      },
      {
        id: 9,
        title: "\"Surprise me with dessert first! Haha.\"",
        description: "Playful humorous banter about food.",
        traitTag: "Playful Food Banter",
        localized: {
          English: { title: "\"Surprise me with dessert first! Haha.\"", description: "Playful humorous banter about food.", traitTag: "Playful Food Banter" },
          Hindi: { title: "\"पहले मीठा खिलाकर मुझे सरप्राइज दीजिए! हाहा।\"", description: "मीठे के लिए मजाकिया संवाद।", traitTag: "मीठे की फरमाइश" },
          Hinglish: { title: "\"Pehle dessert khilao haha, then main meal!\"", description: "Playful dessert banter.", traitTag: "Dessert Banter" }
        }
      },
      {
        id: 10,
        title: "\"Food.\"",
        description: "Ultra-brief 1-word direct prompt.",
        traitTag: "1-Word Food",
        localized: {
          English: { title: "\"Food.\"", description: "Ultra-brief 1-word direct prompt.", traitTag: "1-Word Food" },
          Hindi: { title: "\"खाना।\"", description: "1-शब्द का सीधा भोजन संकेत।", traitTag: "1-शब्द भोजन" },
          Hinglish: { title: "\"Khana.\"", description: "Ultra-brief 1-word meal request.", traitTag: "1-Word Food" }
        }
      },
    ]
  },
  {
    id: 7,
    category: "Comfort & Repositioning",
    questionText: "7. \"Are you comfortable, or should we adjust your seating/bed?\"",
    subtitle: "Select how you communicate physical comfort and posture adjustments.",
    iconName: "Sliders",
    localized: {
      English: {
        category: "Comfort & Repositioning",
        questionText: "7. \"Are you comfortable, or should we adjust your seating/bed?\"",
        subtitle: "Select how you communicate physical comfort and posture adjustments.",
      },
      Hindi: {
        category: "आराम व शारीरिक स्थिति सुधार",
        questionText: "7. \"क्या आप सहज हैं, या हम आपके बैठने/बिस्तर को ठीक करें?\"",
        subtitle: "चुनें कि आप शरीर के आराम और मुद्रा समायोजन को कैसे बताते हैं।",
      },
      Hinglish: {
        category: "Comfort & Repositioning",
        questionText: "7. \"Comfortable ho ya seating/bed adjust karein?\"",
        subtitle: "Select karein aap physical posture aur comfort changes kaise mangte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"I'm very comfortable right now, thank you!\"",
        description: "Satisfied baseline comfort confirmation.",
        traitTag: "Comfortable",
        localized: {
          English: { title: "\"I'm very comfortable right now, thank you!\"", description: "Satisfied baseline comfort confirmation.", traitTag: "Comfortable" },
          Hindi: { title: "\"मैं अभी बहुत आराम से हूँ, धन्यवाद!\"", description: "वर्तमान स्थिति से पूर्ण संतुष्टि।", traitTag: "पूर्ण आराम" },
          Hinglish: { title: "\"Main bilkul comfortable hoon abhi, thank you!\"", description: "Comfortable baseline confirmation.", traitTag: "Comfortable" }
        }
      },
      {
        id: 2,
        title: "\"Please elevate my head and back a few inches.\"",
        description: "Clear posture elevation adjustment.",
        traitTag: "Head Elevation",
        localized: {
          English: { title: "\"Please elevate my head and back a few inches.\"", description: "Clear posture elevation adjustment.", traitTag: "Head Elevation" },
          Hindi: { title: "\"कृपया मेरे सिर और पीठ को थोड़ा ऊपर उठाएं।\"", description: "सिर और पीठ उठाने का स्पष्ट निर्देश।", traitTag: "सिर उठाना" },
          Hinglish: { title: "\"Head aur back thoda sa upar elevate kar do please.\"", description: "Clear head and back angle elevation.", traitTag: "Head Elevation" }
        }
      },
      {
        id: 3,
        title: "\"Could you adjust my feet and cushion support?\"",
        description: "Targeted leg and pillow positioning.",
        traitTag: "Cushion Adjust",
        localized: {
          English: { title: "\"Could you adjust my feet and cushion support?\"", description: "Targeted leg and pillow positioning.", traitTag: "Cushion Adjust" },
          Hindi: { title: "\"क्या आप मेरे पैरों और कुशन को ठीक कर सकते हैं?\"", description: "पैरों और तकिये का सही समायोजन।", traitTag: "कुशन समायोजन" },
          Hinglish: { title: "\"Feet aur cushion support ko adjust kar do please.\"", description: "Legs and cushion alignment.", traitTag: "Cushion Adjust" }
        }
      },
      {
        id: 4,
        title: "\"Thoda posture shift kar do, back feels stiff.\"",
        description: "Hinglish comfort and stiffness relief.",
        traitTag: "Hinglish Shift",
        localized: {
          English: { title: "\"Please shift my posture slightly, my back is stiff.\"", description: "Back stiffness relief request.", traitTag: "Posture Shift" },
          Hindi: { title: "\"पीठ अकड़ रही है, कृपया करवट बदलवा दीजिए।\"", description: "पीठ की अकड़न दूर करने का अनुरोध।", traitTag: "करवट बदलना" },
          Hinglish: { title: "\"Thoda posture shift kar do, back feels stiff.\"", description: "Hinglish comfort and stiffness relief.", traitTag: "Hinglish Shift" }
        }
      },
      {
        id: 5,
        title: "\"Let's transfer to the armchair or wheelchair.\"",
        description: "Full seating transfer request.",
        traitTag: "Chair Transfer",
        localized: {
          English: { title: "\"Let's transfer to the armchair or wheelchair.\"", description: "Full seating transfer request.", traitTag: "Chair Transfer" },
          Hindi: { title: "\"मुझे आर्मचेयर या व्हीलचेयर पर बैठा दीजिए।\"", description: "कुर्सी या व्हीलचेयर पर बैठने का अनुरोध।", traitTag: "व्हीलचेयर स्थानांतरण" },
          Hinglish: { title: "\"Armchair ya wheelchair par shift karte hain.\"", description: "Transfer to armchair or wheelchair.", traitTag: "Wheelchair Transfer" }
        }
      },
      {
        id: 6,
        title: "\"The room is a bit cold, can I get another blanket?\"",
        description: "Temperature and environmental warmth.",
        traitTag: "Warm Blanket",
        localized: {
          English: { title: "\"The room is a bit cold, can I get another blanket?\"", description: "Temperature and environmental warmth.", traitTag: "Warm Blanket" },
          Hindi: { title: "\"कमरा थोड़ा ठंडा है, क्या मुझे एक और कंबल मिल सकता है?\"", description: "ठंड से बचने के लिए कंबल का अनुरोध।", traitTag: "कंबल की मांग" },
          Hinglish: { title: "\"Room thoda thanda hai, ek aur blanket milega?\"", description: "Warm blanket request for cold room.", traitTag: "Warm Blanket" }
        }
      },
      {
        id: 7,
        title: "\"I'm okay for now, let's adjust in 30 minutes.\"",
        description: "Postponing adjustment with time buffer.",
        traitTag: "Postpone Shift",
        localized: {
          English: { title: "\"I'm okay for now, let's adjust in 30 minutes.\"", description: "Postponing adjustment with time buffer.", traitTag: "Postpone Shift" },
          Hindi: { title: "\"अभी ठीक हूँ, 30 मिनट बाद बदलते हैं।\"", description: "समय सीमा के साथ बदलाव टालना।", traitTag: "विलंबित बदलाव" },
          Hinglish: { title: "\"Abhi fine hoon, 30 minutes baad adjust karenge.\"", description: "Postponing adjustment by 30 mins.", traitTag: "Postpone Shift" }
        }
      },
      {
        id: 8,
        title: "\"Please have the physio check my posture support.\"",
        description: "Medical / physiotherapist delegation.",
        traitTag: "Physio Review",
        localized: {
          English: { title: "\"Please have the physio check my posture support.\"", description: "Medical / physiotherapist delegation.", traitTag: "Physio Review" },
          Hindi: { title: "\"कृपया फिजियोथेरेपिस्ट से मेरी मुद्रा की जांच करवाएं।\"", description: "विशेषज्ञ फिजियो से जांच का निर्देश।", traitTag: "फिजियो जांच" },
          Hinglish: { title: "\"Physiotherapist se bol kar posture support check karwao.\"", description: "Physiotherapist posture review.", traitTag: "Physio Review" }
        }
      },
      {
        id: 9,
        title: "\"Just tilt the screen/headrest slightly forward.\"",
        description: "Assistive device and angle alignment.",
        traitTag: "Device Alignment",
        localized: {
          English: { title: "\"Just tilt the screen/headrest slightly forward.\"", description: "Assistive device and angle alignment.", traitTag: "Device Alignment" },
          Hindi: { title: "\"बस स्क्रीन/हेडरेस्ट को थोड़ा आगे झुका दीजिए।\"", description: "स्क्रीन व हेडरेस्ट का कोण ठीक करना।", traitTag: "स्क्रीन समायोजन" },
          Hinglish: { title: "\"Screen aur headrest thoda aage tilt kar do.\"", description: "Assistive screen tilt alignment.", traitTag: "Device Alignment" }
        }
      },
      {
        id: 10,
        title: "\"Adjust.\"",
        description: "1-word urgent adjustment prompt.",
        traitTag: "1-Word Adjust",
        localized: {
          English: { title: "\"Adjust.\"", description: "1-word urgent adjustment prompt.", traitTag: "1-Word Adjust" },
          Hindi: { title: "\"बदलो।\"", description: "1-शब्द का त्वरित समायोजन संकेत।", traitTag: "1-शब्द निर्देश" },
          Hinglish: { title: "\"Adjust.\"", description: "1-word quick adjustment command.", traitTag: "1-Word Adjust" }
        }
      },
    ]
  },
  {
    id: 8,
    category: "Social Energy & Quiet Time",
    questionText: "8. \"Do you want company right now or some quiet alone time?\"",
    subtitle: "Select how you manage social boundaries, visitors, and personal rest.",
    iconName: "Heart",
    localized: {
      English: {
        category: "Social Energy & Quiet Time",
        questionText: "8. \"Do you want company right now or some quiet alone time?\"",
        subtitle: "Select how you manage social boundaries, visitors, and personal rest.",
      },
      Hindi: {
        category: "सामाजिक ऊर्जा व एकांत का समय",
        questionText: "8. \"क्या आप अभी बातचीत चाहते हैं या थोड़ा शांत समय?\"",
        subtitle: "चुनें कि आप मिलने-जुलने और एकांत विश्राम की सीमा कैसे तय करते हैं।",
      },
      Hinglish: {
        category: "Social Energy & Quiet Time",
        questionText: "8. \"Abhi company chahiye ya thodi der quiet rest?\"",
        subtitle: "Select karein aap social visitors aur personal rest time kaise balance karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"I'd love company! Please stay and chat with me.\"",
        description: "Warm, socially welcoming, and engaged.",
        traitTag: "Social & Engaged",
        localized: {
          English: { title: "\"I'd love company! Please stay and chat with me.\"", description: "Warm, socially welcoming, and engaged.", traitTag: "Social & Engaged" },
          Hindi: { title: "\"मुझे आपका साथ पसंद आएगा! कृपया बैठें और बात करें।\"", description: "मिलनसार, उत्साहवर्धक और स्नेही।", traitTag: "मिलनसार व स्नेही" },
          Hinglish: { title: "\"Company achhi lagegi! Please baitho aur baatein karo.\"", description: "Warm, socially welcoming and engaged.", traitTag: "Social & Engaged" }
        }
      },
      {
        id: 2,
        title: "\"I'd prefer some quiet rest to recharge for a bit.\"",
        description: "Polite personal boundary for rest.",
        traitTag: "Quiet Rest",
        localized: {
          English: { title: "\"I'd prefer some quiet rest to recharge for a bit.\"", description: "Polite personal boundary for rest.", traitTag: "Quiet Rest" },
          Hindi: { title: "\"मैं थोड़ा शांत रहकर ऊर्जा जुटाना पसंद करूँगा।\"", description: "विश्राम के लिए विनम्र व्यक्तिगत सीमा।", traitTag: "शांत विश्राम सीमा" },
          Hinglish: { title: "\"Thoda quiet rest chahiye recharge hone ke liye.\"", description: "Polite boundary for personal recharge time.", traitTag: "Quiet Rest" }
        }
      },
      {
        id: 3,
        title: "\"You can stay in the room—we don't need to talk.\"",
        description: "Companionable silence and shared presence.",
        traitTag: "Quiet Presence",
        localized: {
          English: { title: "\"You can stay in the room—we don't need to talk.\"", description: "Companionable silence and shared presence.", traitTag: "Quiet Presence" },
          Hindi: { title: "\"आप कमरे में रह सकते हैं—बात करना जरूरी नहीं।\"", description: "साथ में शांत उपस्थिति की सहजता।", traitTag: "मौन साथ" },
          Hinglish: { title: "\"Aap room mein baith sakte ho—baat karna zaroori nahi.\"", description: "Companionable quiet shared presence.", traitTag: "Quiet Presence" }
        }
      },
      {
        id: 4,
        title: "\"Thodi der akele rehna chahta hoon for rest.\"",
        description: "Hinglish quiet rest preference.",
        traitTag: "Hinglish Rest",
        localized: {
          English: { title: "\"I want to stay alone for a little while to rest.\"", description: "Direct personal quiet preference.", traitTag: "Alone Time" },
          Hindi: { title: "\"मैं थोड़ी देर विश्राम के लिए अकेले रहना चाहता हूँ।\"", description: "एकांत विश्राम की स्पष्ट इच्छा।", traitTag: "एकांत विश्राम" },
          Hinglish: { title: "\"Thodi der akele rehna chahta hoon for rest.\"", description: "Hinglish quiet rest preference.", traitTag: "Hinglish Rest" }
        }
      },
      {
        id: 5,
        title: "\"Let's put on some relaxing music while you're here.\"",
        description: "Atmospheric and musical companionship.",
        traitTag: "Music Company",
        localized: {
          English: { title: "\"Let's put on some relaxing music while you're here.\"", description: "Atmospheric and musical companionship.", traitTag: "Music Company" },
          Hindi: { title: "\"जब तक आप यहाँ हैं, कोई शांत संगीत लगा लेते हैं।\"", description: "संगीत के साथ सुखद वातावरण।", traitTag: "संगीत व साथ" },
          Hinglish: { title: "\"Relaxing music chala lete hain saath mein.\"", description: "Atmospheric and musical companionship.", traitTag: "Music Company" }
        }
      },
      {
        id: 6,
        title: "\"Can we call or message family for a quick hello?\"",
        description: "Reaching out to loved ones.",
        traitTag: "Family Outreach",
        localized: {
          English: { title: "\"Can we call or message family for a quick hello?\"", description: "Reaching out to loved ones.", traitTag: "Family Outreach" },
          Hindi: { title: "\"क्या हम परिवार को नमस्ते कहने के लिए कॉल कर सकते हैं?\"", description: "अपनों से संक्षिप्त बातचीत का अनुरोध।", traitTag: "परिवार से संपर्क" },
          Hinglish: { title: "\"Family ko quick call ya message karein kya?\"", description: "Reaching out to family members.", traitTag: "Family Outreach" }
        }
      },
      {
        id: 7,
        title: "\"Just a quick 5-minute chat, then I'll nap.\"",
        description: "Time-capped brief social interaction.",
        traitTag: "Brief Interaction",
        localized: {
          English: { title: "\"Just a quick 5-minute chat, then I'll nap.\"", description: "Time-capped brief social interaction.", traitTag: "Brief Interaction" },
          Hindi: { title: "\"बस 5 मिनट की बातचीत, फिर मैं सोऊँगा।\"", description: "समय-सीमित संक्षिप्त संवाद।", traitTag: "संक्षिप्त संवाद" },
          Hinglish: { title: "\"Bas 5 minutes chat, phir nap loonga thoda.\"", description: "5-minute brief interaction before rest.", traitTag: "Brief Interaction" }
        }
      },
      {
        id: 8,
        title: "\"Whatever works best for your schedule today!\"",
        description: "Flexible and considerate towards visitor.",
        traitTag: "Flexible Host",
        localized: {
          English: { title: "\"Whatever works best for your schedule today!\"", description: "Flexible and considerate towards visitor.", traitTag: "Flexible Host" },
          Hindi: { title: "\"जो भी आपके समय और सुविधा के अनुकूल हो!\"", description: "अतिथि के प्रति संवेदनशील और लचीला।", traitTag: "अतिथि सत्कार" },
          Hinglish: { title: "\"Aapke schedule ke hisaab se jo best ho!\"", description: "Considerate towards visitors schedule.", traitTag: "Flexible Host" }
        }
      },
      {
        id: 9,
        title: "\"Please let me focus on reading/browsing quietly.\"",
        description: "Independent activity focus.",
        traitTag: "Independent Focus",
        localized: {
          English: { title: "\"Please let me focus on reading/browsing quietly.\"", description: "Independent activity focus.", traitTag: "Independent Focus" },
          Hindi: { title: "\"कृपया मुझे शांति से पढ़ने/स्क्रीन देखने दें।\"", description: "व्यक्तिगत एकाग्रता का अनुरोध।", traitTag: "व्यक्तिगत एकाग्रता" },
          Hinglish: { title: "\"Mujhe aaram se reading/browsing karne do please.\"", description: "Independent reading and screen focus.", traitTag: "Independent Focus" }
        }
      },
      {
        id: 10,
        title: "\"Quiet.\"",
        description: "1-word clear boundary.",
        traitTag: "1-Word Quiet",
        localized: {
          English: { title: "\"Quiet.\"", description: "1-word clear boundary.", traitTag: "1-Word Quiet" },
          Hindi: { title: "\"शांति।\"", description: "1-शब्द की स्पष्ट शांति सीमा।", traitTag: "1-शब्द शांति" },
          Hinglish: { title: "\"Quiet.\"", description: "1-word clear peaceful boundary.", traitTag: "1-Word Quiet" }
        }
      },
    ]
  },
  {
    id: 9,
    category: "Medication & Health Routine",
    questionText: "9. \"Did you take your scheduled medicine, or do you need help?\"",
    subtitle: "Select how you communicate about daily medications and care routines.",
    iconName: "Stethoscope",
    localized: {
      English: {
        category: "Medication & Health Routine",
        questionText: "9. \"Did you take your scheduled medicine, or do you need help?\"",
        subtitle: "Select how you communicate about daily medications and care routines.",
      },
      Hindi: {
        category: "दवा व दैनिक स्वास्थ्य दिनचर्या",
        questionText: "9. \"क्या आपने समय पर दवा ली, या मदद की ज़रूरत है?\"",
        subtitle: "चुनें कि आप दैनिक दवाओं और उपचार के बारे में कैसे जानकारी देते हैं।",
      },
      Hinglish: {
        category: "Medication & Health Routine",
        questionText: "9. \"Time par dawai le li ya help chahiye?\"",
        subtitle: "Select karein aap daily medicines aur healthcare assistance kaise convey karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"Yes, I took it on time with water!\"",
        description: "Clear confirmation of completed routine.",
        traitTag: "Routine Confirmed",
        localized: {
          English: { title: "\"Yes, I took it on time with water!\"", description: "Clear confirmation of completed routine.", traitTag: "Routine Confirmed" },
          Hindi: { title: "\"हाँ, मैंने समय पर पानी के साथ दवा ले ली!\"", description: "दवा लेने की स्पष्ट और समयबद्ध पुष्टि।", traitTag: "दवा पूर्ण" },
          Hinglish: { title: "\"Haan, time par paani ke saath le li dawai!\"", description: "Clear confirmation of routine meds.", traitTag: "Routine Confirmed" }
        }
      },
      {
        id: 2,
        title: "\"Not yet, please bring my pill organizer and water.\"",
        description: "Direct assistance request with supplies.",
        traitTag: "Supply Assistance",
        localized: {
          English: { title: "\"Not yet, please bring my pill organizer and water.\"", description: "Direct assistance request with supplies.", traitTag: "Supply Assistance" },
          Hindi: { title: "\"अभी नहीं, कृपया दवा का बॉक्स और पानी ला दीजिए।\"", description: "सामग्री के साथ सहायता का अनुरोध।", traitTag: "दवा सहायता" },
          Hinglish: { title: "\"Abhi nahi, medicine box aur paani la do please.\"", description: "Direct medicine box and water request.", traitTag: "Medicine Request" }
        }
      },
      {
        id: 3,
        title: "\"Dawai le li hai already, thank you!\"",
        description: "Hinglish medication reassurance.",
        traitTag: "Hinglish Routine",
        localized: {
          English: { title: "\"I already took my medicine, thank you!\"", description: "Courteous confirmation of medicine.", traitTag: "Medicine Taken" },
          Hindi: { title: "\"दवा पहले ही ले ली है, धन्यवाद!\"", description: "दवा पूर्ण होने का शिष्ट संदेश।", traitTag: "दवा पूर्ण" },
          Hinglish: { title: "\"Dawai le li hai already, thank you!\"", description: "Hinglish medication reassurance.", traitTag: "Hinglish Routine" }
        }
      },
      {
        id: 4,
        title: "\"I need to eat a small snack first before taking it.\"",
        description: "Food timing condition for medication.",
        traitTag: "Food Timing",
        localized: {
          English: { title: "\"I need to eat a small snack first before taking it.\"", description: "Food timing condition for medication.", traitTag: "Food Timing" },
          Hindi: { title: "\"दवा लेने से पहले मुझे कुछ हल्का खाना होगा।\"", description: "दवा से पहले भोजन की आवश्यकता।", traitTag: "दवा पूर्व भोजन" },
          Hinglish: { title: "\"Dawai lene se pehle kuch thoda snack khana hai.\"", description: "Food timing condition before meds.", traitTag: "Snack First" }
        }
      },
      {
        id: 5,
        title: "\"Please check with the nurse about the correct dose.\"",
        description: "Caregiver verification and safety check.",
        traitTag: "Safety Verification",
        localized: {
          English: { title: "\"Please check with the nurse about the correct dose.\"", description: "Caregiver verification and safety check.", traitTag: "Safety Verification" },
          Hindi: { title: "\"कृपया सही खुराक के लिए नर्स से पुष्टि कर लें।\"", description: "सुरक्षित खुराक की नर्सिंग जांच।", traitTag: "खुराक पुष्टि" },
          Hinglish: { title: "\"Nurse se correct dose confirm kar lo please.\"", description: "Nurse dosage safety verification.", traitTag: "Safety Verification" }
        }
      },
      {
        id: 6,
        title: "\"Feeling a bit nauseous, can we delay 15 minutes?\"",
        description: "Symptom-related temporary delay.",
        traitTag: "Symptom Delay",
        localized: {
          English: { title: "\"Feeling a bit nauseous, can we delay 15 minutes?\"", description: "Symptom-related temporary delay.", traitTag: "Symptom Delay" },
          Hindi: { title: "\"जी मिचला रहा है, क्या हम 15 मिनट रुक सकते हैं?\"", description: "लक्षण के कारण अस्थायी विलंब।", traitTag: "अस्थायी विलंब" },
          Hinglish: { title: "\"Thoda nauseous lag raha hai, 15 mins ruk sakte hain?\"", description: "Nausea symptom delay request.", traitTag: "Symptom Delay" }
        }
      },
      {
        id: 7,
        title: "\"Which specific medicine is due right now?\"",
        description: "Inquisitive, informed healthcare partner.",
        traitTag: "Informed Partner",
        localized: {
          English: { title: "\"Which specific medicine is due right now?\"", description: "Inquisitive, informed healthcare partner.", traitTag: "Informed Partner" },
          Hindi: { title: "\"अभी कौन सी विशिष्ट दवा का समय है?\"", description: "स्वास्थ्य के प्रति जागरूक और सक्रिय।", traitTag: "दवा की जानकारी" },
          Hinglish: { title: "\"Abhi kaun si medicine ka time hua hai waise?\"", description: "Informed query about scheduled med.", traitTag: "Informed Partner" }
        }
      },
      {
        id: 8,
        title: "\"Could you crush it or mix it with applesauce?\"",
        description: "Swallowing adaptation assistance.",
        traitTag: "Swallow Support",
        localized: {
          English: { title: "\"Could you crush it or mix it with applesauce?\"", description: "Swallowing adaptation assistance.", traitTag: "Swallow Support" },
          Hindi: { title: "\"क्या आप इसे पीसकर या प्यूरी में मिलाकर दे सकते हैं?\"", description: "निगलने में आसानी के लिए दवा पीसने का अनुरोध।", traitTag: "सुगम निगलना" },
          Hinglish: { title: "\"Dawai ko crush karke ya puree mein mix kar do.\"", description: "Swallowing adaptation and crushing request.", traitTag: "Swallow Support" }
        }
      },
      {
        id: 9,
        title: "\"All done for today, feeling stable and comfortable.\"",
        description: "Holistic well-being update.",
        traitTag: "Stable & Comfort",
        localized: {
          English: { title: "\"All done for today, feeling stable and comfortable.\"", description: "Holistic well-being update.", traitTag: "Stable & Comfort" },
          Hindi: { title: "\"आज की सभी दवाएं पूरी हुईं, आराम महसूस हो रहा है।\"", description: "स्वास्थ्य की समग्र सकारात्मक स्थिति।", traitTag: "स्थिर व स्वस्थ" },
          Hinglish: { title: "\"Aaj ka sab ho gaya, feeling comfortable and relaxed.\"", description: "Stable and comfortable routine update.", traitTag: "Stable Routine" }
        }
      },
      {
        id: 10,
        title: "\"Done.\"",
        description: "1-word immediate confirmation.",
        traitTag: "1-Word Done",
        localized: {
          English: { title: "\"Done.\"", description: "1-word immediate confirmation.", traitTag: "1-Word Done" },
          Hindi: { title: "\"हो गया।\"", description: "1-शब्द की त्वरित पुष्टि।", traitTag: "1-शब्द पूर्ण" },
          Hinglish: { title: "\"Done.\"", description: "1-word quick confirmation.", traitTag: "1-Word Done" }
        }
      },
    ]
  },
  {
    id: 10,
    category: "Weekend Plans & Outings",
    questionText: "10. \"Any plans or places you'd like to visit this weekend?\"",
    subtitle: "Select how you express excitement and ideas for future outings and leisure.",
    iconName: "Calendar",
    localized: {
      English: {
        category: "Weekend Plans & Outings",
        questionText: "10. \"Any plans or places you'd like to visit this weekend?\"",
        subtitle: "Select how you express excitement and ideas for future outings and leisure.",
      },
      Hindi: {
        category: "सप्ताहांत की योजनाएं व सैर-सपाटा",
        questionText: "10. \"इस सप्ताहांत कोई योजना या बाहर जाने का विचार है?\"",
        subtitle: "चुनें कि आप सप्ताहांत और मनोरंजन की इच्छाएं कैसे व्यक्त करते हैं।",
      },
      Hinglish: {
        category: "Weekend Plans & Outings",
        questionText: "10. \"Is weekend koi plans ya ghoomne jaane ka mann hai?\"",
        subtitle: "Select karein aap weekend outings aur leisure plans kaise share karte hain.",
      }
    },
    options: [
      {
        id: 1,
        title: "\"I'd love a scenic drive or park visit if weather is good.\"",
        description: "Nature, fresh air, and scenic excursion.",
        traitTag: "Scenic Outing",
        localized: {
          English: { title: "\"I'd love a scenic drive or park visit if weather is good.\"", description: "Nature, fresh air, and scenic excursion.", traitTag: "Scenic Outing" },
          Hindi: { title: "\"मौसम अच्छा हो तो ड्राइव या पार्क जाना पसंद करूँगा।\"", description: "प्रकृति और सुंदर दृश्यों का आनंद।", traitTag: "पार्क / सुंदर सैर" },
          Hinglish: { title: "\"Weather achha raha toh scenic drive ya park chalte hain.\"", description: "Nature and scenic drive outing.", traitTag: "Scenic Outing" }
        }
      },
      {
        id: 2,
        title: "\"Staying cozy at home with family is my top choice.\"",
        description: "Cozy home sanctuary with loved ones.",
        traitTag: "Cozy Home",
        localized: {
          English: { title: "\"Staying cozy at home with family is my top choice.\"", description: "Cozy home sanctuary with loved ones.", traitTag: "Cozy Home" },
          Hindi: { title: "\"परिवार के साथ घर पर सुकून से रहना मेरी पहली पसंद है।\"", description: "घर पर अपनों के साथ शांति।", traitTag: "घर पर विश्राम" },
          Hinglish: { title: "\"Ghar par family ke saath cozy rehna meri first choice hai.\"", description: "Cozy home sanctuary with loved ones.", traitTag: "Cozy Home" }
        }
      },
      {
        id: 3,
        title: "\"Weekend par family get-together plan karte hain!\"",
        description: "Hinglish family celebration plan.",
        traitTag: "Hinglish Gathering",
        localized: {
          English: { title: "\"Let's plan a family get-together this weekend!\"", description: "Social family gathering plan.", traitTag: "Family Gathering" },
          Hindi: { title: "\"सप्ताहांत पर पारिवारिक मिलन समारोह का प्लान बनाते हैं!\"", description: "परिवार के साथ आनंददायक उत्सव।", traitTag: "पारिवारिक मिलन" },
          Hinglish: { title: "\"Weekend par family get-together plan karte hain!\"", description: "Hinglish family celebration plan.", traitTag: "Hinglish Gathering" }
        }
      },
      {
        id: 4,
        title: "\"Let's visit a nearby café or quiet bookstore.\"",
        description: "Low-key community leisure outing.",
        traitTag: "Café Outing",
        localized: {
          English: { title: "\"Let's visit a nearby café or quiet bookstore.\"", description: "Low-key community leisure outing.", traitTag: "Café Outing" },
          Hindi: { title: "\"पास के किसी शांत कैफ़े या किताबों की दुकान चलते हैं।\"", description: "शांत व बौद्धिक भ्रमण।", traitTag: "कैफ़े / पुस्तक भ्रमण" },
          Hinglish: { title: "\"Paas ke kisi quiet café ya bookshop chalte hain.\"", description: "Quiet café or bookstore outing.", traitTag: "Café Outing" }
        }
      },
      {
        id: 5,
        title: "\"I want to watch the big sports match on TV!\"",
        description: "Sports and entertainment enthusiasm.",
        traitTag: "Live Sports",
        localized: {
          English: { title: "\"I want to watch the big sports match on TV!\"", description: "Sports and entertainment enthusiasm.", traitTag: "Live Sports" },
          Hindi: { title: "\"मैं टीवी पर बड़ा मैच देखना चाहता हूँ!\"", description: "खेल और लाइव प्रसारण का रोमांच।", traitTag: "मैच प्रसारण" },
          Hinglish: { title: "\"Weekend ka bada sports match TV par dekhna hai!\"", description: "Sports and entertainment excitement.", traitTag: "Live Sports" }
        }
      },
      {
        id: 6,
        title: "\"No set plans—let's see how my energy is each day.\"",
        description: "Energy-conscious, adaptive flexibility.",
        traitTag: "Adaptive Energy",
        localized: {
          English: { title: "\"No set plans—let's see how my energy is each day.\"", description: "Energy-conscious, adaptive flexibility.", traitTag: "Adaptive Energy" },
          Hindi: { title: "\"कोई पक्की योजना नहीं—देखते हैं ऊर्जा कैसी रहती है।\"", description: "ऊर्जा स्तर के अनुसार सहज निर्णय।", traitTag: "ऊर्जा अनुरूप" },
          Hinglish: { title: "\"Koi fixed plan nahi—energy dekh kar decide karenge.\"", description: "Adaptive flexibility according to daily energy.", traitTag: "Adaptive Energy" }
        }
      },
      {
        id: 7,
        title: "\"A movie marathon with delicious comfort food.\"",
        description: "Relaxed cinema & food entertainment.",
        traitTag: "Movie Marathon",
        localized: {
          English: { title: "\"A movie marathon with delicious comfort food.\"", description: "Relaxed cinema & food entertainment.", traitTag: "Movie Marathon" },
          Hindi: { title: "\"स्वादिष्ट खाने के साथ कई फिल्में देखने का प्लान।\"", description: "घर बैठे फिल्मों और भोजन का आनंद।", traitTag: "मूवी मैराथन" },
          Hinglish: { title: "\"Movie marathon with delicious comfort food!\"", description: "Relaxed movies & comfort food weekend.", traitTag: "Movie Marathon" }
        }
      },
      {
        id: 8,
        title: "\"Can we arrange a video call with relatives far away?\"",
        description: "Long-distance family connection.",
        traitTag: "Virtual Gathering",
        localized: {
          English: { title: "\"Can we arrange a video call with relatives far away?\"", description: "Long-distance family connection.", traitTag: "Virtual Gathering" },
          Hindi: { title: "\"क्या हम दूर रहने वाले रिश्तेदारों से वीडियो कॉल कर सकते हैं?\"", description: "दूरस्थ परिजनों से वीडियो संपर्क।", traitTag: "वर्चुअल मिलन" },
          Hinglish: { title: "\"Door rehne wale relatives ke saath video call karein?\"", description: "Long-distance family video call.", traitTag: "Virtual Family" }
        }
      },
      {
        id: 9,
        title: "\"Please confirm our accessible wheelchair transport first.\"",
        description: "Pragmatic accessibility logistics check.",
        traitTag: "Transport Logistics",
        localized: {
          English: { title: "\"Please confirm our accessible wheelchair transport first.\"", description: "Pragmatic accessibility logistics check.", traitTag: "Transport Logistics" },
          Hindi: { title: "\"कृपया पहले सुलभ व्हीलचेयर वाहन की पुष्टि कर लें।\"", description: "सुलभ यात्रा व सुरक्षा की तैयारी।", traitTag: "सुलभ यात्रा" },
          Hinglish: { title: "\"Pehle wheelchair accessible transport confirm kar lo.\"", description: "Accessible transport logistics check.", traitTag: "Accessible Ride" }
        }
      },
      {
        id: 10,
        title: "\"Relax.\"",
        description: "1-word peaceful leisure statement.",
        traitTag: "1-Word Relax",
        localized: {
          English: { title: "\"Relax.\"", description: "1-word peaceful leisure statement.", traitTag: "1-Word Relax" },
          Hindi: { title: "\"आराम।\"", description: "1-शब्द का शांतिपूर्ण अवकाश संकेत।", traitTag: "1-शब्द विश्राम" },
          Hinglish: { title: "\"Aaram.\"", description: "1-word peaceful relaxation note.", traitTag: "1-Word Relax" }
        }
      },
    ]
  }
];

// Helper to get questions adapted to user profile language
export function getQuestionsForLanguage(language?: 'English' | 'Hindi' | 'Hinglish'): CommunicationQuestion[] {
  const langKey = language || 'English';

  return COMMUNICATION_QUESTIONS_RAW.map((q) => {
    const qLoc = q.localized?.[langKey] || q.localized?.English;
    return {
      ...q,
      category: qLoc?.category || q.category,
      questionText: qLoc?.questionText || q.questionText,
      subtitle: qLoc?.subtitle || q.subtitle,
      options: q.options.map((opt) => {
        const optLoc = opt.localized?.[langKey] || opt.localized?.English;
        return {
          ...opt,
          title: optLoc?.title || opt.title,
          description: optLoc?.description || opt.description,
          traitTag: optLoc?.traitTag || opt.traitTag,
        };
      })
    };
  });
}

// Default export for standard usage
export const COMMUNICATION_QUESTIONS: CommunicationQuestion[] = getQuestionsForLanguage('English');

// Compile multi-selected answers into traits and a readable summary
export function getCompiledTraitsAndSummary(
  answers: Record<number, number[] | number>,
  language?: 'English' | 'Hindi' | 'Hinglish'
): { traits: string[]; summaryText: string; answerCount: number } {
  const questions = getQuestionsForLanguage(language);
  const gatheredTraits: string[] = [];
  const summaryParts: string[] = [];
  let totalSelected = 0;

  questions.forEach((q) => {
    const rawVal = answers[q.id];
    let selectedOptionIds: number[] = [];

    if (Array.isArray(rawVal)) {
      selectedOptionIds = rawVal;
    } else if (typeof rawVal === 'number' && rawVal > 0) {
      selectedOptionIds = [rawVal];
    }

    if (selectedOptionIds.length === 0) return;

    totalSelected += selectedOptionIds.length;

    const selectedOptions = q.options.filter((opt) => selectedOptionIds.includes(opt.id));
    const optionTitles = selectedOptions.map((opt) => opt.title);
    const optionTraits = selectedOptions.map((opt) => opt.traitTag);

    gatheredTraits.push(...optionTraits);

    const categoryShort = q.category.split('/')[0].trim().replace('Daily', '').trim();
    if (optionTraits.length === 1) {
      summaryParts.push(`${categoryShort}: ${optionTraits[0]}`);
    } else if (optionTraits.length > 1) {
      summaryParts.push(`${categoryShort}: [${optionTraits.join(', ')}]`);
    }
  });

  // Deduplicate traits while preserving order
  const uniqueTraits = Array.from(new Set(gatheredTraits));
  const summaryText = summaryParts.join(' • ');

  return {
    traits: uniqueTraits,
    summaryText: summaryText || 'Personalized multi-response communication style profile.',
    answerCount: totalSelected
  };
}
