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

