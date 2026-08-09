import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { TranscriptSection } from './components/TranscriptSection';
import { PredictedResponses } from './components/PredictedResponses';
import { QuickNeedsSection } from './components/QuickNeedsSection';
import { ReadyToSpeakBar } from './components/ReadyToSpeakBar';
import { SettingsModal } from './components/SettingsModal';
import { DetailsModal } from './components/DetailsModal';
import { UserProfile, PredictedResponse, QuickNeed, VoiceEngineConfig } from './types';
import { SpeechSynthesisService } from './lib/speechServices';
import { SIMULATED_SCENARIOS } from './data/quickNeeds';

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
};

export default function App() {
  // Voice & Profile Config with LocalStorage persistence
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
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
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

  // UI Modals & Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [detailModalResponse, setDetailModalResponse] = useState<PredictedResponse | null>(null);
  const [isEyeGazeMode, setIsEyeGazeMode] = useState<boolean>(false);

  // Web Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Save Config to LocalStorage
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

  // Function to fetch AI predicted responses from server Gemini API
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
    [userProfile, speaker]
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

  // Cycle scenario helper for header button
  const handleCycleScenario = () => {
    const randomIdx = Math.floor(Math.random() * SIMULATED_SCENARIOS.length);
    const scen = SIMULATED_SCENARIOS[randomIdx];
    handleUpdateTranscript(scen.text, scen.speaker);
  };

  const isElevenLabsActive =
    voiceConfig.engine === 'elevenlabs' &&
    !!(voiceConfig.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        isListening={isListening}
        onToggleListening={handleToggleListening}
        voiceConfig={voiceConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSelectScenario={handleCycleScenario}
        isEyeGazeMode={isEyeGazeMode}
        onToggleEyeGaze={() => setIsEyeGazeMode(!isEyeGazeMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
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
          onOpenDetails={(resp) => setDetailModalResponse(resp)}
          isLoading={isLoadingPredictions}
          isEyeGazeMode={isEyeGazeMode}
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

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceConfig={voiceConfig}
        onSaveVoiceConfig={setVoiceConfig}
        userProfile={userProfile}
        onSaveUserProfile={setUserProfile}
      />

      <DetailsModal
        response={detailModalResponse}
        onClose={() => setDetailModalResponse(null)}
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
