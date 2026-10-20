import React, { useState, useEffect, useRef } from "react";
import { useLang } from "../../context/LangContext";
import { useCopy } from "../../copy";
import { CHARACTERS, CHARACTER_LIST, CharacterId, getCharacterInfo } from "../../curriculum/characters";
import { SCENARIOS, Scenario, getScenario } from "../../curriculum/scenarios";
import { LAB_BARGE_IN_PASSAGE, LAB_SAMPLE_TTS, mockItalianReply } from "../../content/italian";
import { audioEngine, LatencyMetric } from "../../audio/audioEngine";
import { btn, card, row, sub, badge } from "../../utils";

interface ProviderInfo {
  id: string;
  name: string;
  available: boolean;
  model?: string;
  capabilities: Record<string, boolean>;
}

export function ExperimentLab() {
  const { lang } = useLang();
  const c = useCopy();

  const [activeTab, setActiveTab] = useState<"providers" | "characters" | "audio" | "sandbox" | "diagnostics">("providers");
  const [providers, setProviders] = useState<Record<string, ProviderInfo>>({
    gemini: { id: "gemini", name: "Google Gemini", available: true, model: "gemini-flash-latest", capabilities: { chat: true, stt: true, tts: false } },
    webSpeech: { id: "webSpeech", name: "Web Speech API", available: true, capabilities: { chat: false, stt: true, tts: true } },
    mock: { id: "mock", name: "Mock / Benchmark Lab Provider", available: true, capabilities: { chat: true, stt: true, tts: true, bargeInSimulation: true } },
  });

  // Active configurations
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-flash-latest");
  const [temperature, setTemperature] = useState<number>(0.8);
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>("marco");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");

  // Audio testing state
  const [ttsSampleText, setTtsSampleText] = useState<string>(LAB_SAMPLE_TTS);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [bargeInStatus, setBargeInStatus] = useState<string>("");

  // Metrics
  const [metrics, setMetrics] = useState<LatencyMetric[]>([]);

  // Sandbox thread
  interface SandboxMessage {
    id: string;
    role: "user" | "model";
    text: string;
    translation?: string;
    showTranslation?: boolean;
    latencyMs?: number;
    timestamp: number;
  }
  const [sandboxMessages, setSandboxMessages] = useState<SandboxMessage[]>([
    {
      id: "intro-1",
      role: "model",
      text: CHARACTERS.marco.sampleGreeting,
      translation: "Hi! Nice to meet you, I am Marco. Shall we chat in Italian?",
      showTranslation: false,
      timestamp: Date.now(),
    },
  ]);
  const [sandboxInput, setSandboxInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  // Sync metrics from audioEngine
  useEffect(() => {
    setMetrics(audioEngine.getMetrics());
    const unsub = audioEngine.subscribe(() => {
      setIsSpeaking(audioEngine.isSpeaking());
      setIsListening(audioEngine.isListening());
      setMetrics(audioEngine.getMetrics());
    });
    return unsub;
  }, []);

  // Fetch server provider capabilities
  useEffect(() => {
    fetch("/api/lab/providers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.providers) {
          setProviders(data.providers);
        }
      })
      .catch((e) => console.warn("Could not fetch /api/lab/providers:", e));
  }, []);

  const activeChar = getCharacterInfo(selectedCharacterId);
  const activeScenario = getScenario(selectedScenarioId);

  // Handler: Test TTS
  const handlePlayTts = async (textToPlay: string, charId = selectedCharacterId) => {
    const char = getCharacterInfo(charId);
    setIsSpeaking(true);
    await audioEngine.speak(textToPlay, {
      characterId: char.id,
      pitch: char.voice.pitch,
      rate: char.voice.rate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleStopTts = () => {
    audioEngine.stop();
    setIsSpeaking(false);
  };

  // Handler: Test STT
  const handleToggleListening = () => {
    if (isListening) {
      audioEngine.stopSpeechRecognition();
      setIsListening(false);
      return;
    }

    setLiveTranscript("");
    setIsListening(true);
    audioEngine.startSpeechRecognition({
      lang: "it-IT",
      onResult: (text, isFinal) => {
        setLiveTranscript(text);
        if (isFinal) {
          setIsListening(false);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setLiveTranscript(String(err?.message || "Recognition error"));
      },
      onEnd: () => setIsListening(false),
    });
  };

  // Handler: Test Barge-In
  const handleTestBargeIn = async () => {
    setBargeInStatus(lang === "es" ? "Reproduciendo texto largo... Interrumpe hablando o pulsando 'Interrumpir'" : "Playing long passage... Interrupt by speaking or clicking 'Interrupt'");
    const passage = LAB_BARGE_IN_PASSAGE;

    audioEngine.registerBargeIn(() => {
      setBargeInStatus(lang === "es" ? "⚡ ¡Interrupción (Barge-in) detectada con éxito!" : "⚡ Barge-in interruption successfully triggered!");
    });

    await handlePlayTts(passage, selectedCharacterId);
  };

  // Handler: Sandbox Send
  const handleSendSandbox = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = sandboxInput.trim() || liveTranscript.trim();
    if (!text || isSending) return;

    const userMsg: SandboxMessage = {
      id: "u-" + Date.now(),
      role: "user",
      text,
      timestamp: Date.now(),
    };

    setSandboxMessages((prev) => [...prev, userMsg]);
    setSandboxInput("");
    setLiveTranscript("");
    setIsSending(true);

    const startTime = Date.now();
    try {
      if (selectedProvider === "mock") {
        // Mock provider simulated reply
        await new Promise((r) => setTimeout(r, 450));
        const duration = Date.now() - startTime;
        const mockReply: SandboxMessage = {
          id: "m-" + Date.now(),
          role: "model",
          text: mockItalianReply(activeChar.name, activeChar.city),
          translation: `I understood you well! [${activeChar.name} - ${activeChar.city}] Test response generated by mock provider.`,
          showTranslation: false,
          latencyMs: duration,
          timestamp: Date.now(),
        };
        setSandboxMessages((prev) => [...prev, mockReply]);
        audioEngine.logMetric({
          operation: "chat_turn",
          provider: "mock",
          characterId: activeChar.id,
          durationMs: duration,
          success: true,
          notes: `Simulated turn with ${activeChar.name}`,
        });
      } else {
        // Upstream chat
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...sandboxMessages, userMsg].map((m) => ({
              role: m.role,
              text: m.text,
            })),
            characterId: activeChar.id,
            uiLang: lang,
            model: selectedModel,
            temperature,
            scenario: activeScenario
              ? {
                  setting: activeScenario.setting,
                  characterRole: activeScenario.characterRole,
                  objective: activeScenario.objective.it,
                }
              : undefined,
          }),
        });

        const data = await res.json();
        const duration = Date.now() - startTime;

        if (res.ok && data?.reply) {
          const replyMsg: SandboxMessage = {
            id: "m-" + Date.now(),
            role: "model",
            text: data.reply,
            translation: data.translation,
            showTranslation: false,
            latencyMs: duration,
            timestamp: Date.now(),
          };
          setSandboxMessages((prev) => [...prev, replyMsg]);
          audioEngine.logMetric({
            operation: "chat_turn",
            provider: selectedProvider,
            characterId: activeChar.id,
            durationMs: duration,
            success: true,
            notes: `Turn latency: ${duration}ms, model: ${data.modelUsed || selectedModel}`,
          });

          // Auto-play voice if WebSpeech available
          if (audioEngine.isTtsSupported()) {
            handlePlayTts(data.reply, activeChar.id);
          }
        } else {
          audioEngine.logMetric({
            operation: "chat_turn",
            provider: selectedProvider,
            characterId: activeChar.id,
            durationMs: duration,
            success: false,
            notes: `Error: ${data?.error || "server_error"}`,
          });
        }
      }
    } catch (err: any) {
      console.error("Sandbox turn failed:", err);
      audioEngine.logMetric({
        operation: "chat_turn",
        provider: selectedProvider,
        durationMs: Date.now() - startTime,
        success: false,
        notes: String(err?.message || "network_error"),
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handler: Export Logs
  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metrics, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `experiment_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)" }}>
              🧪 {c("lab.title")}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-secondary)" }}>
              {c("lab.subtitle")}
            </p>
          </div>
          {/* Active Status Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ ...badge({ bg: "var(--color-background-secondary)", color: "var(--color-text-primary)" }), padding: "4px 10px", fontSize: 12, border: "1px solid var(--color-border-secondary)" }}>
              ⚡ {selectedProvider} ({selectedModel})
            </span>
            <span style={{ ...badge({ bg: activeChar.badgeBg, color: activeChar.badgeFg }), padding: "4px 10px", fontSize: 12 }}>
              {activeChar.avatarEmoji} {activeChar.name} ({activeChar.city})
            </span>
            <span style={{ ...badge({ bg: "var(--color-background-secondary)", color: isSpeaking ? "var(--color-primary)" : "var(--color-text-secondary)" }), padding: "4px 10px", fontSize: 12, border: "1px solid var(--color-border-secondary)" }}>
              🔊 {isSpeaking ? (lang === "es" ? "Reproduciendo" : "Speaking") : (lang === "es" ? "Audio listo" : "Audio idle")}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border-secondary)", paddingBottom: 12, marginBottom: 20, overflowX: "auto" }}>
        {[
          { id: "providers", label: c("lab.tabProviders"), icon: "⚙️" },
          { id: "characters", label: c("lab.tabCharacters"), icon: "👥" },
          { id: "audio", label: c("lab.tabAudio"), icon: "🎙️" },
          { id: "sandbox", label: c("lab.tabSandbox"), icon: "💬" },
          { id: "diagnostics", label: c("lab.tabDiagnostics"), icon: "📊" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                ...btn(active),
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Providers & Models */}
      {activeTab === "providers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={card}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--color-text-primary)" }}>
              {lang === "es" ? "Proveedores Disponibles" : "Available Providers"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {Object.values(providers).map((p) => {
                const isSelected = selectedProvider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProvider(p.id)}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--color-border-secondary)"}`,
                      background: isSelected ? "var(--color-background-secondary)" : "var(--color-background-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <strong style={{ fontSize: 14, color: "var(--color-text-primary)" }}>{p.name}</strong>
                      <span style={{ fontSize: 12, color: p.available ? "var(--color-success)" : "var(--color-text-secondary)" }}>
                        {p.available ? "● Ready" : "○ Not configured"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                      {p.id === "gemini" && (lang === "es" ? "Modelo LLM multimodal primario con clave segura del servidor." : "Primary multimodal LLM provider via secure server proxy.")}
                      {p.id === "webSpeech" && (lang === "es" ? "APIs nativas del navegador para síntesis y reconocimiento." : "Browser-native SpeechSynthesis and SpeechRecognition APIs.")}
                      {p.id === "mock" && (lang === "es" ? "Proveedor simulado para pruebas de latencia y offline." : "Deterministic latency simulator for offline benchmarking.")}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.capabilities.chat && <span style={{ ...badge({ bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }), fontSize: 10, padding: "2px 6px" }}>Chat</span>}
                      {p.capabilities.tts && <span style={{ ...badge({ bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }), fontSize: 10, padding: "2px 6px" }}>TTS</span>}
                      {p.capabilities.stt && <span style={{ ...badge({ bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }), fontSize: 10, padding: "2px 6px" }}>STT</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--color-text-primary)" }}>
              {lang === "es" ? "Configuración de Parámetros del Modelo" : "Model Parameter Tuning"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                  {c("lab.activeModel")}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border-secondary)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    fontSize: 14,
                  }}
                >
                  <option value="gemini-flash-latest">gemini-flash-latest (Recommended)</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Pinned version)</option>
                  <option value="gemini-3.6-flash">gemini-3.6-flash</option>
                  <option value="mock-v1">mock-v1 (Simulated)</option>
                </select>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {c("lab.temperature")}
                  </label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--color-primary)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>
                  <span>{lang === "es" ? "Preciso / Rígido" : "Precise"}</span>
                  <span>{lang === "es" ? "Creativo / Natural" : "Creative"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Character Roster */}
      {activeTab === "characters" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {CHARACTER_LIST.map((char) => {
            const isSelected = selectedCharacterId === char.id;
            return (
              <div
                key={char.id}
                style={{
                  ...card,
                  borderTop: `4px solid ${char.accentColor}`,
                  border: isSelected ? `2px solid var(--color-primary)` : "1px solid var(--color-border-secondary)",
                  background: isSelected ? "var(--color-background-secondary)" : "var(--color-background-primary)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 32 }}>{char.avatarEmoji}</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, color: "var(--color-text-primary)" }}>{char.name}</h3>
                        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                          {char.city} ({char.region}) • {char.age} {lang === "es" ? "años" : "yo"}
                        </span>
                      </div>
                    </div>
                    <span style={{ ...badge({ bg: char.badgeBg, color: char.badgeFg }), padding: "3px 8px", fontSize: 11 }}>
                      {char.difficultyLabel[lang]}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.4 }}>
                    {char.tagline[lang]}
                  </p>

                  <div style={{ ...row, padding: "8px 10px", marginBottom: 12, fontSize: 12 }}>
                    <div>
                      <strong style={{ color: "var(--color-text-primary)" }}>{lang === "es" ? "Voz: " : "Voice: "}</strong>
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {char.voice.accentLabel[lang]} • {lang === "es" ? "Tono" : "Pitch"}: {char.voice.pitch}x, {lang === "es" ? "Ritmo" : "Rate"}: {char.voice.rate}x
                      </span>
                    </div>
                  </div>

                  <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 4, textTransform: "uppercase" }}>
                      {lang === "es" ? "Saludo de muestra" : "Sample Greeting"}
                    </div>
                    <div style={{ fontSize: 13, fontStyle: "italic", color: "var(--color-text-primary)" }}>
                      "{char.sampleGreeting}"
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => handlePlayTts(char.sampleGreeting, char.id)}
                    style={{
                      ...btn(false),
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 12,
                      padding: "8px 10px",
                    }}
                  >
                    <span>🔊</span>
                    <span>{c("lab.playVoice")}</span>
                  </button>
                  <button
                    onClick={() => setSelectedCharacterId(char.id)}
                    style={{
                      ...btn(isSelected),
                      flex: 1,
                      fontSize: 12,
                      padding: "8px 10px",
                    }}
                  >
                    {isSelected ? (lang === "es" ? "✓ Seleccionado" : "✓ Active") : (lang === "es" ? "Elegir" : "Select")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Speech & Audio Testing Workbench */}
      {activeTab === "audio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* TTS Workbench */}
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "var(--color-text-primary)" }}>
              🔊 {lang === "es" ? "Evaluación de Síntesis de Voz (TTS)" : "Text-to-Speech (TTS) Benchmarking"}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--color-text-secondary)" }}>
              {lang === "es"
                ? "Prueba la entonación, timbre y cadencia italiana para cada personaje."
                : "Evaluate Italian prosody, cadence, and voice responsiveness per character persona."}
            </p>

            <textarea
              rows={3}
              value={ttsSampleText}
              onChange={(e) => setTtsSampleText(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-border-secondary)",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
                fontSize: 14,
                marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => handlePlayTts(ttsSampleText, selectedCharacterId)}
                disabled={isSpeaking}
                style={{ ...btn(true), display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>🔊</span>
                <span>{c("lab.testSpeech")}</span>
              </button>
              <button
                onClick={handleStopTts}
                disabled={!isSpeaking}
                style={{ ...btn(false), display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>⏹</span>
                <span>{c("lab.stopVoice")}</span>
              </button>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>
                {lang === "es" ? "Voz activa:" : "Target:"} {activeChar.name} ({activeChar.city})
              </span>
            </div>
          </div>

          {/* STT Workbench */}
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "var(--color-text-primary)" }}>
              🎙️ {lang === "es" ? "Evaluación de Reconocimiento de Voz (STT)" : "Speech-to-Text (STT) Recognition"}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--color-text-secondary)" }}>
              {lang === "es"
                ? "Dicta en italiano para verificar la transcripción en tiempo real y la latencia."
                : "Dictate in Italian to evaluate real-time transcription accuracy and latency."}
            </p>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <button
                onClick={handleToggleListening}
                style={{
                  ...btn(isListening),
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderColor: isListening ? "var(--color-danger)" : undefined,
                }}
              >
                <span>{isListening ? "🔴" : "🎙️"}</span>
                <span>{isListening ? (lang === "es" ? "Detener grabación" : "Stop listening") : c("lab.testListening")}</span>
              </button>
              {isListening && (
                <span style={{ fontSize: 13, color: "var(--color-danger)", fontWeight: 600 }}>
                  ● {c("lab.recordingVoice")}
                </span>
              )}
            </div>

            <div
              style={{
                minHeight: 60,
                padding: "10px 14px",
                background: "var(--color-background-secondary)",
                borderRadius: 8,
                border: "1px solid var(--color-border-secondary)",
                color: liveTranscript ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                fontStyle: liveTranscript ? "normal" : "italic",
                fontSize: 14,
              }}
            >
              {liveTranscript || (lang === "es" ? "(El texto reconocido aparecerá aquí en tiempo real)" : "(Recognized Italian text will stream here)")}
            </div>
          </div>

          {/* Barge-in Interruption Test */}
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "var(--color-text-primary)" }}>
              ⚡ {c("lab.bargeInTest")}
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--color-text-secondary)" }}>
              {lang === "es"
                ? "Simula la capacidad de interrumpir al personaje mientras habla (requisito clave para llamadas en vivo)."
                : "Tests immediate barge-in audio interruption when the learner begins speaking."}
            </p>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <button onClick={handleTestBargeIn} style={{ ...btn(false), display: "flex", alignItems: "center", gap: 6 }}>
                <span>▶️</span>
                <span>{lang === "es" ? "Iniciar Prueba de Interrupción" : "Start Interruption Test"}</span>
              </button>
              {isSpeaking && (
                <button onClick={handleStopTts} style={{ ...btn(true), borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                  ⚡ {lang === "es" ? "Interrumpir Ahora" : "Interrupt Now"}
                </button>
              )}
            </div>

            {bargeInStatus && (
              <div style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
                {bargeInStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Live Sandbox */}
      {activeTab === "sandbox" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Scenario Picker Toolbar */}
          <div style={{ ...card, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                {lang === "es" ? "Escenario de Práctica:" : "Preset Scenario:"}
              </label>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--color-border-secondary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 13,
                }}
              >
                <option value="">{lang === "es" ? "Charla libre (Sin escenario)" : "Free chat (No scenario)"}</option>
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.title[lang]} ({s.level})
                  </option>
                ))}
              </select>

              {activeScenario && (
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  🎯 {activeScenario.objective[lang]}
                </span>
              )}
            </div>
          </div>

          {/* Thread */}
          <div
            style={{
              ...card,
              minHeight: 320,
              maxHeight: 440,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 16,
            }}
          >
            {sandboxMessages.map((msg) => {
              const isModel = msg.role === "model";
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isModel ? "flex-start" : "flex-end",
                    maxWidth: "80%",
                    background: isModel ? "var(--color-background-secondary)" : "var(--color-primary)",
                    color: isModel ? "var(--color-text-primary)" : "var(--color-on-primary)",
                    borderRadius: 14,
                    padding: "10px 14px",
                    boxShadow: "var(--shadow-sm)",
                    border: isModel ? "1px solid var(--color-border-secondary)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.8 }}>
                      {isModel ? `${activeChar.avatarEmoji} ${activeChar.name}` : "👤 Learner"}
                    </span>
                    {msg.latencyMs !== undefined && (
                      <span style={{ fontSize: 10, opacity: 0.7 }}>
                        • ⚡ {msg.latencyMs}ms
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                    {msg.text}
                  </div>

                  {/* Actions for Model Messages: TTS & Translation */}
                  {isModel && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, paddingTop: 6, borderTop: "1px solid var(--color-border-secondary)" }}>
                      <button
                        onClick={() => handlePlayTts(msg.text, activeChar.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-primary)",
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: 0,
                        }}
                      >
                        <span>🔊</span>
                        <span>{lang === "es" ? "Escuchar" : "Listen"}</span>
                      </button>

                      {msg.translation && (
                        <button
                          onClick={() => {
                            setSandboxMessages((prev) =>
                              prev.map((m) => (m.id === msg.id ? { ...m, showTranslation: !m.showTranslation } : m))
                            );
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-text-secondary)",
                            fontSize: 12,
                            padding: 0,
                          }}
                        >
                          {msg.showTranslation ? c("chat.hideTranslation") : c("chat.translate")}
                        </button>
                      )}
                    </div>
                  )}

                  {isModel && msg.showTranslation && msg.translation && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "var(--color-text-secondary)", fontStyle: "italic", borderLeft: "2px solid var(--color-primary)", paddingLeft: 8 }}>
                      {msg.translation}
                    </div>
                  )}
                </div>
              );
            })}
            {isSending && (
              <div style={{ alignSelf: "flex-start", padding: "8px 12px", borderRadius: 10, background: "var(--color-background-secondary)", fontSize: 12, color: "var(--color-text-secondary)" }}>
                ⏳ {activeChar.name} {lang === "es" ? "está respondiendo..." : "is typing..."}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendSandbox} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
              placeholder={c("lab.inputPlaceholder")}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--color-border-secondary)",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={handleToggleListening}
              style={{
                ...btn(isListening),
                padding: "10px 14px",
                borderColor: isListening ? "var(--color-danger)" : undefined,
              }}
            >
              {isListening ? "🔴" : "🎙️"}
            </button>
            <button
              type="submit"
              disabled={isSending || (!sandboxInput.trim() && !liveTranscript.trim())}
              style={{ ...btn(true), padding: "10px 16px" }}
            >
              {c("lab.sendText")}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Diagnostics & Logs */}
      {activeTab === "diagnostics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--color-text-primary)" }}>
              {c("lab.tabDiagnostics")} ({metrics.length})
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => audioEngine.clearMetrics()} style={{ ...btn(false), fontSize: 12, padding: "6px 12px" }}>
                {c("lab.clearLogs")}
              </button>
              <button onClick={handleExportLogs} style={{ ...btn(false), fontSize: 12, padding: "6px 12px" }}>
                💾 {c("lab.exportLogs")}
              </button>
            </div>
          </div>

          <div style={card}>
            {metrics.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
                {lang === "es" ? "No hay registros de experimentos aún. Realiza pruebas de audio o chat para ver la latencia." : "No experiment logs yet. Perform audio or sandbox tests to record latency."}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border-secondary)", textAlign: "left", color: "var(--color-text-secondary)" }}>
                      <th style={{ padding: "8px 10px" }}>Timestamp</th>
                      <th style={{ padding: "8px 10px" }}>Operation</th>
                      <th style={{ padding: "8px 10px" }}>Provider</th>
                      <th style={{ padding: "8px 10px" }}>Latency</th>
                      <th style={{ padding: "8px 10px" }}>Status</th>
                      <th style={{ padding: "8px 10px" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid var(--color-border-tertiary)" }}>
                        <td style={{ padding: "8px 10px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                          {new Date(m.timestamp).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {m.operation.toUpperCase()}
                        </td>
                        <td style={{ padding: "8px 10px", color: "var(--color-text-secondary)" }}>
                          {m.provider}
                        </td>
                        <td style={{ padding: "8px 10px", color: m.durationMs < 500 ? "var(--color-success)" : "var(--color-primary)", fontWeight: 700 }}>
                          {m.durationMs}ms
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ color: m.success ? "var(--color-success)" : "var(--color-danger)" }}>
                            {m.success ? "✓ PASS" : "✗ FAIL"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "var(--color-text-secondary)", fontSize: 12 }}>
                          {m.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
