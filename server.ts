import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  });
});

// 2. Predict Responses endpoint using Gemini 3.6 Flash
app.post("/api/predict-responses", async (req, res) => {
  try {
    const { transcript, userProfile, currentSpeakers, count = 4 } = req.body;

    const profileText = userProfile ? `
Patient Name: ${userProfile.name || 'Alex'}
Condition Context: ALS / Speech impaired.
Caregiver / Listener Context: ${userProfile.caregiverContext || 'Family member or friend'}
Preferred Tone: ${userProfile.tone || 'Warm, natural, direct'}
Key Relationships: ${userProfile.relationships || 'Family, healthcare team'}
` : 'Patient: Alex, ALS patient with clear cognition.';

    const prompt = `You are the AI engine for "Shadow Speak AI", a high-speed AAC (Augmentative and Alternative Communication) system for people living with ALS and speech loss.

Current live conversation context captured via background microphone:
"""
${transcript || "Hey! What would you like to have for dinner tonight?"}
"""

User Profile & Preferences:
${profileText}

Task:
Generate exactly ${count} distinct, natural, human-sounding response options that the user can select with 1 tap or eye-gaze.
Each option must be relevant to the incoming dialogue.
Include variety in options:
1. Direct clear answer or affirmation
2. Alternative option or variation
3. Statement or reflection
4. Warm/playful or gentle follow-up / question

Each response MUST have:
- text: The exact sentence to be spoken (concise, natural, under 12 words).
- tag: A short category pill label (e.g. "Direct Answer", "Alternative", "Statement", "Follow-up", "Urgent", "Warmth").
- details: An optional expanded or more detailed version if the user wants to elaborate (15-25 words).`;

    const ai = getGeminiClient();

    if (!ai) {
      console.warn("GEMINI_API_KEY missing, using fallback rule-based predictions");
      return res.json({
        responses: generateFallbackResponses(transcript)
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
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
      return res.json({ responses: responsesWithIds });
    }

    throw new Error("No response generated");
  } catch (err: any) {
    console.error("Error generating predictions:", err);
    return res.json({
      responses: generateFallbackResponses(req.body?.transcript)
    });
  }
});

// Fallback smart response generator if Gemini key isn't provided or fails
function generateFallbackResponses(transcript?: string) {
  const lower = (transcript || "").toLowerCase();

  if (lower.includes("pizza") || lower.includes("pasta") || lower.includes("dinner") || lower.includes("food") || lower.includes("eat")) {
    return [
      { id: "fb-1", text: "Pizza sounds great!", tag: "Direct Answer", details: "Pizza sounds great! I'd love a slice of pepperoni or cheese." },
      { id: "fb-2", text: "I'd prefer pasta today.", tag: "Alternative", details: "I'd prefer pasta today with a fresh salad on the side." },
      { id: "fb-3", text: "I'm not very hungry right now.", tag: "Statement", details: "I'm not very hungry right now, maybe just a warm soup or drink later." },
      { id: "fb-4", text: "What are you having?", tag: "Follow-up", details: "What are you having? Surprise me with your favorite choice!" }
    ];
  }

  if (lower.includes("how are you") || lower.includes("feeling") || lower.includes("today")) {
    return [
      { id: "fb-1", text: "I'm feeling good today, thank you!", tag: "Positive", details: "I'm feeling good today, thank you for checking in on me." },
      { id: "fb-2", text: "A bit tired, but hanging in there.", tag: "Honest", details: "A bit tired, but hanging in there and happy to chat." },
      { id: "fb-3", text: "Ready for a peaceful day.", tag: "Calm", details: "Ready for a peaceful day with family and friends." },
      { id: "fb-4", text: "How are you doing today?", tag: "Question", details: "How are you doing today? Tell me how your day is going." }
    ];
  }

  return [
    { id: "fb-1", text: "Yes, that sounds good to me.", tag: "Affirmation", details: "Yes, that sounds good to me. Let's go ahead with that plan." },
    { id: "fb-2", text: "Could we talk about that in a moment?", tag: "Pause", details: "Could we talk about that in a moment? I just need a quick rest." },
    { id: "fb-3", text: "Thank you for letting me know.", tag: "Gratitude", details: "Thank you for letting me know. I really appreciate it!" },
    { id: "fb-4", text: "Can you repeat that for me?", tag: "Clarification", details: "Can you repeat that for me? I didn't quite catch the last part." }
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shadow Speak AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
