import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TranscriptSection } from './components/TranscriptSection';
import { PredictedResponses } from './components/PredictedResponses';
import { QuickNeedsSection } from './components/QuickNeedsSection';
import { ReadyToSpeakBar } from './components/ReadyToSpeakBar';
import { SettingsPage } from './components/SettingsPage';
import { DetailsModal } from './components/DetailsModal';
import { LandingPage } from './components/LandingPage';
import { CommunicationStylePage } from './components/CommunicationStylePage';
import { UserProfile, PredictedResponse, QuickNeed, VoiceEngineConfig, AIModelConfig, TranscriptEntry } from './types';
import { SpeechSynthesisService, SpeechRecognitionService } from './lib/speechServices';
import {
  SIMULATED_SCENARIOS,
  getQuickNeedsForLanguage,
  getSimulatedScenariosForLanguage,
  getInitialResponsesForLanguage,
} from './data/quickNeeds';
import { shouldBypassServer, predictResponsesDirectly } from './lib/clientAiService';

const DEFAULT_PROFILES: UserProfile[] = [
  {
    name: 'Alex Morgan',
    caregiverContext: 'Spouse Sarah & Nurse Maria',
    tone: 'Warm & Natural',
    relationships: 'Family, healthcare providers, friends',
    conditionNotes: 'ALS speech impairment - clear cognition',
    language: 'English',
    communicationAnswers: { 1: [1, 2], 2: [1, 3], 3: [1, 8], 4: [1, 2], 5: [1, 3], 6: [1, 3], 7: [1, 2], 8: [1, 5], 9: [1, 9], 10: [1, 2] },
    communicationStyleSummary: 'Hydration: [Short & Polite, Gentle & Specific] • Small Talk: [Enthusiastic, Casual Update] • Health: [Upbeat & Positive, Warm & Grateful] • Activity: [Outdoor Fresh Air, Shared Entertainment] • Departure: [Warm Gratitude, Safety Check] • Food: [Gentle Soup / Warm, Comfort Food] • Comfort: [Comfortable, Head Elevation] • Social: [Social & Engaged, Music Company] • Meds: [Routine Confirmed, Stable & Comfort] • Weekend: [Scenic Outing, Cozy Home]',
    communicationStyleTraits: ['Short & Polite', 'Gentle & Specific', 'Enthusiastic', 'Casual Update', 'Upbeat & Positive', 'Warm & Grateful', 'Outdoor Fresh Air', 'Shared Entertainment', 'Warm Gratitude', 'Safety Check', 'Gentle Soup / Warm', 'Comfort Food', 'Comfortable', 'Head Elevation', 'Social & Engaged', 'Music Company', 'Routine Confirmed', 'Stable & Comfort', 'Scenic Outing', 'Cozy Home'],
  },
  {
    name: 'Rajesh Verma',
    caregiverContext: 'पत्नी सुनीता एवं देखभालकर्ता अमित',
    tone: 'Warm & Natural',
    relationships: 'परिवार, चिकित्सक एवं मित्र',
    conditionNotes: 'हिंदी भाषा और देवनागरी लिपि में संवाद',
    language: 'Hindi',
    communicationAnswers: { 1: [1, 2], 2: [1, 3], 3: [1, 2], 4: [1, 2], 5: [1, 2], 6: [1, 3], 7: [1, 2], 8: [1, 2], 9: [1, 2], 10: [1, 2] },
    communicationStyleSummary: 'जलपान: [विनम्र व संक्षिप्त, सौम्य व स्पष्ट] • संवाद: [उत्साही, संक्षिप्त समीक्षा] • स्वास्थ्य: [सकारात्मक ऊर्जा, विनम्र आभार] • गतिविधि: [ताज़ी हवा, संगीत व आराम] • प्रस्थान: [हार्दिक आभार, देखभाल व सुरक्षा]',
    communicationStyleTraits: ['विनम्र व संक्षिप्त', 'सौम्य व स्पष्ट', 'उत्साही', 'सकारात्मक ऊर्जा', 'विनम्र आभार', 'ताज़ी हवा', 'हार्दिक आभार'],
  },
  {
    name: 'Priya Sharma',
    caregiverContext: 'Son Rahul & Caregiver Rita',
    tone: 'Direct & Concise',
    relationships: 'Family, doctors, relatives',
    conditionNotes: 'Prefers Hinglish responses and clear boundaries',
    language: 'Hinglish',
    communicationAnswers: { 1: [6, 1], 2: [5, 1], 3: [4, 1], 4: [4, 6], 5: [4, 1], 6: [8, 3], 7: [4, 3], 8: [4, 5], 9: [3, 1], 10: [3, 1] },
    communicationStyleSummary: 'Hydration: [Hinglish Blend, Short & Polite] • Small Talk: [Hinglish Banter, Enthusiastic] • Health: [Hinglish Baseline, Upbeat & Positive] • Activity: [Hinglish Walk, Audio Relaxation] • Departure: [Hinglish Farewell, Warm Gratitude] • Food: [Hinglish Meal, Dal Khichdi] • Comfort: [Hinglish Shift, Cushion Adjust] • Social: [Hinglish Rest, Music Company] • Meds: [Hinglish Routine, Routine Confirmed] • Weekend: [Hinglish Gathering, Scenic Outing]',
    communicationStyleTraits: ['Hinglish Blend', 'Hinglish Banter', 'Hinglish Baseline', 'Hinglish Walk', 'Hinglish Farewell', 'Hinglish Meal', 'Dal Khichdi', 'Hinglish Shift', 'Hinglish Rest', 'Hinglish Routine', 'Hinglish Gathering'],
  },
  {
    name: 'David Chen',
    caregiverContext: 'Daughter Emma & Physical Therapist Mark',
    tone: 'Formal & Polite',
    relationships: 'Healthcare team, colleagues, family',
    conditionNotes: 'Requires formal tone for medical consultations',
    language: 'English',
    communicationAnswers: { 1: [2, 5], 2: [2, 4], 3: [2, 9], 4: [6, 9], 5: [3, 8], 6: [7, 5], 7: [8, 2], 8: [3, 9], 9: [5, 7], 10: [9, 6] },
    communicationStyleSummary: 'Hydration: [Gentle & Specific, Polite Refusal] • Small Talk: [Direct & Honest, Polite Question] • Health: [Balanced Realist, Caregiver Redirect] • Activity: [Audio Relaxation, Routine Compliance] • Departure: [Safety Check, Direct Command] • Food: [Dietary Guidance, Smoothie / Protein] • Comfort: [Physio Review, Head Elevation] • Social: [Quiet Presence, Independent Focus] • Meds: [Safety Verification, Informed Partner] • Weekend: [Transport Logistics, Adaptive Energy]',
    communicationStyleTraits: ['Gentle & Specific', 'Direct & Honest', 'Balanced Realist', 'Audio Relaxation', 'Safety Check', 'Dietary Guidance', 'Physio Review', 'Quiet Presence', 'Safety Verification', 'Transport Logistics'],
  },
];

const DEFAULT_VOICE_CONFIG: VoiceEngineConfig = {
  engine: 'web-speech',
  elevenLabsApiKey: '',
  elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
  elevenLabsVoiceName: 'Rachel (Cloned)',
  webSpeechVoiceName: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex',
  caregiverContext: 'Spouse Sarah & Nurse Maria',
  tone: 'Warm & Natural',
  relationships: 'Family, healthcare providers, friends',
  conditionNotes: 'ALS speech impairment - clear cognition',
  language: 'English',
  communicationAnswers: { 1: [1, 2], 2: [1, 3], 3: [1, 8], 4: [1, 2], 5: [1, 3], 6: [1, 3], 7: [1, 2], 8: [1, 5], 9: [1, 9], 10: [1, 2] },
  communicationStyleSummary: 'Hydration: [Short & Polite, Gentle & Specific] • Small Talk: [Enthusiastic, Casual Update] • Health: [Upbeat & Positive, Warm & Grateful] • Activity: [Outdoor Fresh Air, Shared Entertainment] • Departure: [Warm Gratitude, Safety Check] • Food: [Gentle Soup / Warm, Comfort Food] • Comfort: [Comfortable, Head Elevation] • Social: [Social & Engaged, Music Company] • Meds: [Routine Confirmed, Stable & Comfort] • Weekend: [Scenic Outing, Cozy Home]',
  communicationStyleTraits: ['Short & Polite', 'Gentle & Specific', 'Enthusiastic', 'Casual Update', 'Upbeat & Positive', 'Warm & Grateful', 'Outdoor Fresh Air', 'Shared Entertainment', 'Warm Gratitude', 'Safety Check', 'Gentle Soup / Warm', 'Comfort Food', 'Comfortable', 'Head Elevation', 'Social & Engaged', 'Music Company', 'Routine Confirmed', 'Stable & Comfort', 'Scenic Outing', 'Cozy Home'],
};

const DEFAULT_AI_MODEL_CONFIG: AIModelConfig = {
  provider: 'gemini',
  modelId: 'gemini-3.6-flash',
  groqApiKey: '',
  geminiApiKey: '',
};

export default function App() {
  // Navigation View State ('landing' | 'dashboard' | 'settings' | 'style-questionnaire')
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'settings' | 'style-questionnaire'>('landing');

  // Profiles List Persistence
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('shadow_speak_profiles_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  });

  // Voice, Profile & AI Model Config with LocalStorage persistence
  const [voiceConfig, setVoiceConfig] = useState<VoiceEngineConfig>(() => {
    try {
      const saved = localStorage.getItem('shadow_speak_voice_config');
      return saved ? JSON.parse(saved) : DEFAULT_VOICE_CONFIG;
    } catch {
      return DEFAULT_VOICE_CONFIG;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('shadow_speak_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILES[0];
    } catch {
      return DEFAULT_PROFILES[0];
    }
  });

  const [aiModelConfig, setAiModelConfig] = useState<AIModelConfig>(() => {
    try {
      const saved = localStorage.getItem('shadow_speak_ai_model_config');
      return saved ? JSON.parse(saved) : DEFAULT_AI_MODEL_CONFIG;
    } catch {
      return DEFAULT_AI_MODEL_CONFIG;
    }
  });

  // ASR & Conversation State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [asrStatusMessage, setAsrStatusMessage] = useState<string>('');

  const initialScenarios = getSimulatedScenariosForLanguage(userProfile.language, userProfile.name);
  const [transcript, setTranscript] = useState<string>(
    initialScenarios[0]?.text || 'Hey Alex! We are ordering dinner now. Do you want pizza or pasta tonight?'
  );
  const [speaker, setSpeaker] = useState<string>(
    initialScenarios[0]?.speaker || 'Family Member'
  );
  const [timestamp, setTimestamp] = useState<string>('Just now');

  const speechDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioActiveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Predicted Responses dynamically initialized to user profile language
  const [responses, setResponses] = useState<PredictedResponse[]>(() =>
    getInitialResponsesForLanguage(userProfile.language)
  );
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(() => {
    const init = getInitialResponsesForLanguage(userProfile.language);
    return init[0]?.id || 'p1';
  });

  // Speech Bar State
  const [readyText, setReadyText] = useState<string>(() => {
    const init = getInitialResponsesForLanguage(userProfile.language);
    return init[0]?.text || 'Pizza sounds great!';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // UI State
  const [detailModalResponse, setDetailModalResponse] = useState<PredictedResponse | null>(null);
  const [isEyeGazeMode, setIsEyeGazeMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shadow_speak_eye_gaze_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Web Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Save Config and Profiles to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('shadow_speak_eye_gaze_mode', JSON.stringify(isEyeGazeMode));
    } catch (e) {
      console.error(e);
    }
  }, [isEyeGazeMode]);

  // Conversation Memory State
  const [conversationHistory, setConversationHistory] = useState<TranscriptEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`shadow_speak_conversation_history_${userProfile.name}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    const scen = getSimulatedScenariosForLanguage(userProfile.language, userProfile.name)[0];
    return [
      {
        id: 'seed-1',
        speaker: scen?.speaker || 'Family Member',
        text: scen?.text || 'Hey Alex! We are ordering dinner now. Do you want pizza or pasta tonight?',
        timestamp: 'Just now',
        isUserSpeaker: false,
      },
    ];
  });

  // Save history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        `shadow_speak_conversation_history_${userProfile.name}`,
        JSON.stringify(conversationHistory)
      );
    } catch (e) {
      console.error(e);
    }
  }, [conversationHistory, userProfile.name]);

  // Switch history and sync responses when active profile or language changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`shadow_speak_conversation_history_${userProfile.name}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversationHistory(parsed);
          const latestAmbient = [...parsed].reverse().find((e: TranscriptEntry) => !e.isUserSpeaker);
          if (latestAmbient) {
            setTranscript(latestAmbient.text);
            setSpeaker(latestAmbient.speaker);
          }
          return;
        }
      }
      const scenarios = getSimulatedScenariosForLanguage(userProfile.language, userProfile.name);
      const defaultSeed = scenarios[0] || {
        speaker: userProfile.caregiverContext || 'Caregiver',
        text: `Hello ${userProfile.name}, how can I help you right now?`,
      };
      setConversationHistory([
        {
          id: `seed-${Date.now()}`,
          speaker: defaultSeed.speaker,
          text: defaultSeed.text,
          timestamp: 'Just now',
          isUserSpeaker: false,
        },
      ]);
      setTranscript(defaultSeed.text);
      setSpeaker(defaultSeed.speaker);

      const localizedResp = getInitialResponsesForLanguage(userProfile.language);
      setResponses(localizedResp);
      if (localizedResp[0]) {
        setSelectedResponseId(localizedResp[0].id);
        setReadyText(localizedResp[0].text);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userProfile.name, userProfile.language]);

  const handleAddHistoryEntry = useCallback((text: string, speakerName: string, isUser: boolean = false) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversationHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.text === cleanText && last.isUserSpeaker === isUser) {
        return prev;
      }
      const newEntry: TranscriptEntry = {
        id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        speaker: speakerName,
        text: cleanText,
        timestamp: timeStr,
        isUserSpeaker: isUser,
      };
      // Keep strictly the last 4 conversation terms in memory buffer
      return [...prev.slice(-3), newEntry];
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    setConversationHistory([]);
    try {
      localStorage.removeItem(`shadow_speak_conversation_history_${userProfile.name}`);
    } catch (e) {
      console.error(e);
    }
  }, [userProfile.name]);

  const handleDeleteHistoryEntry = useCallback((id: string) => {
    setConversationHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('shadow_speak_profiles_list', JSON.stringify(profiles));
    } catch (e) {
      console.error(e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem('shadow_speak_voice_config', JSON.stringify(voiceConfig));
    } catch (e) {
      console.error(e);
    }
  }, [voiceConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('shadow_speak_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  // Profile Action Handlers
  const handleSelectProfile = (selectedProf: UserProfile) => {
    setUserProfile(selectedProf);
    setCurrentView('dashboard');
  };

  const handleCreateProfile = (newProf: UserProfile) => {
    setProfiles((prev) => [newProf, ...prev]);
    setUserProfile(newProf);
    setCurrentView('dashboard');
  };

  const handleDeleteProfile = (profName: string) => {
    setProfiles((prev) => prev.filter((p) => p.name !== profName));
  };

  useEffect(() => {
    try {
      localStorage.setItem('shadow_speak_ai_model_config', JSON.stringify(aiModelConfig));
    } catch (e) {
      console.error(e);
    }
  }, [aiModelConfig]);

  // Function to fetch AI predicted responses from server Gemini / Groq API
  const fetchAIPredictions = useCallback(
    async (currentTranscript: string, currentSpeakerName?: string) => {
      if (!currentTranscript || !currentTranscript.trim()) return;
      setIsLoadingPredictions(true);
      try {
        if (shouldBypassServer(aiModelConfig)) {
          const result = await predictResponsesDirectly(
            currentTranscript,
            userProfile,
            4,
            aiModelConfig,
            conversationHistory
          );
          if (result && result.responses && result.responses.length > 0) {
            setResponses(result.responses);
            // Default select the first AI option
            setSelectedResponseId(result.responses[0].id);
            setReadyText(result.responses[0].text);
          }
          return;
        }

        const res = await fetch('/api/predict-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: currentTranscript,
            userProfile,
            currentSpeaker: currentSpeakerName || speaker,
            count: 4,
            aiModelConfig,
            conversationHistory,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.responses && data.responses.length > 0) {
            setResponses(data.responses);
            // Default select the first AI option
            setSelectedResponseId(data.responses[0].id);
            setReadyText(data.responses[0].text);
          }
        }
      } catch (err) {
        console.error('Error fetching AI predictions:', err);
      } finally {
        setIsLoadingPredictions(false);
      }
    },
    [userProfile, speaker, aiModelConfig, conversationHistory]
  );

  // Sync recognition language whenever active user profile changes
  useEffect(() => {
    SpeechRecognitionService.updateLanguage(userProfile.language || 'English');
  }, [userProfile.language]);

  // Setup continuous robust Speech Recognition
  useEffect(() => {
    const handleInterim = (interimText: string) => {
      setInterimTranscript(interimText);
      setIsAudioActive(true);

      if (audioActiveTimerRef.current) clearTimeout(audioActiveTimerRef.current);
      audioActiveTimerRef.current = setTimeout(() => {
        setIsAudioActive(false);
      }, 1800);
    };

    const handleFinal = (finalText: string) => {
      setInterimTranscript('');
      setIsAudioActive(true);

      if (audioActiveTimerRef.current) clearTimeout(audioActiveTimerRef.current);
      audioActiveTimerRef.current = setTimeout(() => {
        setIsAudioActive(false);
      }, 1500);

      setTranscript(finalText);
      setSpeaker('Ambient Speaker');
      setTimestamp('Just now');
      handleAddHistoryEntry(finalText, 'Ambient Speaker', false);

    };

    const handleStatusChange = (active: boolean, errorMsg?: string) => {
      setIsListening(active);
      if (errorMsg) {
        setAsrStatusMessage(errorMsg);
      } else {
        setAsrStatusMessage('');
      }
    };

    const handleError = (errMsg: string) => {
      setAsrStatusMessage(errMsg);
    };

    SpeechRecognitionService.initialize(
      {
        onInterim: handleInterim,
        onFinal: handleFinal,
        onSpeechStart: () => setIsAudioActive(true),
        onSpeechEnd: () => {
          if (audioActiveTimerRef.current) clearTimeout(audioActiveTimerRef.current);
          audioActiveTimerRef.current = setTimeout(() => {
            setIsAudioActive(false);
          }, 1000);
        },
        onStatusChange: handleStatusChange,
        onError: handleError,
      },
      SpeechRecognitionService.getRecognitionLanguage(userProfile.language)
    );

    if (isListening) {
      SpeechRecognitionService.start();
    }

    return () => {
      if (speechDebounceTimerRef.current) clearTimeout(speechDebounceTimerRef.current);
      if (audioActiveTimerRef.current) clearTimeout(audioActiveTimerRef.current);
      SpeechRecognitionService.stop();
    };
  }, []);

  // Toggle ambient microphone listening
  const handleToggleListening = () => {
    const next = !isListening;
    if (next) {
      setAsrStatusMessage('');
      SpeechRecognitionService.start(undefined, SpeechRecognitionService.getRecognitionLanguage(userProfile.language));
      setIsListening(true);
    } else {
      SpeechRecognitionService.stop();
      setIsListening(false);
      setIsAudioActive(false);
      setInterimTranscript('');
    }
  };

  // Restart / Reconnect microphone
  const handleResetMic = () => {
    setAsrStatusMessage('Reconnecting microphone...');
    SpeechRecognitionService.stop();
    setTimeout(() => {
      SpeechRecognitionService.start(undefined, SpeechRecognitionService.getRecognitionLanguage(userProfile.language));
      setAsrStatusMessage('');
    }, 300);
  };

  // Update transcript manually or via preset
  const handleUpdateTranscript = (newText: string, speakerName?: string) => {
    if (speechDebounceTimerRef.current) {
      clearTimeout(speechDebounceTimerRef.current);
    }
    setInterimTranscript('');
    setTranscript(newText);
    const spk = speakerName || 'Ambient Speaker';
    setSpeaker(spk);
    setTimestamp('Just now');
    handleAddHistoryEntry(newText, spk, false);
  };

  const handleClearTranscript = () => {
    if (speechDebounceTimerRef.current) {
      clearTimeout(speechDebounceTimerRef.current);
    }
    setTranscript('');
    setInterimTranscript('');
    setReadyText('');
    setSelectedResponseId(null);
    setResponses([]);
  };

  // Handle option selection
  const handleSelectResponse = (resp: PredictedResponse) => {
    setSelectedResponseId(resp.id);
    setReadyText(resp.text);
  };

  // Handle Vocalizing / Speak
  const handleSpeak = async (textToSpeak?: string) => {
    const text = textToSpeak || readyText;
    if (!text.trim()) return;

    // Record the user's vocalized AAC response to conversation memory
    handleAddHistoryEntry(text, `${userProfile.name} (You)`, true);

    setIsSpeaking(true);
    try {
      await SpeechSynthesisService.speak(
        text,
        voiceConfig,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        (err) => {
          console.error('TTS execution error:', err);
          setIsSpeaking(false);
        }
      );
    } catch (err) {
      console.error('Failed to speak:', err);
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    SpeechSynthesisService.stop();
    setIsSpeaking(false);
  };

  // Handle Quick Need selection
  const handleSelectNeed = (need: QuickNeed) => {
    setReadyText(need.phrase);
    setSelectedResponseId(null);
  };

  // Handle keyboard shortcuts (1-4 for options, Enter for Speak)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (responses[index]) {
          e.preventDefault();
          handleSelectResponse(responses[index]);
          handleSpeak(responses[index].text);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSpeak();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleStopSpeaking();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [responses, readyText, voiceConfig]);

  const handleSaveProfileWithStyle = (updatedProf: UserProfile) => {
    setUserProfile(updatedProf);
    try {
      localStorage.setItem('shadow_speak_user_profile', JSON.stringify(updatedProf));
    } catch (e) {
      console.error(e);
    }

    setProfiles((prev) => {
      const idx = prev.findIndex((p) => p.name === updatedProf.name);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedProf;
        return next;
      }
      return [...prev, updatedProf];
    });

  };

  const isElevenLabsActive =
    voiceConfig.engine === 'elevenlabs' &&
    !!(voiceConfig.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY);

  if (currentView === 'landing') {
    return (
      <LandingPage
        profiles={profiles}
        activeProfile={userProfile}
        onSelectProfile={handleSelectProfile}
        onCreateProfile={handleCreateProfile}
        onDeleteProfile={handleDeleteProfile}
        onOpenStyleAssessment={() => setCurrentView('style-questionnaire')}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <SettingsPage
        onBack={() => setCurrentView('dashboard')}
        voiceConfig={voiceConfig}
        onSaveVoiceConfig={setVoiceConfig}
        userProfile={userProfile}
        onSaveUserProfile={setUserProfile}
        aiModelConfig={aiModelConfig}
        onSaveAIModelConfig={setAiModelConfig}
        isEyeGazeMode={isEyeGazeMode}
        onToggleEyeGaze={() => setIsEyeGazeMode(!isEyeGazeMode)}
        onOpenStyleAssessment={() => setCurrentView('style-questionnaire')}
        onClearHistory={handleClearHistory}
      />
    );
  }

  if (currentView === 'style-questionnaire') {
    return (
      <CommunicationStylePage
        onBack={() => setCurrentView('dashboard')}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfileWithStyle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        isListening={isListening}
        onToggleListening={handleToggleListening}
        voiceConfig={voiceConfig}
        onOpenSettings={() => setCurrentView('settings')}
        activeProfileName={userProfile.name}
        onOpenLanding={() => setCurrentView('landing')}
        onOpenStyleAssessment={() => setCurrentView('style-questionnaire')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
        {/* Section 1: Live Conversation Transcript (ASR) */}
        <TranscriptSection
          transcript={transcript}
          interimTranscript={interimTranscript}
          isAudioActive={isAudioActive}
          speaker={speaker}
          timestamp={timestamp}
          isListening={isListening}
          onUpdateTranscript={handleUpdateTranscript}
          onClearTranscript={handleClearTranscript}
          onRequestPredictions={() => fetchAIPredictions(transcript, speaker)}
          isLoadingPredictions={isLoadingPredictions}
          onResetMic={handleResetMic}
          statusMessage={asrStatusMessage}
          conversationHistory={conversationHistory}
          onClearHistory={handleClearHistory}
          onDeleteHistoryEntry={handleDeleteHistoryEntry}
        />

        {/* Section 2: AI Predicted Responses (One-Tap Target Selection) */}
        <PredictedResponses
          responses={responses}
          selectedResponseId={selectedResponseId}
          onSelectResponse={handleSelectResponse}
          onSpeakImmediately={(resp) => {
            handleSelectResponse(resp);
            handleSpeak(resp.text);
          }}
          onSpeakText={(text) => {
            setReadyText(text);
            handleSpeak(text);
          }}
          onPrepareText={(text) => {
            setReadyText(text);
          }}
          onOpenDetails={(resp) => setDetailModalResponse(resp)}
          isLoading={isLoadingPredictions}
          isEyeGazeMode={isEyeGazeMode}
          userProfile={userProfile}
          transcript={typeof transcript === 'string' ? transcript : Array.isArray(transcript) ? (transcript as any[]).map((t) => `${t.speaker || ''}: ${t.text || t}`).join('\n') : ''}
          aiModelConfig={aiModelConfig}
        />

        {/* Section 3: Quick Essential Needs (High Priority 1-Tap) */}
        <QuickNeedsSection
          onSelectNeed={handleSelectNeed}
          onSpeakNeedImmediately={(need) => {
            handleSelectNeed(need);
            handleSpeak(need.phrase);
          }}
          isEyeGazeMode={isEyeGazeMode}
          language={userProfile.language}
        />
      </main>

      {/* Persistent Bottom "Ready to Speak" Bar */}
      <ReadyToSpeakBar
        currentText={readyText}
        onChangeText={setReadyText}
        onSpeak={() => handleSpeak()}
        onStop={handleStopSpeaking}
        isSpeaking={isSpeaking}
        isElevenLabs={isElevenLabsActive}
        onClear={() => {
          setReadyText('');
          setSelectedResponseId(null);
        }}
      />

      {/* In-context Details Modal for fine-tuning a specific predicted response */}
      <DetailsModal
        response={detailModalResponse}
        onClose={() => setDetailModalResponse(null)}
        userProfile={userProfile}
        aiModelConfig={aiModelConfig}
        transcript={typeof transcript === 'string' ? transcript : Array.isArray(transcript) ? (transcript as any[]).map((t) => `${t.speaker || ''}: ${t.text || t}`).join('\n') : ''}
        onSpeakText={(text) => {
          setReadyText(text);
          handleSpeak(text);
        }}
        onPrepareText={(text) => {
          setReadyText(text);
        }}
      />
    </div>
  );
}
