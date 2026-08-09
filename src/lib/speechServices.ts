import { VoiceEngineConfig } from '../types';

export class SpeechSynthesisService {
  private static audioObj: HTMLAudioElement | null = null;

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

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = config.rate || 1.0;
      utterance.pitch = config.pitch || 1.0;
      utterance.volume = config.volume ?? 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (config.webSpeechVoiceName) {
        const found = voices.find((v) => v.name === config.webSpeechVoiceName);
        if (found) {
          utterance.voice = found;
        }
      }

      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        onEnd?.();
        resolve();
      };
      utterance.onerror = (e) => {
        onError?.(e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.audioObj) {
      this.audioObj.pause();
      this.audioObj.currentTime = 0;
      this.audioObj = null;
    }
  }
}
