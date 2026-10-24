// Server-side audio synthesis, transcription, and provider coordination.
// Plan 02 — Voice & audio (Phase 1 TTS & STT) and Plan 000 Testing Workbench.

import { getCharacter } from "./characters.mjs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

/**
 * Diagnostic provider status for the experimentation app.
 * Invariant: Never leak secret keys or sensitive auth details.
 */
export function getProviderStatus() {
  return {
    gemini: {
      id: "gemini",
      name: "Google Gemini",
      available: Boolean(GEMINI_API_KEY),
      model: GEMINI_MODEL,
      capabilities: {
        chat: true,
        stt: Boolean(GEMINI_API_KEY),
        tts: false, // Server-side native audio stream or multimodal
      },
    },
    webSpeech: {
      id: "webSpeech",
      name: "Web Speech API (Browser Native)",
      available: true,
      capabilities: {
        chat: false,
        stt: true, // SpeechRecognition
        tts: true, // SpeechSynthesis
      },
    },
    mock: {
      id: "mock",
      name: "Mock / Benchmark Lab Provider",
      available: true,
      capabilities: {
        chat: true,
        stt: true,
        tts: true,
        bargeInSimulation: true,
      },
    },
    elevenlabs: {
      id: "elevenlabs",
      name: "ElevenLabs (Italian Prosody)",
      available: Boolean(process.env.ELEVENLABS_API_KEY),
      capabilities: {
        chat: false,
        stt: false,
        tts: true,
      },
    },
    openai: {
      id: "openai",
      name: "OpenAI Audio / Whisper",
      available: Boolean(process.env.OPENAI_API_KEY),
      capabilities: {
        chat: true,
        stt: true,
        tts: true,
      },
    },
  };
}

/**
 * Handle TTS requests.
 * Returns voice configuration for client-side or audio payload for server synthesis.
 */
export async function handleTtsRequest({ text, characterId = "marco", provider = "webSpeech" }) {
  const start = Date.now();
  const char = getCharacter(characterId);

  if (provider === "mock") {
    // Simulated speech generation latency
    const simulatedLatency = Math.min(250, 40 + Math.floor((text.length / 10) * 15));
    return {
      provider: "mock",
      characterId,
      voice: char.voice,
      text,
      latencyMs: simulatedLatency,
      format: "mock-synthesis",
      durationSec: Math.max(1.2, (text.split(/\s+/).length / 2.5)),
    };
  }

  // Web Speech metadata recommendation
  const latencyMs = Date.now() - start;
  return {
    provider: "webSpeech",
    characterId,
    voice: char.voice,
    text,
    latencyMs,
    clientInstruction: "use_speech_synthesis",
    lang: "it-IT",
    preferredVoices: [
      "Alice", // Apple / macOS standard Italian
      "Federica", // Apple
      "Luca", // Apple
      "Google italiano", // Chrome
      "Microsoft Elsa Online (Natural) - Italian (Italy)", // Edge
      "it-IT",
    ],
  };
}

/**
 * Handle STT requests.
 * Transcribes audio via Gemini Multimodal if key exists, or provides simulated transcription.
 */
export async function handleSttRequest({ audioBase64, mimeType = "audio/webm", provider = "gemini", simulatedText = "" }) {
  const start = Date.now();

  if (provider === "mock" || !GEMINI_API_KEY) {
    const transcript = simulatedText || "Vorrei un caffè per favore, grazie!";
    return {
      provider: "mock",
      transcript,
      confidence: 0.94,
      latencyMs: Date.now() - start + 80,
    };
  }

  if (provider === "gemini" && audioBase64 && GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: "You are an Italian speech transcription engine. Listen carefully to this audio and output ONLY the exact Italian words spoken by the speaker, without any commentary, quotes, punctuation corrections, or translation.",
                  },
                  {
                    inlineData: {
                      mimeType,
                      data: audioBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
          }),
        }
      );

      /** @type {{ candidates?: { content?: { parts?: { text?: string }[] } }[] }} */
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      return {
        provider: "gemini",
        transcript: rawText,
        confidence: 0.92,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      console.error("Gemini STT transcription failed:", err);
      return {
        provider: "gemini",
        transcript: "",
        error: "transcription_failed",
        latencyMs: Date.now() - start,
      };
    }
  }

  return {
    provider: "unknown",
    transcript: "",
    error: "no_audio_provided",
    latencyMs: Date.now() - start,
  };
}
