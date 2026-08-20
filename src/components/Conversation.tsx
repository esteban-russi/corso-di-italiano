import { useState, useRef, useEffect, useMemo } from "react";
import { useLang } from "../context/LangContext";
import { useProfile } from "../context/ProfileContext";
import { TOPICS, verbColor } from "../config";
import { VERBS, getVerb } from "../curriculum/verbs";
import { UNITS } from "../curriculum/path";
import { badge, btn, formatMessage } from "../utils";
import { useCopy } from "../copy";
import { CONVERSATION_OPENERS, CONVERSATION_REPLIES, marcoGreeting } from "../content/italian";

type Msg = { role: "marco" | "user"; text: string };
const STORE = "corso-convo";

/** Default focus verbs: those the learner has practised, else common ones. */
function defaultFocusVerbs(completedUnits: string[]): string[] {
  const seen = new Set<string>();
  for (const uid of completedUnits) UNITS.find((u) => u.id === uid)?.verbIds.forEach((v) => seen.add(v));
  const pool = seen.size >= 3 ? [...seen] : VERBS.filter((v) => v.level <= 2).map((v) => v.id);
  return pool.slice(0, 5);
}

function loadSaved(): { msgs: Msg[]; verbs: string[]; topic: string } | null {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Conversation() {
  const { lang } = useLang();
  const c = useCopy();
  const profile = useProfile();
  const saved = useMemo(loadSaved, []);

  const [focusVerbs, setFocusVerbs] = useState<string[]>(saved?.verbs ?? defaultFocusVerbs(profile.completedUnits));
  const [topic, setTopic] = useState<string>(saved?.topic ?? profile.topics[0] ?? "");
  const [editVerbs, setEditVerbs] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(saved?.msgs ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const started = msgs.length > 0;

  // Persist and auto-scroll.
  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify({ msgs, verbs: focusVerbs, topic }));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, focusVerbs, topic]);

  const greeting = (): string => {
    const list = focusVerbs.map((v) => getVerb(v)?.infinitive).filter(Boolean).join(", ");
    return marcoGreeting(list, profile.name);
  };

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const history: Msg[] = [
      ...(msgs.length ? msgs : [{ role: "marco" as const, text: greeting() }]),
      { role: "user" as const, text: clean },
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
          verbs: focusVerbs.map((v) => getVerb(v)?.infinitive ?? v),
          topic: TOPICS.find((t) => t.id === topic)?.it ?? "",
          name: profile.name,
          weakVerbs: [...new Set(profile.weakKeys().map((k) => k.split(":")[0]))].map((id) => getVerb(id)?.infinitive ?? id).slice(0, 6),
          messages: history.map((m) => ({ role: m.role === "marco" ? "model" : "user", text: m.text })),
        }),
      });
      const data = await res.json();
      // Server errors arrive as a code, not as prose: interface text is always
      // rendered in the learner's language (see docs/04-interface-language.md).
      const text =
        data.error === "rate_limited"
          ? c("state.rateLimited")
          : data.error
            ? c("state.serverUnavailable")
            : data.reply || "...";
      setMsgs((m) => [...m, { role: "marco", text }]);
    } catch {
      setMsgs((m) => [...m, { role: "marco", text: c("state.connectionError") }]);
    }
    setLoading(false);
  };

  const start = () => { setMsgs([{ role: "marco", text: greeting() }]); };
  const restart = () => { setMsgs([]); localStorage.removeItem(STORE); };

  const toggleFocus = (id: string) =>
    setFocusVerbs((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 6 ? [...p, id] : p));

  const suggestions: string[] = started ? CONVERSATION_REPLIES : CONVERSATION_OPENERS;

  return (
    <div>
      {/* Focus verbs + topic */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-secondary)" }}>
            {lang === "en" ? "Focus verbs:" : "Verbos objetivo:"}
          </span>
          {focusVerbs.map((v) => {
            const c = verbColor(v);
            return <span key={v} style={{ ...badge(c), padding: "2px 10px", fontSize: 12 }}>{getVerb(v)?.infinitive}</span>;
          })}
          <button onClick={() => setEditVerbs((e) => !e)} className="btn-ghost" style={{ ...btn(), padding: "3px 10px", fontSize: 12 }}>
            {editVerbs ? (lang === "en" ? "Done" : "Listo") : (lang === "en" ? "Change" : "Cambiar")}
          </button>
        </div>
        {editVerbs && (
          <div className="fade-in" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {VERBS.map((v) => (
              <button key={v.id} onClick={() => toggleFocus(v.id)} style={{ ...btn(focusVerbs.includes(v.id)), padding: "5px 10px", fontSize: 12, fontWeight: 600 }}>
                {v.infinitive}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-text-secondary)", alignSelf: "center" }}>
            {lang === "en" ? "Topic:" : "Tema:"}
          </span>
          {TOPICS.map((t) => (
            <button key={t.id} onClick={() => setTopic(t.id === topic ? "" : t.id)} style={{ ...btn(topic === t.id), padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
              {t.emoji} {lang === "en" ? t.en : t.es}
            </button>
          ))}
        </div>
      </div>

      {!started ? (
        <div style={{ textAlign: "center", padding: "28px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }} aria-hidden="true">💬</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            {lang === "en" ? "Talk with Marco" : "Habla con Marco"}
          </div>
          <p style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 18px" }}>
            {lang === "en"
              ? "A relaxed chat with a patient Italian friend. He steers the conversation toward your focus verbs and corrects only what matters."
              : "Una charla relajada con un amigo italiano paciente. Lleva la conversación hacia tus verbos objetivo y corrige solo lo importante."}
          </p>
          <button onClick={start} className="btn-primary" style={{ ...btn(), padding: "13px 28px", fontWeight: 600, fontSize: 15 }}>
            {lang === "en" ? "Start chatting →" : "Empezar a charlar →"}
          </button>
        </div>
      ) : (
        <>
          <div ref={scrollRef} style={{ minHeight: 220, maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, padding: "4px 0" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: 14, fontSize: 14, lineHeight: 1.55,
                  background: m.role === "user" ? "var(--color-primary)" : "var(--color-background-secondary)",
                  color: m.role === "user" ? "var(--color-on-primary)" : "var(--color-text-primary)",
                  border: m.role === "user" ? "none" : "1px solid var(--color-border-tertiary)",
                }}>
                  {m.role === "marco" ? formatMessage(m.text) : m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic", padding: "6px 10px" }}>
                Marco {lang === "en" ? "is typing…" : "está escribiendo…"}
              </div>
            )}
          </div>

          {/* Quick-reply suggestions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => (s.endsWith("...?") ? setInput(s.replace("...?", " ")) : send(s))} disabled={loading} className="btn-ghost" style={{ ...btn(), padding: "5px 11px", fontSize: 12.5 }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
              placeholder={lang === "en" ? "Write in Italian…" : "Escribe en italiano…"}
              style={{ flex: 1, padding: "12px 14px", fontSize: 15, borderRadius: 12, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
            />
            <button onClick={() => send(input)} disabled={loading || !input.trim()} className="btn-primary" style={{ ...btn(), padding: "12px 20px", fontWeight: 600 }}>
              {lang === "en" ? "Send" : "Enviar"}
            </button>
          </div>
          <div style={{ marginTop: 10, textAlign: "right" }}>
            <button onClick={restart} className="btn-ghost" style={{ ...btn(), padding: "5px 11px", fontSize: 12 }}>
              ↺ {lang === "en" ? "New conversation" : "Nueva conversación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
