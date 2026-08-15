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
import { UserProfile, PredictedResponse, QuickNeed, VoiceEngineConfig, AIModelConfig } from './types';
import { SpeechSynthesisService } from './lib/speechServices';
import { SIMULATED_SCENARIOS } from './data/quickNeeds';

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
  const [isListening, setIsListening] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>(
    'Hey Alex! We are ordering dinner now. Do you want pizza or pasta tonight?'
  );
  const [speaker, setSpeaker] = useState<string>('Family Member');
  const [timestamp, setTimestamp] = useState<string>('Just now');

  // AI Predicted Responses
  const [responses, setResponses] = useState<PredictedResponse[]>([
    { id: 'p1', text: 'Pizza sounds great!', tag: 'Direct Answer', details: 'Pizza sounds great! I would love a slice of pepperoni or cheese.' },
    { id: 'p2', text: "I'd prefer pasta today.", tag: 'Alternative', details: "I'd prefer pasta today with a fresh garden salad." },
    { id: 'p3', text: "I'm not very hungry right now.", tag: 'Statement', details: "I'm not very hungry right now, maybe just a warm soup or drink." },
    { id: 'p4', text: 'What are you having?', tag: 'Follow-up', details: 'What are you having? Surprise me with your favorite choice!' },
  ]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>('p1');

  // Speech Bar State
  const [readyText, setReadyText] = useState<string>('Pizza sounds great!');
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
      setIsLoadingPredictions(true);
      try {
        const res = await fetch('/api/predict-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: currentTranscript,
            userProfile,
            currentSpeaker: currentSpeakerName || speaker,
            count: 4,
            aiModelConfig,
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
    [userProfile, speaker, aiModelConfig]
  );

  // Speech Recognition (ASR) setup using Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech Recognition API is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          setTranscript(finalTranscript.trim());
          setSpeaker('Ambient Speaker');
          setTimestamp('Just now');
          fetchAIPredictions(finalTranscript.trim(), 'Ambient Speaker');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;

      if (isListening) {
        recognition.start();
      }
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isListening, fetchAIPredictions]);

  // Toggle ambient microphone listening
  const handleToggleListening = () => {
    setIsListening((prev) => {
      const next = !prev;
      if (recognitionRef.current) {
        if (next) {
          try {
            recognitionRef.current.start();
          } catch {}
        } else {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
      }
      return next;
    });
  };

  // Update transcript manually or via preset
  const handleUpdateTranscript = (newText: string, speakerName?: string) => {
    setTranscript(newText);
    if (speakerName) setSpeaker(speakerName);
    setTimestamp('Just now');
    fetchAIPredictions(newText, speakerName);
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

    if (currentView === 'dashboard') {
      fetchAIPredictions(transcript, speaker);
    }
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
          speaker={speaker}
          timestamp={timestamp}
          isListening={isListening}
          onUpdateTranscript={handleUpdateTranscript}
          onRequestPredictions={() => fetchAIPredictions(transcript, speaker)}
          isLoadingPredictions={isLoadingPredictions}
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
        />

        {/* Section 3: Quick Essential Needs (High Priority 1-Tap) */}
        <QuickNeedsSection
          onSelectNeed={handleSelectNeed}
          onSpeakNeedImmediately={(need) => {
            handleSelectNeed(need);
            handleSpeak(need.phrase);
          }}
          isEyeGazeMode={isEyeGazeMode}
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
