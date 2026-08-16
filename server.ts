import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const currentFileName = typeof __filename === "string"
  ? __filename
  : typeof import.meta !== "undefined" && import.meta.url
    ? fileURLToPath(import.meta.url)
    : path.join(process.cwd(), "server.ts");
const currentDirName = path.dirname(currentFileName);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy GoogleGenAI client getter
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasElevenLabsKey: !!process.env.ELEVENLABS_API_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
  });
});

// 2. Predict Responses endpoint using Gemini or Groq AI models
app.post("/api/predict-responses", async (req, res) => {
  try {
    const { transcript, userProfile, currentSpeakers, count = 5, aiModelConfig } = req.body;

    const provider = aiModelConfig?.provider || 'gemini';
    const modelId = aiModelConfig?.modelId || 'gemini-3.6-flash';
    const userGroqKey = aiModelConfig?.groqApiKey || (req.headers['x-groq-key'] as string);

    const targetLanguage = userProfile?.language || 'English';

    let languageInstruction = '';
    if (targetLanguage === 'Hindi') {
      languageInstruction = `CRITICAL LANGUAGE REQUIREMENT:
You MUST generate ALL predicted responses, text, tags, and details ENTIRELY in the HINDI language, written strictly in DEVANAGARI SCRIPT (देवनागरी लिपि). Do NOT use Latin/Roman script for Hindi.
Example:
- text: "हाँ, यह बहुत अच्छा विचार है।"
- tag: "उत्तर"
- details: "हाँ, यह बहुत अच्छा विचार है, मुझे यह बहुत पसंद आया।"`;
    } else if (targetLanguage === 'Hinglish') {
      languageInstruction = `CRITICAL LANGUAGE REQUIREMENT:
You MUST generate ALL predicted responses in conversational HINGLISH (Hindi-English mix) written strictly in DEVANAGARI SCRIPT (देवनागरी लिपि). Transliterate common spoken English words into Devanagari alongside Hindi words. Do NOT use Roman/Latin script.
Example:
- text: "हाँ, यह आईडिया एकदम ग्रेट है!"
- tag: "सुझाव"
- details: "हाँ, यह आईडिया एकदम ग्रेट है, चलो अभी ट्राय करते हैं।"`;
    } else {
      languageInstruction = `Language Requirement: Generate responses in clear, natural English.`;
    }

    const profileText = userProfile ? `
Patient Name: ${userProfile.name || 'Alex'}
Target Language: ${targetLanguage}
Condition Context: ALS / Speech impaired.
Caregiver / Listener Context: ${userProfile.caregiverContext || 'Family member or friend'}
Preferred Tone: ${userProfile.tone || 'Warm, natural, direct'}
Key Relationships: ${userProfile.relationships || 'Family, healthcare team'}
${userProfile.communicationStyleSummary ? `Communication Style Profile (10 Daily Life Preferences): ${userProfile.communicationStyleSummary}` : ''}
${userProfile.communicationStyleTraits && userProfile.communicationStyleTraits.length > 0 ? `Active Style Personality Traits: ${userProfile.communicationStyleTraits.join(', ')}` : ''}
` : 'Patient: Alex, ALS patient with clear cognition.';

    const prompt = `You are the AI engine for "Shadow Speak AI", a high-speed AAC (Augmentative and Alternative Communication) system for people living with ALS and speech loss.

Current live conversation context captured via background microphone:
"""
${transcript || "Hey! What would you like to have for dinner tonight?"}
"""

User Profile & Preferences:
${profileText}

${languageInstruction}

Task:
Generate exactly ${count} distinct, natural, human-sounding response options that the user can select with 1 tap or eye-gaze.
Each option must be relevant to the incoming dialogue.

CRITICAL VARIETY & DETAIL REQUIREMENTS:
You MUST include a balanced range of thoughts, INCLUDING AT LEAST ONE EXPLICIT NEGATIVE / DISAGREEMENT / REFUSAL / BOUNDARY THOUGHT so the user has full voice autonomy.
Generate rich, complete, highly expressive sentences.

Include:
1. Direct Affirmation / Positive answer with rationale
2. EXPLICIT NEGATIVE THOUGHT / REFUSAL / DISAGREEMENT (e.g. "No, I disagree and am not comfortable with this", "I don't like this idea", "नहीं, मैं इससे सहमत नहीं हूँ", "ना, मुझे यह बिल्कुल नहीं चाहिए")
3. Alternative / Neutral choice with explanation
4. Gentle question / Follow-up asking for context
5. Discomfort / Rest / Physical Energy request
6. Urgent / Priority action request

Each response MUST have:
- text: A clear, expressive sentence to be spoken (8-14 words, in target language script).
- tag: A short category pill label (under 3 words, in target language script, e.g. "Affirmation", "Negative / Refusal", "Alternative", "Follow-up", "Boundary", "Energy / Rest").
- details: A MANDATORY rich, fully detailed expanded statement providing full context, rationale, or boundary setting (20-35 words, in target language script).`;

    const hasGroqKey = Boolean(userGroqKey || process.env.GROQ_API_KEY);
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

    // 2A. Groq AI Handler
    if (provider === 'groq' || modelId.startsWith('llama') || (!hasGeminiKey && hasGroqKey)) {
      const groqKey = userGroqKey || process.env.GROQ_API_KEY;

      if (!groqKey) {
        console.warn("Groq API Key missing. Checking Gemini key fallback...");
        if (!hasGeminiKey) {
          return res.json({ responses: generateFallbackResponses(transcript, targetLanguage) });
        }
      } else {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: modelId || "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: `You are the AAC prediction engine for "Shadow Speak AI". Output strictly valid JSON object matching this schema:
{
  "responses": [
    { "id": "p1", "text": "Exact short sentence to speak", "tag": "Short Label", "details": "Expanded details" }
  ]
}`
                },
                { role: "user", content: prompt }
              ],
              response_format: { type: "json_object" },
              temperature: 0.6
            })
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const contentStr = groqData.choices?.[0]?.message?.content;
            if (contentStr) {
              const parsed = JSON.parse(contentStr);
              if (parsed.responses && parsed.responses.length > 0) {
                const responsesWithIds = parsed.responses.map((item: any, idx: number) => ({
                  id: item.id || `groq-${Date.now()}-${idx}`,
                  text: item.text,
                  tag: item.tag || "Suggested",
                  details: item.details || item.text,
                }));
                return res.json({ responses: responsesWithIds, providerUsed: 'groq', modelUsed: modelId });
              }
            }
          } else {
            const errBody = await groqRes.text();
            console.error("Groq API error response:", errBody);
          }
        } catch (groqErr) {
          console.error("Groq API call error:", groqErr);
        }
      }
    }

    // 2B. Google Gemini Handler (Default / Fallback)
    const ai = getGeminiClient();

    if (!ai) {
      console.warn("GEMINI_API_KEY missing, using fallback rule-based predictions");
      return res.json({
        responses: generateFallbackResponses(transcript)
      });
    }

    const geminiModel = modelId && modelId.startsWith('gemini') ? modelId : "gemini-3.6-flash";

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  details: { type: Type.STRING },
                },
                required: ["text", "tag"],
              },
            },
          },
          required: ["responses"],
        },
      },
    });

    const jsonText = response.text;
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      const responsesWithIds = (parsed.responses || []).map((item: any, idx: number) => ({
        id: item.id || `opt-${Date.now()}-${idx}`,
        text: item.text,
        tag: item.tag || "Suggested",
        details: item.details || item.text,
      }));
      return res.json({ responses: responsesWithIds, providerUsed: 'gemini', modelUsed: geminiModel });
    }

    throw new Error("No response generated");
  } catch (err: any) {
    console.error("Error generating predictions:", err);
    const fallbackLang = req.body?.userProfile?.language || 'English';
    return res.json({
      responses: generateFallbackResponses(req.body?.transcript, fallbackLang)
    });
  }
});

// 2C. Expand Response / Detailed Options endpoint
app.post("/api/expand-response", async (req, res) => {
  try {
    const { responseText, tag, transcript, userProfile, aiModelConfig } = req.body;
    const targetLanguage = userProfile?.language || 'English';
    const provider = aiModelConfig?.provider || 'gemini';
    const modelId = aiModelConfig?.modelId || 'gemini-3.6-flash';
    const userGroqKey = aiModelConfig?.groqApiKey || (req.headers['x-groq-key'] as string);

    let languageInstruction = '';
    if (targetLanguage === 'Hindi') {
      languageInstruction = 'Generate ALL expanded option texts and labels strictly in HINDI using DEVANAGARI SCRIPT (देवनागरी लिपि).';
    } else if (targetLanguage === 'Hinglish') {
      languageInstruction = 'Generate ALL expanded option texts and labels strictly in HINGLISH using DEVANAGARI SCRIPT (देवनागरी लिपि).';
    } else {
      languageInstruction = 'Generate expanded option texts in natural English.';
    }

    const isNegative = /\b(no|not|don't|dont|disagree|refuse|boundary|stop|unwell|frustrated|hate|never|neither|can't|cannot|won't|wont|bad|skip|pass)\b|नहीं|ना|मना|अस्वीकृति|असहमति|डिसअग्री|रिफ्यूजल/i.test(`${responseText} ${tag}`);
    const isQuestion = /\?|\b(what|how|why|when|where|who|which|could you|can you|repeat|clarify)\b|क्या|कहाँ|कब|कैसे|कौन|बताओ|पूछ|प्रश्न/i.test(`${responseText} ${tag}`);

    let variationsGuideline = '';
    if (isNegative) {
      variationsGuideline = `CRITICAL INTENT CONSTRAINT: The base phrase is a NEGATIVE / REFUSAL / DISAGREEMENT response.
ALL 6 generated option variations MUST BE NEGATIVE OR REFUSAL OR SET FIRM BOUNDARIES (do NOT generate positive affirmations):
1. "Direct & Firm Refusal": Direct, unequivocal refusal stating clearly that you do not agree (20-30 words).
2. "Polite & Respectful Decline": Courteous, soft refusal thanking them but firmly saying no (20-30 words).
3. "Personal Boundary & Comfort": Stating personal comfort limits, discomfort, and boundary (20-30 words).
4. "Firm Decisive Disagreement": Clear reasoning on why this option will not work for you (20-30 words).
5. "Quiet Space & Stop Request": Asking politely to drop or pause the topic right now (20-30 words).
6. "Alternative Preference": Saying no to this while proposing a completely different alternative (20-30 words).`;
    } else if (isQuestion) {
      variationsGuideline = `CRITICAL INTENT CONSTRAINT: The base phrase is a QUESTION / CLARIFICATION / INQUIRY response.
ALL 6 generated option variations MUST BE QUESTIONS OR INQUIRIES matching this intent:
1. "Detailed Inquiry": Asking for specific comprehensive details and context (20-30 words).
2. "Collaborative Question": Asking for the other person's input, thoughts, and advice (20-30 words).
3. "Contextual Clarification": Requesting clarification on timing, logistics, or specifics (20-30 words).
4. "Polite Follow-up": Courteously asking them to elaborate or repeat key aspects (20-30 words).
5. "Decision-Making Query": Asking what the best options and tradeoffs are (20-30 words).
6. "Concise Summary Question": Asking for a quick high-level summary (15-25 words).`;
    } else {
      variationsGuideline = `CRITICAL INTENT CONSTRAINT: The base phrase is a POSITIVE / AFFIRMATIVE / AGREEMENT response.
ALL 6 generated option variations MUST BE POSITIVE AFFIRMATIONS matching this intent (do NOT generate refusals):
1. "Elaborate & Warm Affirmation": Deeply warm, appreciative sentence explaining why and adding positive context (20-30 words).
2. "Enthusiastic Full Agreement": Highly energized, eager affirmation expressing full readiness (20-30 words).
3. "Collaborative Plan & Agreement": Agreement paired with collaborative next steps (20-30 words).
4. "Heartfelt Appreciation": Warmly thanking the person and confirming positive choice (20-30 words).
5. "Direct Joyful Confirmation": Clear, confident affirmation with reassurance (20-30 words).
6. "Peaceful & Reassured Choice": Confirming positive satisfaction with peace of mind (20-30 words).`;
    }

    const expandPrompt = `You are an AAC response expansion engine for a speech-impaired user who needs full voice autonomy and deep expressiveness.
Base phrase: "${responseText}" (Tag: ${tag || 'General'})
Current conversation context: "${transcript || 'General conversation'}"
${languageInstruction}

${variationsGuideline}

Return strictly valid JSON format:
{
  "options": [
    { "label": "Option Title 1", "text": "Rich detailed sentence matching the exact intent...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Option Title 2", "text": "Rich detailed sentence matching the exact intent...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Option Title 3", "text": "Rich detailed sentence matching the exact intent...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Option Title 4", "text": "Rich detailed sentence matching the exact intent...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Option Title 5", "text": "Rich detailed sentence matching the exact intent...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Option Title 6", "text": "Rich detailed sentence matching the exact intent...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" }
  ]
}`;

    const hasGroqKey = Boolean(userGroqKey || process.env.GROQ_API_KEY);
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

    // Groq Expansion
    if (provider === 'groq' || modelId.startsWith('llama') || (!hasGeminiKey && hasGroqKey)) {
      const groqKey = userGroqKey || process.env.GROQ_API_KEY;
      if (groqKey) {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: modelId || "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: expandPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.7
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (parsed.options) {
            return res.json({ options: parsed.options });
          }
        }
      }
    }

    // Gemini Expansion
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: modelId.startsWith('gemini') ? modelId : "gemini-3.6-flash",
        contents: expandPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.options) {
          return res.json({ options: parsed.options });
        }
      }
    }

    // Fallback options if AI key not configured
    return res.json({
      options: generateFallbackExpandedOptions(responseText, targetLanguage)
    });
  } catch (err) {
    console.error("Error generating expanded options:", err);
    return res.json({
      options: generateFallbackExpandedOptions(req.body?.responseText, req.body?.userProfile?.language)
    });
  }
});

function generateFallbackExpandedOptions(responseText: string = '', lang: string = 'English') {
  if (lang === 'Hindi') {
    return [
      { label: 'विस्तृत एवं सौम्य (Warm Context)', text: `${responseText} मुझे लगता है कि यह बहुत अच्छा विकल्प रहेगा और हम सब मिलकर इसका आनंद ले सकते हैं।`, tone: 'warm' },
      { label: 'स्पष्ट असहमति / अस्वीकृति (Negative Refusal)', text: `नहीं, मैं इस बात से बिल्कुल सहमत नहीं हूँ। मुझे यह विचार पसंद नहीं आया और मैं ऐसा नहीं करना चाहूँगा।`, tone: 'negative' },
      { label: 'विनम्र एवं औपचारिक (Polite Alternative)', text: `धन्यवाद मुझे बताने के लिए, परंतु मैं इस समय किसी अन्य विकल्प को प्राथमिकता देना चाहूँगा।`, tone: 'polite' },
      { label: 'आगे की चर्चा / प्रश्न (Follow-up Question)', text: `${responseText} क्या आप इसके बारे में थोड़ा और विस्तार से समझा सकते हैं ताकि हम तय कर सकें?`, tone: 'question' },
      { label: 'शारीरिक स्थिति एवं आराम (Energy & Comfort Context)', text: `${responseText} मेरी ऊर्जा अभी थोड़ी कम है, इसलिए मुझे थोड़ा विश्राम और शांति चाहिए।`, tone: 'standard' },
      { label: 'तत्काल प्राथमिकता (Urgent Action)', text: `कृपया इस पर तुरंत ध्यान दें, यह मेरे लिए बहुत महत्वपूर्ण और आवश्यक है।`, tone: 'standard' },
    ];
  }

  if (lang === 'Hinglish') {
    return [
      { label: 'इलाबोरेट & वार्म (Warm Context)', text: `${responseText} आई थिंक यह आईडिया एकदम बेस्ट रहेगा और हम सब एन्जॉय करेंगे।`, tone: 'warm' },
      { label: 'स्पष्ट असहमति / रिफ्यूजल (Negative Refusal)', text: `नो, मैं इसके साथ बिल्कुल कम्फर्टेबल नहीं हूँ। मुझे यह आईडिया पसंद नहीं आया और मैं मना करता हूँ।`, tone: 'negative' },
      { label: 'पोलाइट & फॉर्मल (Polite Alternative)', text: `थैंक यू सो मच बताने के लिए, पर मैं प्रेफर करूँगा कि हम कोई दूसरा ऑप्शन ट्राय करें।`, tone: 'polite' },
      { label: 'फॉलो-अप क्वेश्चन (Follow-up Question)', text: `${responseText} क्या तुम मुझे इसके बारे में थोड़ा और डिटेल्स बता सकते हो ताकि हम साथ मिलकर फैसला लें?`, tone: 'question' },
      { label: 'एनर्जी & रेस्ट कांटेक्स्ट (Energy & Rest Context)', text: `${responseText} मेरी ऊर्जा अभी थोड़ी कम है, सो मुझे थोड़ा आराम करने की ज़रूरत है।`, tone: 'standard' },
      { label: 'अर्जेंट प्रायोरिटी (Urgent Action)', text: `प्लीज़ इस पर तुरंत ध्यान दो, यह मेरे लिए बहुत इम्पोर्टेन्ट है।`, tone: 'standard' },
    ];
  }

  return [
    { label: 'Elaborate & Warm (Warm Context)', text: `${responseText} I feel this is the best path forward, and I really appreciate you including me in this decision.`, tone: 'warm' },
    { label: 'Firm Boundary & Disagreement (Negative Refusal)', text: `No, I disagree and I am not comfortable with this. I'd strongly prefer we do not proceed with this option.`, tone: 'negative' },
    { label: 'Polite & Formal Alternative', text: `Thank you for suggesting that, but I respectfully prefer an alternative option at this moment.`, tone: 'polite' },
    { label: 'Conversational Follow-up Question', text: `${responseText} Could you share a few more details so we can discuss it thoroughly together?`, tone: 'question' },
    { label: 'Physical & Energy State Explanation', text: `${responseText} My energy is a bit low right now, so I need to rest and take things gently.`, tone: 'standard' },
    { label: 'Urgent & Priority Request', text: `Please attend to this as soon as possible, as it is very important and urgent for me.`, tone: 'standard' },
  ];
}

// Fallback smart response generator if AI API isn't provided or fails
function generateFallbackResponses(transcript?: string, lang: string = 'English') {
  if (lang === 'Hindi') {
    return [
      { id: "fb-hi-1", text: "हाँ, यह मुझे बहुत पसंद है!", tag: "स्वीकृति", details: "हाँ, यह मुझे बहुत पसंद है। चलिए यही करते हैं।" },
      { id: "fb-hi-2", text: "नहीं, मुझे यह पसंद नहीं आया।", tag: "अस्वीकृति / असहमति", details: "नहीं, मैं इससे सहमत नहीं हूँ। मुझे यह विचार पसंद नहीं आया।" },
      { id: "fb-hi-3", text: "मुझे थोड़ा आराम चाहिए।", tag: "निवेदन", details: "मुझे थोड़ा आराम चाहिए, हम बाद में बात करेंगे।" },
      { id: "fb-hi-4", text: "धन्यवाद, मुझे बताने के लिए।", tag: "आभार", details: "धन्यवाद, मुझे बताने के लिए। मैं समझ गया।" },
      { id: "fb-hi-5", text: "क्या आप फिर से दोहरा सकते हैं?", tag: "प्रश्न", details: "क्या आप फिर से दोहरा सकते हैं? मुझे ठीक से सुनाई नहीं दिया।" }
    ];
  }

  if (lang === 'Hinglish') {
    return [
      { id: "fb-hg-1", text: "हाँ, यह आईडिया बिल्कुल परफेक्ट है!", tag: "अग्री", details: "हाँ, यह आईडिया बिल्कुल परफेक्ट है, चलो प्लान बनाते हैं।" },
      { id: "fb-hg-2", text: "नो, मुझे यह आईडिया पसंद नहीं है।", tag: "रिफ्यूजल / डिसअग्री", details: "नो, मैं इसके साथ कम्फर्टेबल नहीं हूँ। चलो कुछ और ट्राय करते हैं।" },
      { id: "fb-hg-3", text: "मैं थोड़ा बिज़ी हूँ, थोड़ी देर में बात करते हैं।", tag: "पॉज़", details: "मैं थोड़ा बिज़ी हूँ, थोड़ी देर में आराम से बात करते हैं।" },
      { id: "fb-hg-4", text: "थैंक यू सो मच बताने के लिए!", tag: "थैंक्स", details: "थैंक यू सो मच बताने के लिए, आई रियली अप्रिशिएट इट।" },
      { id: "fb-hg-5", text: "क्या आप प्लीज़ रिपीट कर सकते हैं?", tag: "क्वेश्चन", details: "क्या आप प्लीज़ रिपीट कर सकते हैं? लास्ट पार्ट समझ नहीं आया।" }
    ];
  }

  const lower = (transcript || "").toLowerCase();

  if (lower.includes("pizza") || lower.includes("pasta") || lower.includes("dinner") || lower.includes("food") || lower.includes("eat")) {
    return [
      { id: "fb-1", text: "Pizza sounds great!", tag: "Direct Answer", details: "Pizza sounds great! I'd love a slice of pepperoni or cheese." },
      { id: "fb-2", text: "No, I don't feel like eating pizza or pasta.", tag: "Negative / Refusal", details: "No, I don't feel like eating pizza or pasta tonight. Let's get something lighter like soup." },
      { id: "fb-3", text: "I'd prefer pasta today.", tag: "Alternative", details: "I'd prefer pasta today with a fresh salad on the side." },
      { id: "fb-4", text: "I'm not very hungry right now.", tag: "Statement", details: "I'm not very hungry right now, maybe just a warm soup or drink later." },
      { id: "fb-5", text: "What are you having?", tag: "Follow-up", details: "What are you having? Surprise me with your favorite choice!" }
    ];
  }

  if (lower.includes("how are you") || lower.includes("feeling") || lower.includes("today")) {
    return [
      { id: "fb-1", text: "I'm feeling good today, thank you!", tag: "Positive", details: "I'm feeling good today, thank you for checking in on me." },
      { id: "fb-2", text: "I'm actually feeling quite frustrated and unwell today.", tag: "Negative Thought", details: "I'm actually feeling quite frustrated and unwell today. I need some quiet time." },
      { id: "fb-3", text: "A bit tired, but hanging in there.", tag: "Honest", details: "A bit tired, but hanging in there and happy to chat." },
      { id: "fb-4", text: "Ready for a peaceful day.", tag: "Calm", details: "Ready for a peaceful day with family and friends." },
      { id: "fb-5", text: "How are you doing today?", tag: "Question", details: "How are you doing today? Tell me how your day is going." }
    ];
  }

  return [
    { id: "fb-1", text: "Yes, that sounds good to me.", tag: "Affirmation", details: "Yes, that sounds good to me. Let's go ahead with that plan." },
    { id: "fb-2", text: "No, I disagree and don't want to do that.", tag: "Negative / Boundary", details: "No, I disagree and I'm not comfortable doing that right now." },
    { id: "fb-3", text: "Could we talk about that in a moment?", tag: "Pause", details: "Could we talk about that in a moment? I just need a quick rest." },
    { id: "fb-4", text: "Thank you for letting me know.", tag: "Gratitude", details: "Thank you for letting me know. I really appreciate it!" },
    { id: "fb-5", text: "Can you repeat that for me?", tag: "Clarification", details: "Can you repeat that for me? I didn't quite catch the last part." }
  ];
}

// 3. ElevenLabs Voices proxy
app.post("/api/elevenlabs/voices", async (req, res) => {
  try {
    const apiKey = req.headers['x-elevenlabs-key'] as string || req.body?.apiKey || process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "ElevenLabs API Key required" });
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText || "Failed to fetch ElevenLabs voices" });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("ElevenLabs voices fetch error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// 4. ElevenLabs TTS Proxy
app.post("/api/elevenlabs/tts", async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const apiKey = req.headers['x-elevenlabs-key'] as string || req.body?.apiKey || process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "ElevenLabs API key is required" });
    }

    if (!text) {
      return res.status(400).json({ error: "Text parameter is required" });
    }

    const targetVoiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Default Rachel or custom cloned voice

    const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // Fast low-latency model ideal for AAC
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.1,
          use_speaker_boost: true
        }
      })
    });

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      console.error("ElevenLabs TTS error response:", errorText);
      return res.status(elevenRes.status).json({ error: errorText || "ElevenLabs TTS request failed" });
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength.toString());
    return res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    console.error("ElevenLabs TTS handler error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(currentDirName, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shadow Speak AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
