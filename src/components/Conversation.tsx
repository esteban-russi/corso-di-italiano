import { useState, useRef, useEffect, useMemo } from "react";
import { useLang } from "../context/LangContext";
import { useProfile } from "../context/ProfileContext";
import { TOPICS, verbColor } from "../config";
import { VERBS, getVerb } from "../curriculum/verbs";
import { UNITS } from "../curriculum/path";
import { badge, btn, formatMessage, card, modalPanel, scrim } from "../utils";
import { useCopy } from "../copy";
import { CONVERSATION_OPENERS, CONVERSATION_REPLIES, marcoGreeting } from "../content/italian";
import { CHARACTERS, CHARACTER_LIST, CharacterId, getCharacterInfo } from "../curriculum/characters";
import { SCENARIOS, Scenario, getScenario } from "../curriculum/scenarios";
import { audioEngine } from "../audio/audioEngine";

type Msg = {
  role: "marco" | "user";
  text: string;
  characterId?: CharacterId;
  translation?: string;
  timestamp?: number;
};

const STORE = "corso-convo";
const HISTORY_WINDOW = 20;

function defaultFocusVerbs(completedUnits: string[]): string[] {
  const seen = new Set<string>();
  for (const uid of completedUnits) UNITS.find((u) => u.id === uid)?.verbIds.forEach((v) => seen.add(v));
  const pool = seen.size >= 3 ? [...seen] : VERBS.filter((v) => v.level <= 2).map((v) => v.id);
  return pool.slice(0, 5);
}

interface SavedConvo {
  msgs: Msg[];
  verbs: string[];
  topic: string;
  characterId?: CharacterId;
  scenarioId?: string;
}

function loadSaved(): SavedConvo | null {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Conversation() {
  const { lang } = useLang();
  const c = useCopy();
  const profile = useProfile();
  const saved = useMemo(loadSaved, []);

  const [characterId, setCharacterId] = useState<CharacterId>(saved?.characterId ?? "marco");
  const [scenarioId, setScenarioId] = useState<string>(saved?.scenarioId ?? "");
  const [focusVerbs, setFocusVerbs] = useState<string[]>(saved?.verbs ?? defaultFocusVerbs(profile.completedUnits));
  const [topic, setTopic] = useState<string>(saved?.topic ?? profile.topics[0] ?? "");
  const [editControls, setEditControls] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(saved?.msgs ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [shownTranslations, setShownTranslations] = useState<Set<number>>(new Set());
  const [playingMsgIndex, setPlayingMsgIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeChar = getCharacterInfo(characterId);
  const activeScenario = getScenario(scenarioId);
  const started = msgs.length > 0;

  // Generate initial greeting for a character
  const getGreeting = (charId: CharacterId, verbs: string[]): string => {
    if (activeScenario) {
      return activeScenario.starterMessage;
    }
    if (charId === "marco") {
      const list = verbs.map((v) => getVerb(v)?.infinitive).filter(Boolean).join(", ");
      return marcoGreeting(list, profile.name);
    }
    return getCharacterInfo(charId).sampleGreeting;
  };

  const start = () => {
    setMsgs([
      {
        role: "marco",
        text: getGreeting(characterId, focusVerbs),
        characterId,
        timestamp: Date.now(),
      },
    ]);
  };

  const toggleTranslation = (index: number) => {
    setShownTranslations((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Audio Playback (Plan 02 TTS)
  const handlePlayAudio = async (text: string, index: number, charId: CharacterId = characterId) => {
    if (playingMsgIndex === index) {
      audioEngine.stop();
      setPlayingMsgIndex(null);
      return;
    }
    audioEngine.stop();
    setPlayingMsgIndex(index);
    const char = getCharacterInfo(charId);
    await audioEngine.speak(text, {
      characterId: char.id,
      pitch: char.voice.pitch,
      rate: char.voice.rate,
      onStart: () => setPlayingMsgIndex(index),
      onEnd: () => setPlayingMsgIndex(null),
      onError: () => setPlayingMsgIndex(null),
    });
  };

  // Speech Recognition (Voice Notes / STT)
  const handleToggleVoiceInput = () => {
    if (isRecording) {
      audioEngine.stopSpeechRecognition();
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    audioEngine.startSpeechRecognition({
      lang: "it-IT",
      onResult: (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      onError: () => setIsRecording(false),
      onEnd: () => setIsRecording(false),
    });
  };

  useEffect(() => {
    const dataToSave: SavedConvo = {
      msgs,
      verbs: focusVerbs,
      topic,
      characterId,
      scenarioId,
    };
    localStorage.setItem(STORE, JSON.stringify(dataToSave));
  }, [msgs, focusVerbs, topic, characterId, scenarioId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, shownTranslations]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;

    if (isRecording) {
      audioEngine.stopSpeechRecognition();
      setIsRecording(false);
    }

    const history: Msg[] = [
      ...(msgs.length ? msgs : [{ role: "marco" as const, text: getGreeting(characterId, focusVerbs), characterId }]),
      { role: "user" as const, text: clean, timestamp: Date.now() },
    ];
    setMsgs(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uiLang: lang,
          characterId: activeChar.id,
          verbs: focusVerbs.map((v) => getVerb(v)?.infinitive ?? v),
          topic: TOPICS.find((t) => t.id === topic)?.it ?? "",
          name: profile.name,
          weakVerbs: [...new Set(profile.weakKeys().map((k) => k.split(":")[0]))]
            .map((id) => getVerb(id)?.infinitive ?? id)
            .slice(0, 6),
          scenario: activeScenario
            ? {
                setting: activeScenario.setting,
                characterRole: activeScenario.characterRole,
                objective: activeScenario.objective.it,
              }
            : undefined,
          messages: history
            .slice(-HISTORY_WINDOW)
            .map((m) => ({ role: m.role === "marco" ? "model" : "user", text: m.text })),
        }),
      });

      const data = await res.json();
      const replyText =
        data.error === "rate_limited"
          ? c("state.rateLimited")
          : data.error
          ? c("state.serverUnavailable")
          : data.reply || "...";

      const newMsg: Msg = {
        role: "marco",
        text: replyText,
        characterId: activeChar.id,
        translation: data.error ? "" : data.translation ?? "",
        timestamp: Date.now(),
      };
      setMsgs((m) => [...m, newMsg]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "marco", text: c("state.connectionError"), characterId: activeChar.id },
      ]);
    }
    setLoading(false);
  };

  const switchCharacter = (newCharId: CharacterId) => {
    setCharacterId(newCharId);
    audioEngine.stop();
    setPlayingMsgIndex(null);
    if (started) {
      const greetingText = getGreeting(newCharId, focusVerbs);
      setMsgs([
        {
          role: "marco",
          text: greetingText,
          characterId: newCharId,
          timestamp: Date.now(),
        },
      ]);
      setShownTranslations(new Set());
    }
  };

  const switchScenario = (newScenarioId: string) => {
    setScenarioId(newScenarioId);
    audioEngine.stop();
    setPlayingMsgIndex(null);
    const sc = getScenario(newScenarioId);
    const targetCharId = sc ? sc.suggestedCharacter : characterId;
    setCharacterId(targetCharId);
    if (started) {
      const greetingText = sc ? sc.starterMessage : getGreeting(targetCharId, focusVerbs);
      setMsgs([
        {
          role: "marco",
          text: greetingText,
          characterId: targetCharId,
          timestamp: Date.now(),
        },
      ]);
      setShownTranslations(new Set());
    }
  };

  const restart = () => {
    audioEngine.stop();
    setPlayingMsgIndex(null);
    setMsgs([]);
    setShownTranslations(new Set());
    localStorage.removeItem(STORE);
  };

  const toggleFocus = (id: string) =>
    setFocusVerbs((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 6 ? [...p, id] : p));

  const suggestions: string[] = started ? CONVERSATION_REPLIES : CONVERSATION_OPENERS;

  // Extract session corrections for the recap modal
  const sessionCorrections = msgs
    .filter((m) => m.role === "marco" && m.text.includes("📝"))
    .map((m) => {
      const match = m.text.match(/📝\s*["“]([^"”]+)["”]\s*→\s*[*_]*([^*_]+)[*_]*[^\n]*/);
      return match ? match[0] : null;
    })
    .filter(Boolean) as string[];

  return (
    <div>
      {/* Focus verbs & Character Bar */}
      <div style={{ marginBottom: 14 }}>
        {/* Character switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-secondary)" }}>
            {c("chat.switchCharacter")}:
          </span>
          {CHARACTER_LIST.map((char) => {
            const isSelected = characterId === char.id;
            return (
              <button
                key={char.id}
                onClick={() => switchCharacter(char.id)}
                style={{
                  ...btn(isSelected),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  fontSize: 12,
                  borderRadius: 20,
                }}
              >
                <span>{char.avatarEmoji}</span>
                <span>{char.name}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>({char.city})</span>
              </button>
            );
          })}
        </div>

        {/* Focus verbs pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-secondary)" }}>
            {lang === "en" ? "Focus verbs:" : "Verbos objetivo:"}
          </span>
          {focusVerbs.map((v) => {
            const clr = verbColor(v);
            return (
              <span key={v} style={{ ...badge(clr), padding: "2px 10px", fontSize: 12 }}>
                {getVerb(v)?.infinitive}
              </span>
            );
          })}
          <button
            onClick={() => setEditControls((e) => !e)}
            className="btn-ghost"
            style={{ ...btn(editControls), padding: "3px 10px", fontSize: 12 }}
          >
            {editControls ? (lang === "en" ? "Done" : "Listo") : (lang === "en" ? "Change" : "Cambiar")}
          </button>
        </div>

        {/* Collapsible Verb/Scenario/Topic Editor */}
        {editControls && (
          <div className="fade-in" style={{ ...card, padding: 12, marginBottom: 10, background: "var(--color-background-secondary)" }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                {c("chat.scenario")}:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <button
                  onClick={() => switchScenario("")}
                  style={{ ...btn(scenarioId === ""), padding: "3px 8px", fontSize: 11.5, borderRadius: 14 }}
                >
                  💬 {c("chat.freeConversation")}
                </button>
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => switchScenario(sc.id)}
                    style={{ ...btn(scenarioId === sc.id), padding: "3px 8px", fontSize: 11.5, borderRadius: 14 }}
                  >
                    {sc.icon} {sc.title[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                {lang === "en" ? "Select verbs:" : "Seleccionar verbos:"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {VERBS.slice(0, 14).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleFocus(v.id)}
                    style={{ ...btn(focusVerbs.includes(v.id)), padding: "4px 8px", fontSize: 11.5, fontWeight: 600 }}
                  >
                    {v.infinitive}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                {lang === "en" ? "Preferred topic:" : "Tema preferido:"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTopic(t.id === topic ? "" : t.id)}
                    style={{ ...btn(topic === t.id), padding: "4px 9px", fontSize: 11.5, fontWeight: 600 }}
                  >
                    {t.emoji} {lang === "en" ? t.en : t.es}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Scenario Banner */}
        {activeScenario && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, background: "var(--color-primary-softer)", border: "1px solid var(--color-primary-soft)", marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{activeScenario.icon}</span>
            <div style={{ fontSize: 12.5, color: "var(--color-text-primary)" }}>
              <strong>{activeScenario.title[lang]}:</strong> {activeScenario.objective[lang]}
            </div>
          </div>
        )}
      </div>

      {!started ? (
        <div style={{ textAlign: "center", padding: "28px 16px" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }} aria-hidden="true">{activeChar.avatarEmoji}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
            {lang === "en" ? `Talk with ${activeChar.name}` : `Habla con ${activeChar.name}`}
          </div>
          <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 18px" }}>
            {activeChar.tagline[lang]}
          </p>

          <button onClick={start} className="btn-primary" style={{ ...btn(), padding: "13px 28px", fontWeight: 600, fontSize: 15 }}>
            {lang === "en" ? "Start chatting →" : "Empezar a charlar →"}
          </button>
        </div>
      ) : (
        <>
          {/* Main Thread */}
          <div ref={scrollRef} style={{ minHeight: 220, maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, padding: "4px 0" }}>
            {msgs.map((m, i) => {
              const isUser = m.role === "user";
              const msgChar = getCharacterInfo(m.characterId || characterId);
              const canTranslate = !isUser && m.translation !== undefined;
              const isPlaying = playingMsgIndex === i;
              const shown = shownTranslations.has(i);

              return (
                <div key={i} style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 14,
                      fontSize: 14,
                      lineHeight: 1.55,
                      background: isUser ? "var(--color-primary)" : "var(--color-background-secondary)",
                      color: isUser ? "var(--color-on-primary)" : "var(--color-text-primary)",
                      border: isUser ? "none" : "1px solid var(--color-border-tertiary)",
                    }}
                  >
                    {!isUser && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                        {msgChar.avatarEmoji} {msgChar.name}
                      </div>
                    )}
                    {isUser ? m.text : formatMessage(m.text)}
                  </div>

                  {/* Actions for Character Messages */}
                  {!isUser && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => handlePlayAudio(m.text, i, msgChar.id)}
                        className="btn-ghost"
                        style={{
                          ...btn(),
                          padding: "2px 8px",
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: isPlaying ? "var(--color-primary)" : "var(--color-text-secondary)",
                          border: "none",
                          background: "transparent",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>{isPlaying ? "⏹" : "🔊"}</span>
                        <span>{isPlaying ? c("chat.stopAudio") : c("chat.playAudio")}</span>
                      </button>

                      {canTranslate && (
                        <button
                          onClick={() => toggleTranslation(i)}
                          className="btn-ghost"
                          aria-expanded={shown}
                          style={{
                            ...btn(),
                            padding: "2px 8px",
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "var(--color-text-secondary)",
                            border: "none",
                            background: "transparent",
                          }}
                        >
                          {shown ? c("chat.hideTranslation") : c("chat.translate")}
                        </button>
                      )}
                    </div>
                  )}

                  {canTranslate && shown && (
                    <div
                      className="fade-in"
                      style={{
                        marginTop: 2,
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontSize: 13,
                        lineHeight: 1.55,
                        fontStyle: m.translation ? "normal" : "italic",
                        background: "var(--color-background-tint)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border-tertiary)",
                      }}
                    >
                      {m.translation || c("chat.translationUnavailable")}
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", padding: "6px 10px" }}>
                {activeChar.name} {lang === "en" ? "is typing…" : "está escribiendo…"}
              </div>
            )}
          </div>

          {/* Quick-reply suggestions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => (s.endsWith("...?") ? setInput(s.replace("...?", " ")) : send(s))}
                disabled={loading}
                className="btn-ghost"
                style={{ ...btn(), padding: "5px 11px", fontSize: 12.5 }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Learner Input Bar with Voice Note Microphone */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
              placeholder={isRecording ? c("chat.micListening") : lang === "en" ? "Write in Italian…" : "Escribe en italiano…"}
              style={{
                flex: 1,
                padding: "12px 14px",
                fontSize: 15,
                borderRadius: 12,
                border: `1px solid ${isRecording ? "var(--color-danger)" : "var(--color-border-secondary)"}`,
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            />

            {/* Microphone button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              title={c("chat.micStart")}
              style={{
                ...btn(isRecording),
                padding: "12px 14px",
                borderColor: isRecording ? "var(--color-danger)" : undefined,
              }}
            >
              {isRecording ? "🔴" : "🎙️"}
            </button>

            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="btn-primary"
              style={{ ...btn(), padding: "12px 20px", fontWeight: 600 }}
            >
              {lang === "en" ? "Send" : "Enviar"}
            </button>
          </div>

          {/* Bottom Bar: Session Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <button
              onClick={() => setShowRecap(true)}
              className="btn-ghost"
              style={{ ...btn(), padding: "5px 11px", fontSize: 12 }}
            >
              📊 {c("chat.recapTitle")}
            </button>
            <button onClick={restart} className="btn-ghost" style={{ ...btn(), padding: "5px 11px", fontSize: 12 }}>
              ↺ {lang === "en" ? "New conversation" : "Nueva conversación"}
            </button>
          </div>
        </>
      )}

      {/* Recap Modal (Plan 01 Deliverable 11) */}
      {showRecap && (
        <div style={scrim(3)} onClick={() => setShowRecap(false)}>
          <div style={{ ...modalPanel(16), maxWidth: 460, width: "90%", padding: 24, textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--color-text-primary)" }}>
              📊 {c("chat.recapTitle")}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--color-text-secondary)" }}>
              {c("chat.recapSubtitle")}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-primary)" }}>{msgs.length}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{lang === "es" ? "Mensajes" : "Messages"}</div>
              </div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-success)" }}>{focusVerbs.length}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{lang === "es" ? "Verbos objetivo" : "Target verbs"}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8 }}>
                {c("chat.correctionsNoted")}
              </div>
              {sessionCorrections.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--color-success)", fontStyle: "italic", padding: "6px 0" }}>
                  ✓ {c("chat.noCorrections")}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                  {sessionCorrections.map((corr, idx) => (
                    <div key={idx} style={{ fontSize: 12.5, padding: "6px 10px", background: "var(--color-background-secondary)", borderRadius: 8, color: "var(--color-text-primary)" }}>
                      {corr}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setShowRecap(false)} style={{ ...btn(true), padding: "8px 16px" }}>
                {c("chat.continueChat")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
