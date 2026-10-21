/**
 * Speech Service supporting server-side Gemini TTS audio and browser Web Speech API
 */

export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Play server-side Gemini TTS audio
   */
  public async speakWithGemini(
    text: string,
    options: {
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): Promise<boolean> {
    this.stopSpeaking();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: options.voiceName || 'Fenrir'
        })
      });

      if (!res.ok) {
        throw new Error(`TTS server returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error('No audio payload received');
      }

      const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(audioSrc);
      this.currentAudioElement = audio;

      audio.onplay = () => {
        if (options.onStart) options.onStart();
      };

      audio.onended = () => {
        this.currentAudioElement = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        if (options.onError) options.onError();
      };

      await audio.play();
      return true;
    } catch {
      if (options.onError) options.onError();
      return false;
    }
  }

  /**
   * Speak Italian text using browser speech synthesis (it-IT)
   */
  public speakItalian(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      gender?: 'male' | 'female';
      onBoundary?: (charIndex: number) => void;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): void {
    if (!this.synth) {
      if (options.onEnd) options.onEnd();
      return;
    }

    this.stopSpeaking();

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    if (!cleanText) {
      if (options.onEnd) options.onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'it-IT';
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.0;

    const voices = this.synth.getVoices();
    const italianVoices = voices.filter((v) => v.lang.startsWith('it'));

    if (italianVoices.length > 0) {
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (options.gender === 'female') {
        chosenVoice = italianVoices.find(
          (v) =>
            v.name.toLowerCase().includes('alice') ||
            v.name.toLowerCase().includes('federica') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('elisa')
        );
      } else {
        chosenVoice = italianVoices.find(
          (v) =>
            v.name.toLowerCase().includes('luca') ||
            v.name.toLowerCase().includes('giorgio') ||
            v.name.toLowerCase().includes('cosimo') ||
            v.name.toLowerCase().includes('male')
        );
      }

      utterance.voice = chosenVoice || italianVoices[0];
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      if (options.onError) options.onError();
    };

    if (options.onBoundary) {
      utterance.onboundary = (e) => {
        if (options.onBoundary) options.onBoundary(e.charIndex);
      };
    }

    this.synth.speak(utterance);
  }

  /**
   * Smart dispatcher: calls Gemini Live TTS first, falls back to Web Speech synthesis
   */
  public async speakSmart(
    text: string,
    options: {
      provider?: string;
      voiceName?: string;
      gender?: 'male' | 'female';
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): Promise<void> {
    const isGeminiLive = options.provider === 'gemini_live';

    if (isGeminiLive) {
      const success = await this.speakWithGemini(text, {
        voiceName: options.voiceName,
        onStart: options.onStart,
        onEnd: options.onEnd,
        onError: () => {
          this.speakItalian(text, {
            rate: options.rate || 0.95,
            gender: options.gender,
            onStart: options.onStart,
            onEnd: options.onEnd,
            onError: options.onError
          });
        }
      });

      if (!success) {
        this.speakItalian(text, {
          rate: options.rate || 0.95,
          gender: options.gender,
          onStart: options.onStart,
          onEnd: options.onEnd,
          onError: options.onError
        });
      }
    } else {
      this.speakItalian(text, {
        rate: options.rate || 0.95,
        gender: options.gender,
        onStart: options.onStart,
        onEnd: options.onEnd,
        onError: options.onError
      });
    }
  }

  public stopSpeaking(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Play standard DTMF dual-tone frequency
   */
  public playDtmfTone(key: string, durationMs = 160): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const dtmfFreqs: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477]
    };

    const freqs = dtmfFreqs[key];
    if (!freqs) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationMs / 1000);
    osc2.stop(now + durationMs / 1000);
  }

  /**
   * Realistic European phone ringtone burst (425 Hz)
   */
  public playRingtoneBurst(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(425, now);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.setValueAtTime(0.12, now + 0.95);
    gain.gain.linearRampToValueAtTime(0.0, now + 1.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.05);
  }

  /**
   * Phone call hangup tone (3 quick disconnect beeps)
   */
  public playHangupTone(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.28;

      osc.frequency.setValueAtTime(425, start);
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.setValueAtTime(0.0, start + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.18);
    }
  }
}

export const speechService = new SpeechService();

/**
 * Speech recognition helper for Italian speech-to-text
 */
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onEnd?: () => void,
  onError?: (err: unknown) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | null {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognitionClass) {
    return null;
  }

  const recognition = new SpeechRecognitionClass();
  recognition.lang = 'it-IT';
  recognition.continuous = false;
  recognition.interimResults = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    onResult(transcript);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (err: any) => {
    if (onError) onError(err);
  };

  return recognition;
}
