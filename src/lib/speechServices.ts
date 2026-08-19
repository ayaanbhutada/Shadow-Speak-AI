import { VoiceEngineConfig } from '../types';

export class SpeechSynthesisService {
  private static audioObj: HTMLAudioElement | null = null;
  private static audioCtx: AudioContext | null = null;

  /**
   * Generates a direct Web Audio API tone chime to test hardware speakers
   */
  static async playTestTone(volume: number = 0.8): Promise<void> {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: C5 (523.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(volume * 0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2: E5 (659.25 Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      gain2.gain.setValueAtTime(volume * 0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Web Audio test tone error:', e);
    }
  }

  static getAvailableWebVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }

  static speak(
    text: string,
    config: VoiceEngineConfig,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // Stop any active audio / speech
      this.stop();

      // Play subtle chime if enabled or to wake audio hardware
      if (config.volume > 0) {
        this.playTestTone(Math.min(config.volume, 0.2));
      }

      if (config.engine === 'elevenlabs' && (config.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY)) {
        try {
          onStart?.();
          const response = await fetch('/api/elevenlabs/tts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.elevenLabsApiKey ? { 'x-elevenlabs-key': config.elevenLabsApiKey } : {})
            },
            body: JSON.stringify({
              text,
              voiceId: config.elevenLabsVoiceId || '21m00Tcm4TlvDq8ikWAM'
            })
          });

          if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || `ElevenLabs TTS failed with status ${response.status}`);
          }

          const blob = await response.blob();
          const audioUrl = URL.createObjectURL(blob);
          this.audioObj = new Audio(audioUrl);
          this.audioObj.volume = config.volume;

          this.audioObj.onended = () => {
            onEnd?.();
            resolve();
          };

          this.audioObj.onerror = (e) => {
            onError?.(e);
            // Fallback to Web Speech if audio playback fails
            this.speakWebSpeech(text, config, onStart, onEnd, onError)
              .then(resolve)
              .catch(reject);
          };

          await this.audioObj.play();
          return;
        } catch (err) {
          console.warn('ElevenLabs TTS failed, falling back to Web Speech API:', err);
          // Fall through to Web Speech API
        }
      }

      // Default Web Speech API
      this.speakWebSpeech(text, config, onStart, onEnd, onError)
        .then(resolve)
        .catch(reject);
    });
  }

  private static speakWebSpeech(
    text: string,
    config: VoiceEngineConfig,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        const err = new Error('Web Speech API is not supported in this browser.');
        onError?.(err);
        resolve();
        return;
      }

      // Unstick Web Speech synthesis queue if paused
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Failed to reset speechSynthesis state:', e);
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = config.rate || 1.0;
      utterance.pitch = config.pitch || 1.0;
      utterance.volume = config.volume ?? 1.0;

      const voices = window.speechSynthesis.getVoices();

      // Check if text contains Devanagari script (Hindi / Hinglish)
      const hasDevanagari = /[\u0900-\u097F]/.test(text);
      if (hasDevanagari) {
        utterance.lang = 'hi-IN';
        const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }
      } else if (config.webSpeechVoiceName) {
        const found = voices.find((v) => v.name === config.webSpeechVoiceName);
        if (found) {
          utterance.voice = found;
        }
      }

      let timeoutId: any = null;

      utterance.onstart = () => {
        if (timeoutId) clearTimeout(timeoutId);
        onStart?.();
      };

      utterance.onend = () => {
        if (timeoutId) clearTimeout(timeoutId);
        onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        if (timeoutId) clearTimeout(timeoutId);
        onError?.(e);
        resolve();
      };

      // Fallback timeout in case onstart/onend events are swallowed by browser
      timeoutId = setTimeout(() => {
        onEnd?.();
        resolve();
      }, Math.max(3000, text.length * 150));

      window.speechSynthesis.speak(utterance);
    });
  }

  static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn(e);
      }
    }
    if (this.audioObj) {
      this.audioObj.pause();
      this.audioObj.currentTime = 0;
      this.audioObj = null;
    }
  }
}

export interface SpeechRecognitionCallbacks {
  onInterim?: (interimText: string) => void;
  onFinal?: (finalText: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onStatusChange?: (isListening: boolean, error?: string) => void;
  onError?: (error: string) => void;
}

export class SpeechRecognitionService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static shouldBeListening: boolean = false;
  private static restartTimer: any = null;
  private static callbacks: SpeechRecognitionCallbacks = {};
  private static currentLanguage: string = 'en-US';
  private static isSupported: boolean | null = null;
  private static retryCount: number = 0;

  static checkSupport(): boolean {
    if (this.isSupported !== null) return this.isSupported;
    if (typeof window === 'undefined') return false;
    this.isSupported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    return this.isSupported;
  }

  static getRecognitionLanguage(language?: string): string {
    if (language === 'Hindi') return 'hi-IN';
    if (language === 'Hinglish') return 'hi-IN';
    return 'en-US';
  }

  static initialize(callbacks: SpeechRecognitionCallbacks, language: string = 'en-US') {
    this.callbacks = callbacks;
    this.currentLanguage = language;
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      this.isSupported = false;
      this.callbacks.onError?.('Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    this.isSupported = true;

    // Clean up prior instance if any
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.onspeechstart = null;
        this.recognition.onspeechend = null;
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = language;

      rec.onstart = () => {
        this.isListening = true;
        this.retryCount = 0;
        this.callbacks.onStatusChange?.(true);
      };

      rec.onspeechstart = () => {
        this.callbacks.onSpeechStart?.();
      };

      rec.onspeechend = () => {
        this.callbacks.onSpeechEnd?.();
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalTranscript += chunk;
          } else {
            interimTranscript += chunk;
          }
        }

        if (interimTranscript) {
          this.callbacks.onInterim?.(interimTranscript);
        }

        if (finalTranscript.trim()) {
          this.callbacks.onFinal?.(finalTranscript.trim());
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);

        if (event.error === 'no-speech') {
          // No speech detected during continuous listening window — standard timeout, do not crash or abort
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.shouldBeListening = false;
          this.isListening = false;
          this.callbacks.onStatusChange?.(false, 'Microphone permission blocked');
          this.callbacks.onError?.('Microphone access denied. Please allow microphone permissions in your browser.');
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'network') {
          this.callbacks.onError?.('Speech recognition network glitch. Reconnecting ambient microphone...');
        }
      };

      rec.onend = () => {
        this.isListening = false;

        // Auto-restart smoothly if ambient continuous listening is enabled
        if (this.shouldBeListening) {
          if (this.restartTimer) clearTimeout(this.restartTimer);

          const delay = Math.min(250 + this.retryCount * 250, 1500);
          this.restartTimer = setTimeout(() => {
            if (this.shouldBeListening && !this.isListening) {
              try {
                this.retryCount++;
                rec.start();
              } catch (e: any) {
                if (e?.name !== 'InvalidStateError') {
                  console.warn('Error auto-restarting speech recognition:', e);
                }
              }
            }
          }, delay);
        } else {
          this.callbacks.onStatusChange?.(false);
        }
      };

      this.recognition = rec;
    } catch (err: any) {
      console.error('Failed to initialize SpeechRecognition:', err);
      this.callbacks.onError?.(`Speech recognition initialization failed: ${err?.message || err}`);
    }
  }

  static start(callbacks?: SpeechRecognitionCallbacks, language?: string) {
    if (callbacks) this.callbacks = callbacks;
    if (language) this.currentLanguage = language;

    this.shouldBeListening = true;

    if (!this.recognition) {
      this.initialize(this.callbacks, this.currentLanguage);
    } else if (language && this.recognition.lang !== language) {
      try {
        this.recognition.lang = language;
      } catch {}
    }

    if (!this.recognition) return;

    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }

    try {
      this.recognition.start();
    } catch (e: any) {
      if (e?.name === 'InvalidStateError') {
        // Recognition is already active
        this.isListening = true;
        this.callbacks.onStatusChange?.(true);
      } else {
        console.warn('Recognition start exception:', e);
      }
    }
  }

  static stop() {
    this.shouldBeListening = false;
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop exception:', e);
      }
    }
    this.isListening = false;
    this.callbacks.onStatusChange?.(false);
  }

  static toggle(callbacks?: SpeechRecognitionCallbacks, language?: string): boolean {
    if (this.shouldBeListening) {
      this.stop();
      return false;
    } else {
      this.start(callbacks, language);
      return true;
    }
  }

  static updateLanguage(language: string) {
    const asrLang = this.getRecognitionLanguage(language);
    this.currentLanguage = asrLang;
    if (this.recognition) {
      try {
        const wasActive = this.shouldBeListening;
        this.recognition.lang = asrLang;
        if (wasActive && !this.isListening) {
          this.start(this.callbacks, asrLang);
        }
      } catch (e) {
        console.warn('Failed to update recognition language:', e);
      }
    }
  }
}

