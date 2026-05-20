import { useState, useMemo } from "react";
import { useLang, T } from "../../context/LangContext";
import { buildChatPrompt } from "../../prompts/chat";
import { btn, sub, formatMessage } from "../../utils";
import { VERB_REGISTRY } from "../../data/verbs";

const NATIVE_LANGUAGE = import.meta.env.VITE_NATIVE_LANGUAGE || "español";

function buildGreeting(selectedVerbs: string[]): string {
  const verbList = selectedVerbs.join(", ");
  return `Ciao! 😊 Io sono Marco, il tuo amico italiano. Oggi pratichiamo i verbi **${verbList}**. Vuoi parlare di un argomento in particolare? Possiamo parlare del weekend, dei viaggi, della cucina... tu cosa preferisci?`;
}

function buildHintSentence(selectedVerbs: string[]): string {
  const conj: Record<string, string> = {};
  for (const v of VERB_REGISTRY) {
    if (selectedVerbs.includes(v.id)) conj[v.infinitive] = v.conjugations[0]; // io form
  }
  const parts = Object.entries(conj).map(([inf, form]) => `${form} (${inf})`);
  return parts.length > 0
    ? `"Io ${parts.join(" e ")}..."`
    : `"Prova a usare i verbi selezionati in una frase!"`;
}

export default function Chat({
  selectedVerbs,
  onComplete,
}: {
  selectedVerbs: string[];
  onComplete: () => void;
}) {
  const { lang } = useLang();
  const greeting = useMemo(() => buildGreeting(selectedVerbs), [selectedVerbs]);
  const [msgs, setMsgs] = useState<{ role: "amico" | "user"; text: string }[]>([
    { role: "amico", text: greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, text: input };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const history = newMsgs.map((m) => ({
        role: m.role === "amico" ? "model" : "user",
        parts: [{ text: m.text }],
      }));
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const systemPrompt = buildChatPrompt(selectedVerbs, NATIVE_LANGUAGE);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: history,
            generationConfig: { maxOutputTokens: 1000 },
          }),
        }
      );
      const data = await res.json();
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
      setMsgs((m) => [...m, { role: "amico" as const, text: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "amico" as const, text: "(Errore di connessione — riprova!)" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <p style={{ ...sub, flex: 1, margin: 0 }}>
          <T
            it={`Rispondi in italiano usando ${selectedVerbs.join(", ")} almeno una volta. Marco ti correggerà se ci sono errori.`}
            es={`Responde en italiano usando ${selectedVerbs.join(", ")} al menos una vez. Marco te corregirá si hay errores.`}
          />
        </p>
        <button
          onClick={() => setHint((h) => !h)}
          className="btn-ghost"
          style={{ ...btn(), padding: "5px 10px", fontSize: 12, flexShrink: 0 }}
        >
          💡 <T it={hint ? "Nascondi" : "Suggerimento"} es={hint ? "Ocultar" : "Pista"} />
        </button>
      </div>
      {hint && (
        <div
          className="fade-in"
          style={{
            fontSize: 13,
            background: "var(--color-primary-softer)",
            color: "var(--color-primary-hover)",
            border: "1px solid var(--color-primary-soft)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span aria-hidden="true">💡</span>
          <div>
            <strong style={{ fontWeight: 600 }}>
              <T it="Esempio:" es="Ejemplo:" />
            </strong>{" "}
            <i>{buildHintSentence(selectedVerbs)}</i>
          </div>
        </div>
      )}
      <div
        style={{
          minHeight: 180,
          maxHeight: 320,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 14,
          padding: "4px 0",
        }}
      >
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: m.role === "amico" ? "flex-start" : "flex-end",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "10px 14px",
                borderRadius:
                  m.role === "amico"
                    ? "4px 14px 14px 14px"
                    : "14px 4px 14px 14px",
                background:
                  m.role === "amico"
                    ? "var(--color-background-secondary)"
                    : "var(--color-primary)",
                border:
                  m.role === "amico"
                    ? "1px solid var(--color-border-tertiary)"
                    : "none",
                fontSize: 14,
                lineHeight: 1.6,
                color: m.role === "amico" ? "var(--color-text-primary)" : "#fff",
                boxShadow: m.role === "user" ? "var(--shadow-sm)" : "none",
              }}
            >
              {m.role === "amico" && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  Amico italiano
                </div>
              )}
              {m.role === "amico" ? formatMessage(m.text) : m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              background: "var(--color-background-secondary)",
              borderRadius: "4px 12px 12px 12px",
              maxWidth: "60%",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
              Sta scrivendo...
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "stretch",
          padding: 6,
          border: "1px solid var(--color-border-secondary)",
          borderRadius: 14,
          background: "var(--color-background-primary)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Scrivi in italiano... (Invio per inviare)"
          rows={2}
          style={{
            flex: 1,
            fontSize: 14,
            padding: "8px 10px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "var(--color-text-primary)",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
            minHeight: 56,
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="btn-primary"
          aria-label="Invia messaggio"
          style={{
            ...btn(),
            padding: "0 22px",
            minWidth: 110,
            fontWeight: 700,
            fontSize: 15,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 10,
            alignSelf: "stretch",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 16 }}>➤</span>
          <T it="Invia" es="Enviar" />
        </button>
      </div>

      {/* End-of-session footer — visually separated from the send action */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 18,
          borderTop: "1px dashed var(--color-border-secondary)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)" }}>
          <T
            it="Quando ti senti pronto, termina la conversazione."
            es="Cuando te sientas listo, termina la conversación."
          />
        </div>
        <button
          onClick={onComplete}
          className="btn-secondary"
          style={{
            ...btn(),
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ✓ <T it="Termina la sessione" es="Terminar la sesión" />
        </button>
      </div>
    </div>
  );
}
