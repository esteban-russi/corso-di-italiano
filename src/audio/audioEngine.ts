// Modular Audio Engine supporting Web Speech API (TTS & STT),
// voice note recording (MediaRecorder), and latency benchmarking.
// Plan 02 — Voice & audio & Plan 000 Experimentation workbench.

import { CharacterId, getCharacterInfo } from "../curriculum/characters";

export interface LatencyMetric {
  id: string;
  timestamp: number;
  operation: "tts" | "stt" | "chat_turn";
  provider: string;
  durationMs: number;
  characterId?: string;
  success: boolean;
  notes?: string;
}

export type AudioEngineListener = () => void;

class AudioEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingInternal = false;
  private voices: SpeechSynthesisVoice[] = [];
  private recognition: any = null;
  private isListeningInternal = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private listeners: Set<AudioEngineListener> = new Set();
  private metricsLog: LatencyMetric[] = [];
  private activeBargeInHandler: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: AudioEngineListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public getMetrics(): LatencyMetric[] {
    return [...this.metricsLog];
  }

  public clearMetrics() {
    this.metricsLog = [];
    this.notify();
  }

  public logMetric(metric: Omit<LatencyMetric, "id" | "timestamp">) {
    const entry: LatencyMetric = {
      ...metric,
      id: Math.random().toString(36).slice(2, 9),
      timestamp: Date.now(),
    };
    this.metricsLog.unshift(entry);
    if (this.metricsLog.length > 50) this.metricsLog.pop();
    this.notify();
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getItalianVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (!this.voices.length) this.voices = this.synth.getVoices();
    return this.voices.filter((v) => v.lang.startsWith("it"));
  }

  public getBestVoiceForCharacter(characterId: CharacterId): SpeechSynthesisVoice | null {
    const itVoices = this.getItalianVoices();
    if (!itVoices.length) return null;

    const char = getCharacterInfo(characterId);
    const isFemale = char.voice.gender === "female";

    // Try finding known preferred voice names
    const preferredNames = isFemale
      ? ["Alice", "Federica", "Chiara", "Elsa", "Google italiano"]
      : ["Luca", "Cosimo", "Diego", "Google italiano"];

    for (const name of preferredNames) {
      const match = itVoices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match;
    }

    return itVoices[0];
  }

  public isTtsSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public isSttSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }

  public isListening(): boolean {
    return this.isListeningInternal;
  }

  /**
   * Play text using Web Speech API with character-tailored pitch and rate.
   */
  public speak(
    text: string,
    options: {
      characterId?: CharacterId;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        options.onError?.(new Error("SpeechSynthesis not available"));
        resolve();
        return;
      }

      this.stop(); // Stop any ongoing speech

      const char = getCharacterInfo(options.characterId || "marco");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "it-IT";
      utterance.pitch = options.pitch ?? char.voice.pitch;
      utterance.rate = options.rate ?? char.voice.rate;

      const voice = this.getBestVoiceForCharacter(char.id);
      if (voice) utterance.voice = voice;

      const startTime = Date.now();
      let resolved = false;

      const finish = (success = true, notes = "") => {
        if (resolved) return;
        resolved = true;
        clearTimeout(fallbackTimer);
        this.isSpeakingInternal = false;
        this.currentUtterance = null;
        this.logMetric({
          operation: "tts",
          provider: "webSpeech",
          characterId: char.id,
          durationMs: Date.now() - startTime,
          success,
          notes,
        });
        if (success) options.onEnd?.();
        this.notify();
        resolve();
      };

      // In headless browser environments, SpeechSynthesis onend may not fire
      const estimatedMs = Math.min(3000, Math.max(800, (text.length / 15) * 800));
      const fallbackTimer = setTimeout(() => {
        finish(true, `Completed via fallback timer (${estimatedMs}ms)`);
      }, estimatedMs);

      utterance.onstart = () => {
        this.isSpeakingInternal = true;
        options.onStart?.();
        this.notify();
      };

      utterance.onend = () => {
        finish(true, `Spoke ${text.length} chars at rate ${utterance.rate}`);
      };

      utterance.onerror = (e) => {
        options.onError?.(e);
        finish(false, `TTS error: ${e.error || "unknown"}`);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech immediately (supports barge-in interruption).
   */
  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingInternal = false;
      this.currentUtterance = null;
      if (this.activeBargeInHandler) {
        this.activeBargeInHandler();
        this.activeBargeInHandler = null;
      }
      this.notify();
    }
  }

  public registerBargeIn(handler: () => void) {
    this.activeBargeInHandler = handler;
  }

  /**
   * Listen for Italian speech from the learner using SpeechRecognition.
   */
  public startSpeechRecognition(options: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError?: (err: any) => void;
    onEnd?: () => void;
    lang?: string;
  }): () => void {
    if (typeof window === "undefined") return () => {};

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      options.onError?.(new Error("SpeechRecognition API not supported on this browser"));
      return () => {};
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = options.lang || "it-IT";
      recognition.continuous = false;
      recognition.interimResults = true;

      const startTime = Date.now();

      recognition.onstart = () => {
        this.isListeningInternal = true;
        this.notify();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        options.onResult(text, Boolean(finalTranscript));

        // If the learner begins speaking while TTS is playing, barge-in!
        if (text.trim().length > 0 && this.isSpeakingInternal) {
          this.stop();
        }
      };

      recognition.onerror = (event: any) => {
        this.isListeningInternal = false;
        this.logMetric({
          operation: "stt",
          provider: "webSpeech",
          durationMs: Date.now() - startTime,
          success: false,
          notes: `Recognition error: ${event.error || "unknown"}`,
        });
        options.onError?.(event);
        this.notify();
      };

      recognition.onend = () => {
        this.isListeningInternal = false;
        options.onEnd?.();
        this.notify();
      };

      this.recognition = recognition;
      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch {}
      };
    } catch (e) {
      options.onError?.(e);
      return () => {};
    }
  }

  public stopSpeechRecognition() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListeningInternal = false;
      this.notify();
    }
  }
}

export const audioEngine = new AudioEngine();
