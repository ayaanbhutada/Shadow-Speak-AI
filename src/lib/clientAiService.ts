import { AIModelConfig, UserProfile, PredictedResponse, TranscriptEntry } from '../types';

export function shouldBypassServer(aiModelConfig?: AIModelConfig): boolean {
  if (!aiModelConfig) return false;
  if (aiModelConfig.provider === 'gemini' && aiModelConfig.geminiApiKey) {
    return true;
  }
  if (aiModelConfig.provider === 'groq' && aiModelConfig.groqApiKey) {
    return true;
  }
  return false;
}

function mapGeminiModel(modelId: string): string {
  if (modelId === 'gemini-3.6-flash') {
    return 'gemini-2.5-flash';
  }
  return modelId || 'gemini-2.5-flash';
}

export function extractJsonFromText(rawText: string): any {
  if (!rawText || !rawText.trim()) throw new Error('Empty response from AI engine');

  // 1. Strip reasoning blocks like <think>...</think> (common in DeepSeek R1 / Qwen reasoning models on Groq)
  let text = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Extract content from markdown code fences if wrapped
  if (text.includes('```')) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      text = match[1].trim();
    } else {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
    }
  }

  // 3. Attempt direct JSON parsing
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // 4. Find the outermost JSON object { ... } or array [ ... ]
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        // Fix common trailing comma before closing braces or brackets & strip non-printable characters
        const fixed = candidate
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
        return JSON.parse(fixed);
      }
    }

    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      const candidate = text.substring(firstBracket, lastBracket + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        const fixed = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(fixed);
      }
    }

    throw new Error(`Failed to extract valid JSON from AI response: ${initialErr instanceof Error ? initialErr.message : String(initialErr)}`);
  }
}

async function callGroqWithAutoFallback(
  groqKey: string,
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number = 0.6
): Promise<any> {
  const model = modelId || 'llama-3.3-70b-versatile';
  const isReasoning = model.toLowerCase().includes('deepseek') || model.toLowerCase().includes('r1') || model.toLowerCase().includes('qwen') || model.toLowerCase().includes('gpt-oss');

  const requestPayload: any = {
    model,
    messages,
    temperature,
    max_tokens: 2048,
  };

  // Only pass response_format if not a reasoning model
  if (!isReasoning) {
    requestPayload.response_format = { type: 'json_object' };
  } else {
    requestPayload.reasoning_format = 'hidden';
    if (model.toLowerCase().includes('gpt-oss')) {
      requestPayload.reasoning_effort = 'low';
    } else if (model.toLowerCase().includes('qwen3')) {
      requestPayload.reasoning_effort = 'none';
    }
  }

  console.log('[Groq request]', requestPayload);

  let res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  // If 400 error (such as json_validate_failed), automatically retry cleanly without response_format constraint
  if (!res.ok && res.status === 400 && requestPayload.response_format) {
    console.warn('Groq json_object validation rejected, automatically retrying without strict json_object constraint...');
    delete requestPayload.response_format;
    console.log('[Groq retry request]', requestPayload);
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error('[Groq error response]', errText);
    throw new Error(`Groq API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  console.log('[Groq response]', data);
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('Groq returned empty completion content.');
  }

  return extractJsonFromText(rawContent);
}

function cleanJsonString(contentStr: string): string {
  let cleaned = contentStr.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

export async function predictResponsesDirectly(
  transcript: string,
  userProfile: UserProfile | null,
  count: number = 4,
  aiModelConfig: AIModelConfig,
  conversationHistory?: TranscriptEntry[]
): Promise<{ responses: PredictedResponse[]; providerUsed: string; modelUsed: string }> {
  const provider = aiModelConfig.provider;
  const modelId = aiModelConfig.modelId;
  const targetLanguage = userProfile?.language || 'English';

  const profileText = userProfile
    ? `
Patient Name: ${userProfile.name || 'Alex'}
Target Language: ${targetLanguage}
Condition Context: ALS / Speech impaired.
Caregiver / Listener Context: ${userProfile.caregiverContext || 'Family member or friend'}
Preferred Tone: ${userProfile.tone || 'Warm & Natural'}
Key Relationships: ${userProfile.relationships || 'Family, healthcare providers, friends'}
${userProfile.conditionNotes ? `Condition Notes: ${userProfile.conditionNotes}` : ''}
${userProfile.communicationStyleSummary ? `Communication Style Profile: ${userProfile.communicationStyleSummary}` : ''}
${userProfile.communicationStyleTraits && userProfile.communicationStyleTraits.length > 0 ? `Communication Style Traits: ${userProfile.communicationStyleTraits.join(', ')}` : ''}
`
    : `
Patient Name: Alex
Target Language: English
Condition Context: ALS / Speech impaired.
Caregiver / Listener Context: Family member or friend
Preferred Tone: Warm & Natural
Key Relationships: Family, healthcare providers, friends`;

  const historyText = Array.isArray(conversationHistory) && conversationHistory.length > 0
    ? conversationHistory.slice(-4).map((entry) => {
        return `- [${entry.timestamp || 'Recent'}] "${entry.text}"`;
      }).join('\n')
    : '';

  const prompt = `Context:
User Profile & Preferences:
${profileText}

Memory:
${historyText || '- None'}

Latest input: "${transcript || 'Do you want some water?'}"

${targetLanguage === 'Hindi'
  ? 'Language Requirement: Generate responses in Hindi using Devanagari script.'
  : targetLanguage === 'Hinglish'
    ? 'Language Requirement: Generate conversational Hinglish using Devanagari script.'
    : 'Language Requirement: Generate responses in clear, natural English.'}

Task:
Generate exactly ${count} distinct, natural, human-sounding response options that the user can select with 1 tap or eye-gaze.
Each option must be deeply relevant to the incoming dialogue and contextually aware of the recent conversation memory above.

Requirements:
1. Include at least 1 explicit negative/refusal.
2. Mix Affirmation, Refusal, Alternative, Question, and Energy/Rest where relevant.
3. Each text must be 8-14 words; each tag must be under 3 words.
4. Do not generate details in this call. Details are fetched separately when the user opens a response.

Return only valid JSON: {"responses":[{"id":"p1","text":"...","tag":"..."}]}`;

  try {
    if (provider === 'groq') {
      const groqKey = aiModelConfig.groqApiKey;
      if (!groqKey) {
        throw new Error('Groq API Key is missing in configuration.');
      }

      const systemMsg = `You are the AAC prediction engine for "Shadow Speak AI". You must respond with a valid JSON object matching this schema:
{
  "responses": [
    { "id": "p1", "text": "Exact short sentence to speak (8-14 words)", "tag": "Short Label" }
  ]
}`;

      const userMsg = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object with the "responses" array.`;

      const parsed = await callGroqWithAutoFallback(
        groqKey,
        modelId,
        [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg },
        ],
        0.6
      );

      if (parsed.responses && Array.isArray(parsed.responses) && parsed.responses.length > 0) {
        const responsesWithIds = parsed.responses.map((item: any, idx: number) => ({
          id: item.id || `groq-${Date.now()}-${idx}`,
          text: item.text,
          tag: item.tag || 'Suggested',
        }));
        return { responses: responsesWithIds, providerUsed: 'groq', modelUsed: modelId };
      }
      throw new Error('Invalid response structure received from Groq.');
    } else {
      // Google Gemini client-side REST call
      const apiKey = aiModelConfig.geminiApiKey;
      if (!apiKey) {
        throw new Error('Gemini API Key is missing in configuration.');
      }

      const geminiModel = mapGeminiModel(modelId);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  responses: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        id: { type: 'STRING' },
                        text: { type: 'STRING' },
                        tag: { type: 'STRING' },
                      },
                      required: ['text', 'tag'],
                    },
                  },
                },
                required: ['responses'],
              },
            },
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const contentStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (contentStr) {
        const parsed = JSON.parse(cleanJsonString(contentStr));
        if (parsed.responses && parsed.responses.length > 0) {
          const responsesWithIds = parsed.responses.map((item: any, idx: number) => ({
            id: item.id || `opt-${Date.now()}-${idx}`,
            text: item.text,
            tag: item.tag || 'Suggested',
          }));
          return { responses: responsesWithIds, providerUsed: 'gemini', modelUsed: geminiModel };
        }
      }
      throw new Error('Invalid response structure received from Gemini.');
    }
  } catch (err: any) {
    console.error('Direct AI Call failed, using local rule-based fallback:', err);
    return {
      responses: generateFallbackResponses(transcript, targetLanguage),
      providerUsed: 'local-fallback',
      modelUsed: 'rule-based',
    };
  }
}

export async function expandResponseDirectly(
  responseText: string,
  tag: string,
  transcript: string,
  userProfile: UserProfile | null,
  aiModelConfig: AIModelConfig
): Promise<{ options: any[] }> {
  const provider = aiModelConfig.provider;
  const modelId = aiModelConfig.modelId;
  const targetLanguage = userProfile?.language || 'English';

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

  const profileText = userProfile ? `
Patient Name: ${userProfile.name || 'Alex'}
Target Language: ${targetLanguage}
Tone: ${userProfile.tone || 'Warm, natural'}
${userProfile.communicationStyleSummary ? `Communication Style Profile: ${userProfile.communicationStyleSummary}` : ''}
${userProfile.communicationStyleTraits && userProfile.communicationStyleTraits.length > 0 ? `Style Personality Traits: ${userProfile.communicationStyleTraits.join(', ')}` : ''}
` : 'Patient: Alex, ALS patient with clear cognition.';

  const expandPrompt = `You are the AAC response expansion engine for "Shadow Speak AI", empowering a person with ALS/speech impairment to communicate with speed, depth, and full autonomy.

CONVERSATION CONTEXT (Question or incoming dialogue from listener):
"${transcript || 'General conversation'}"

TOP-LEVEL OPTION SELECTED BY USER:
"${responseText}" (Tag / Intent: ${tag || 'Selected Option'})

USER PROFILE & PREFERENCES:
${profileText}

${languageInstruction}

CRITICAL TASK:
The user selected the specific top-level response: "${responseText}" in response to the question: "${transcript}".
Generate 4 distinct, rich, detailed, human-sounding expanded response variations that ALL specifically elaborate on this EXACT chosen option ("${responseText}") in direct reply to the incoming dialogue context ("${transcript}").

STRICT INTENT & TOPIC PRESERVATION RULES:
1. SAME INTENT & SPECIFIC TOPIC: Every single variation MUST strictly preserve the exact choice, stance, subject matter, and intent of the selected option ("${responseText}").
   - If the selected option chooses a specific alternative (e.g. "I'd prefer pasta today" or "Pizza sounds great!"), ALL 4 variations must talk about that specific choice with rich context, reasons, or details.
   - If the selected option is a refusal, disagreement, or boundary (e.g. "No, I don't feel like that"), ALL 4 variations MUST express refusal or disagreement with different styles (e.g. direct refusal, polite decline, personal boundary, alternative proposal).
   - If the selected option is a question or inquiry (e.g. "What are you having?"), ALL 4 variations MUST ask relevant questions or request details on this exact topic.
   - If the selected option is about fatigue or rest, ALL 4 variations MUST express that physical need or comfort adjustment.
   - If the selected option is an agreement/affirmation, ALL 4 variations MUST elaborate on that agreement with warmth, enthusiasm, or logistical follow-up.
2. RICH DETAILS: Each variation should be 12-25 words (in the target language script), complete, highly articulate, and expressive.
3. DISTINCT LABELS: Provide a concise descriptive label (2-4 words) for each variation (e.g., "Elaborate & Warm", "Direct & Clear", "Polite & Respectful", "Collaborative Next Step").

Return strictly valid JSON format:
{
  "options": [
    { "label": "Descriptive Label 1", "text": "Detailed sentence elaborating on the exact choice...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Descriptive Label 2", "text": "Detailed sentence elaborating on the exact choice...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Descriptive Label 3", "text": "Detailed sentence elaborating on the exact choice...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" },
    { "label": "Descriptive Label 4", "text": "Detailed sentence elaborating on the exact choice...", "tone": "${isNegative ? 'negative' : isQuestion ? 'question' : 'warm'}" }
  ]
}`;

  try {
    if (provider === 'groq') {
      const groqKey = aiModelConfig.groqApiKey;
      if (!groqKey) {
        throw new Error('Groq API Key is missing.');
      }

      const systemMsg = `You are the AAC response expansion engine for "Shadow Speak AI". You must respond with a valid JSON object matching this schema:
{
  "options": [
    { "label": "Descriptive Label", "text": "Detailed sentence elaborating on choice...", "tone": "warm" }
  ]
}`;

      const userMsg = `${expandPrompt}\n\nIMPORTANT: Return ONLY a valid JSON object with the "options" array containing 4 detailed choices.`;

      const parsed = await callGroqWithAutoFallback(
        groqKey,
        modelId,
        [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg },
        ],
        0.7
      );

      if (parsed.options && Array.isArray(parsed.options) && parsed.options.length > 0) {
        return { options: parsed.options };
      }
      throw new Error('Invalid options structure received from Groq.');
    } else {
      const apiKey = aiModelConfig.geminiApiKey;
      if (!apiKey) {
        throw new Error('Gemini API Key is missing.');
      }

      const geminiModel = mapGeminiModel(modelId);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: expandPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  options: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        label: { type: 'STRING' },
                        text: { type: 'STRING' },
                        tone: { type: 'STRING' },
                      },
                      required: ['label', 'text'],
                    },
                  },
                },
                required: ['options'],
              },
            },
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const contentStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (contentStr) {
        const parsed = JSON.parse(cleanJsonString(contentStr));
        if (parsed.options && Array.isArray(parsed.options) && parsed.options.length > 0) {
          return { options: parsed.options };
        }
      }
      throw new Error('Invalid options structure received from Gemini.');
    }
  } catch (err: any) {
    console.error('Direct AI expansion failed, using local fallback:', err);
    return {
      options: generateFallbackExpandedOptions(responseText, transcript, targetLanguage, tag),
    };
  }
}

function generateFallbackExpandedOptions(responseText: string = '', transcript: string = '', lang: string = 'English', tag: string = '') {
  const isNegative = /\b(no|not|don't|dont|disagree|refuse|boundary|stop|unwell|frustrated|hate|never|neither|can't|cannot|won't|wont|bad|skip|pass)\b|नहीं|ना|मना|अस्वीकृति|असहमति|डिसअग्री|रिफ्यूजल/i.test(`${responseText} ${tag}`);
  const isQuestion = /\?|\b(what|how|why|when|where|who|which|could you|can you|repeat|clarify)\b|क्या|कहाँ|कब|कैसे|कौन|बताओ|पूछ|प्रश्न/i.test(`${responseText} ${tag}`);

  if (isNegative) {
    if (lang === 'Hindi') {
      return [
        { label: 'स्पष्ट अस्वीकृति (Direct Refusal)', text: `${responseText} मैं इससे बिल्कुल सहमत नहीं हूँ और ऐसा नहीं करना चाहूँगा।`, tone: 'negative' },
        { label: 'विनम्र अस्वीकृति (Polite Decline)', text: `${responseText} पूछने के लिए धन्यवाद, परंतु मैं विनम्रतापूर्वक मना करता हूँ।`, tone: 'negative' },
        { label: 'व्यक्तिगत सीमा (Personal Boundary)', text: `${responseText} मैं इसके साथ सहज महसूस नहीं कर रहा हूँ, कृपया इसे रहने दें।`, tone: 'negative' },
        { label: 'दृढ़ निर्णय (Firm Choice)', text: `${responseText} यह विकल्प मेरे लिए सही नहीं है, कृपया इसे न करें।`, tone: 'negative' }
      ];
    }
    if (lang === 'Hinglish') {
      return [
        { label: 'डायरेक्ट रिफ्यूजल (Direct Refusal)', text: `${responseText} मैं इसके साथ बिल्कुल कम्फर्टेबल नहीं हूँ और मना करता हूँ।`, tone: 'negative' },
        { label: 'पोलाइट रिफ्यूजल (Polite Decline)', text: `${responseText} थैंक यू पूछने के लिए, पर मैं पोलाइटली मना करूँगा।`, tone: 'negative' },
        { label: 'फर्म बाउंड्री (Firm Boundary)', text: `${responseText} यह मेरे लिए वर्क नहीं करेगा, सो प्लीज़ इसे यहीं ड्रॉप कर दो।`, tone: 'negative' },
        { label: 'क्लियर डिसअग्री (Clear Disagreement)', text: `${responseText} मेरा बिल्कुल मूड नहीं है और मैं डिसअग्री करता हूँ।`, tone: 'negative' }
      ];
    }
    return [
      { label: 'Direct & Firm Refusal', text: `${responseText} I disagree with this option and strongly prefer we do not proceed.`, tone: 'negative' },
      { label: 'Polite & Respectful Decline', text: `${responseText} Thank you for asking, but I respectfully decline this choice today.`, tone: 'negative' },
      { label: 'Personal Boundary & Comfort', text: `${responseText} That really does not feel right or comfortable for me right now.`, tone: 'negative' },
      { label: 'Firm Decisive Disagreement', text: `${responseText} That is not going to work for me and I am firm on my decision.`, tone: 'negative' }
    ];
  }

  if (isQuestion) {
    if (lang === 'Hindi') {
      return [
        { label: 'विस्तृत प्रश्न (Detailed Inquiry)', text: `${responseText} क्या आप इसके बारे में थोड़ा और विस्तार से समझा सकते हैं?`, tone: 'question' },
        { label: 'सहयोगात्मक राय (Collaborative Input)', text: `${responseText} आपकी व्यक्तिगत पसंद या सलाह क्या है, मुझे भी बताएं।`, tone: 'question' },
        { label: 'समय व योजना (Logistics Question)', text: `${responseText} इसमें कितना समय लगेगा और हमारी क्या योजना है?`, tone: 'question' },
        { label: 'स्पष्टीकरण निवेदन (Clarification)', text: `${responseText} कृपया थोड़ा और स्पष्ट करें ताकि हम सही फैसला लें।`, tone: 'question' }
      ];
    }
    if (lang === 'Hinglish') {
      return [
        { label: 'डिटेल्ड क्वेश्चन (Detailed Inquiry)', text: `${responseText} क्या तुम मुझे इसके बारे में थोड़ा और डिटेल्स बता सकते हो?`, tone: 'question' },
        { label: 'कोलैबोरेटिव क्वेश्चन (Collaborative Input)', text: `${responseText} तुम्हारा क्या पर्सनल ओपिनियन है, मुझे भी बताओ।`, tone: 'question' },
        { label: 'टाइम & प्लानिंग (Logistics)', text: `${responseText} इसमें कितना टाइम लगेगा और क्या प्लान है?`, tone: 'question' },
        { label: 'क्लैरिफिकेशन (Clarification)', text: `${responseText} प्लीज़ थोड़ा और डिटेल में बताओ ताकि सब क्लियर हो जाए।`, tone: 'question' }
      ];
    }
    return [
      { label: 'Detailed Inquiry', text: `${responseText} Could you share a few more details so we can discuss it thoroughly?`, tone: 'question' },
      { label: 'Collaborative Question', text: `${responseText} I would love to hear your thoughts and recommendation on this as well.`, tone: 'question' },
      { label: 'Timing & Logistics', text: `${responseText} What is the timeline and what are the exact steps we would take?`, tone: 'question' },
      { label: 'Contextual Clarification', text: `${responseText} Please give me a little more context so we make the best decision.`, tone: 'question' }
    ];
  }

  // General / Affirmative / Alternative / Preference
  if (lang === 'Hindi') {
    return [
      { label: 'विस्तृत एवं सौम्य (Detailed & Warm)', text: `${responseText} मुझे लगता है कि यह बहुत अच्छा विकल्प रहेगा और हम सब इसका आनंद ले सकते हैं।`, tone: 'warm' },
      { label: 'उत्साही सहमति (Enthusiastic)', text: `${responseText} यह विचार मुझे बहुत पसंद आया और मैं इसके लिए पूरी तरह तैयार हूँ।`, tone: 'warm' },
      { label: 'सहयोगात्मक योजना (Collaborative)', text: `${responseText} चलिए इसी योजना पर आगे बढ़ते हैं, यही सबसे उत्तम समाधान है।`, tone: 'warm' },
      { label: 'आभार व पुष्टि (Grateful Confirmation)', text: `${responseText} पूछने और मेरा ध्यान रखने के लिए आपका बहुत-बहुत धन्यवाद।`, tone: 'warm' }
    ];
  }

  if (lang === 'Hinglish') {
    return [
      { label: 'इलाबोरेट & वार्म (Detailed & Warm)', text: `${responseText} आई थिंक यह आईडिया एकदम बेस्ट रहेगा और हम सब एन्जॉय करेंगे।`, tone: 'warm' },
      { label: 'फुल अग्रीमेंट (Enthusiastic)', text: `${responseText} यह एकदम परफेक्ट प्लान है और मैं इसके लिए 100% रेडी हूँ!`, tone: 'warm' },
      { label: 'कोलैबोरेटिव अग्री (Collaborative)', text: `${responseText} चलो इसी के साथ आगे बढ़ते हैं, यह हमारे लिए सबसे बेस्ट ऑप्शन है।`, tone: 'warm' },
      { label: 'वार्म अप्रिशिएशन (Grateful Confirmation)', text: `${responseText} थैंक यू सो मच मुझसे पूछने और केयर करने के लिए।`, tone: 'warm' }
    ];
  }

  return [
    { label: 'Elaborate & Warm', text: `${responseText} I feel this is the best path forward, and I really appreciate you checking with me.`, tone: 'warm' },
    { label: 'Enthusiastic Confirmation', text: `${responseText} That sounds wonderful and I am completely on board with that choice.`, tone: 'warm' },
    { label: 'Collaborative Action', text: `${responseText} Let's go ahead with that right away—I think it will work out great.`, tone: 'warm' },
    { label: 'Thoughtful Nuance', text: `${responseText} That fits my preferences and gives me great comfort right now.`, tone: 'warm' }
  ];
}

function generateFallbackResponses(transcript?: string, lang: string = 'English') {
  if (lang === 'Hindi') {
    return [
      { id: 'fb-hi-1', text: 'हाँ, यह मुझे बहुत पसंद है!', tag: 'स्वीकृति', details: 'हाँ, यह मुझे बहुत पसंद है। चलिए यही करते हैं।' },
      { id: 'fb-hi-2', text: 'नहीं, मुझे यह पसंद नहीं आया।', tag: 'अस्वीकृति / असहमति', details: 'नहीं, मैं इससे सहमत नहीं हूँ। मुझे यह विचार पसंद नहीं आया।' },
      { id: 'fb-hi-3', text: 'मुझे थोड़ा आराम चाहिए।', tag: 'निवेदन', details: 'मुझे थोड़ा आराम चाहिए, हम बाद में बात करेंगे।' },
      { id: 'fb-hi-4', text: 'धन्यवाद, मुझे बताने के लिए।', tag: 'आभार', details: 'धन्यवाद, मुझे बताने के लिए। मैं समझ गया।' },
      { id: 'fb-hi-5', text: 'क्या आप फिर से दोहरा सकते हैं?', tag: 'प्रश्न', details: 'क्या आप फिर से दोहरा सकते हैं? मुझे ठीक से सुनाई नहीं दिया।' },
    ];
  }

  if (lang === 'Hinglish') {
    return [
      { id: 'fb-hg-1', text: 'हाँ, यह आईडिया बिल्कुल परफेक्ट है!', tag: 'अग्री', details: 'हाँ, यह आईडिया बिल्कुल परफेक्ट है, चलो प्लान बनाते हैं।' },
      { id: 'fb-hg-2', text: 'नो, मुझे यह आईडिया पसंद नहीं है।', tag: 'रिफ्यूजल / डिसअग्री', details: 'नो, मैं इसके साथ कम्फर्टेबल नहीं हूँ। चलो कुछ और ट्राय करते हैं।' },
      { id: 'fb-hg-3', text: 'मैं थोड़ा बिज़ी हूँ, थोड़ी देर में बात करते हैं।', tag: 'पॉज़', details: 'मैं थोड़ा बिज़ी हूँ, थोड़ी देर में आराम से बात करते हैं।' },
      { id: 'fb-hg-4', text: 'थैंक यू सो मच बताने के लिए!', tag: 'थैंक्स', details: 'थैंक यू सो मच बताने के लिए, आई रियली अप्रिशिएट इट।' },
      { id: 'fb-hg-5', text: 'क्या आप प्लीज़ रिपीट कर सकते हैं?', tag: 'क्वेश्चन', details: 'क्या आप प्लीज़ रिपीट कर सकते हैं? लास्ट पार्ट समझ नहीं आया।' },
    ];
  }

  const lower = (transcript || '').toLowerCase();

  if (
    lower.includes('pizza') ||
    lower.includes('pasta') ||
    lower.includes('dinner') ||
    lower.includes('food') ||
    lower.includes('eat')
  ) {
    return [
      { id: 'fb-1', text: 'Pizza sounds great!', tag: 'Direct Answer', details: 'Pizza sounds great! I\'d love a slice of pepperoni or cheese.' },
      { id: 'fb-2', text: 'No, I don\'t feel like eating pizza or pasta.', tag: 'Negative / Refusal', details: 'No, I don\'t feel like eating pizza or pasta tonight. Let\'s get something lighter like soup.' },
      { id: 'fb-3', text: 'I\'d prefer pasta today.', tag: 'Alternative', details: 'I\'d prefer pasta today with a fresh salad on the side.' },
      { id: 'fb-4', text: 'I\'m not very hungry right now.', tag: 'Statement', details: 'I\'m not very hungry right now, maybe just a warm soup or drink later.' },
      { id: 'fb-5', text: 'What are you having?', tag: 'Follow-up', details: 'What are you having? Surprise me with your favorite choice!' },
    ];
  }

  if (lower.includes('how are you') || lower.includes('feeling') || lower.includes('today')) {
    return [
      { id: 'fb-1', text: 'I\'m feeling good today, thank you!', tag: 'Positive', details: 'I\'m feeling good today, thank you for checking in on me.' },
      { id: 'fb-2', text: 'I\'m actually feeling quite frustrated and unwell today.', tag: 'Negative Thought', details: 'I\'m actually feeling quite frustrated and unwell today. I need some quiet time.' },
      { id: 'fb-3', text: 'A bit tired, but hanging in there.', tag: 'Honest', details: 'A bit tired, but hanging in there and happy to chat.' },
      { id: 'fb-4', text: 'Ready for a peaceful day.', tag: 'Calm', details: 'Ready for a peaceful day with family and friends.' },
      { id: 'fb-5', text: 'How are you doing today?', tag: 'Question', details: 'How are you doing today? Tell me how your day is going.' },
    ];
  }

  return [
    { id: 'fb-1', text: 'Yes, that sounds good to me.', tag: 'Affirmation', details: 'Yes, that sounds good to me. Let\'s go ahead with that plan.' },
    { id: 'fb-2', text: 'No, I disagree and don\'t want to do that.', tag: 'Negative / Boundary', details: 'No, I disagree and I\'m not comfortable doing that right now.' },
    { id: 'fb-3', text: 'Could we talk about that in a moment?', tag: 'Pause', details: 'Could we talk about that in a moment? I just need a quick rest.' },
    { id: 'fb-4', text: 'Thank you for letting me know.', tag: 'Gratitude', details: 'Thank you for letting me know. I really appreciate it!' },
    { id: 'fb-5', text: 'Can you repeat that for me?', tag: 'Clarification', details: 'Can you repeat that for me? I didn\'t quite catch the last part.' },
  ];
}
