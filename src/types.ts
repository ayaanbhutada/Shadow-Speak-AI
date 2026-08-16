export interface UserProfile {
  name: string;
  caregiverContext: string;
  tone: 'Warm & Natural' | 'Direct & Concise' | 'Enthusiastic' | 'Formal & Polite';
  relationships: string;
  conditionNotes: string;
  language?: 'English' | 'Hindi' | 'Hinglish';
  communicationAnswers?: Record<number, number[] | number>;
  communicationStyleSummary?: string;
  communicationStyleTraits?: string[];
}

export interface PredictedResponse {
  id: string;
  text: string;
  tag: string;
  details?: string;
}

export interface QuickNeed {
  id: string;
  label: string;
  phrase: string;
  icon: string;
  color: string;
  isUrgent?: boolean;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isUserSpeaker?: boolean;
}

export interface VoiceEngineConfig {
  engine: 'web-speech' | 'elevenlabs';
  elevenLabsApiKey: string;
  elevenLabsVoiceId: string;
  elevenLabsVoiceName: string;
  webSpeechVoiceName: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
  preview_url?: string;
}

export interface SimulatedScenario {
  id: string;
  title: string;
  speaker: string;
  text: string;
  icon: string;
}

export interface AIModelConfig {
  provider: 'gemini' | 'groq';
  modelId: string;
  groqApiKey: string;
  geminiApiKey: string;
}

