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
      <p style={{ ...sub, marginBottom: 12 }}>
        <T
          it={`Rispondi in italiano usando ${selectedVerbs.join(", ")} almeno una volta. Marco ti correggerà se ci sono errori.`}
          es={`Responde en italiano usando ${selectedVerbs.join(", ")} al menos una vez. Marco te corregirá si hay errores.`}
        />
      </p>
      {hint && (
        <div
          style={{
            fontSize: 13,
            background: "#E6F1FB",
            color: "#185FA5",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 12,
          }}
        >
          <T it="Esempio:" es="Ejemplo:" />{" "}
          <i>{buildHintSentence(selectedVerbs)}</i>
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
                    ? "4px 12px 12px 12px"
                    : "12px 4px 12px 12px",
                background:
                  m.role === "amico"
                    ? "var(--color-background-secondary)"
                    : "#EEEDFE",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--color-text-primary)",
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
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Scrivi in italiano..."
          rows={2}
          style={{
            flex: 1,
            fontSize: 14,
            padding: "8px 12px",
            borderRadius: 8,
            border: "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              ...btn(),
              padding: "8px 16px",
              opacity: input.trim() && !loading ? 1 : 0.5,
            }}
          >
            Invia
          </button>
          <button
            onClick={() => setHint((h) => !h)}
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              border: "0.5px solid var(--color-border-tertiary)",
              background: "transparent",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--color-text-secondary)",
            }}
          >
            <T it="Suggerimento" es="Pista" />
          </button>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <button onClick={onComplete} style={{ ...btn(), background: '#009246', color: '#fff', border: 'none' }}>
          <T it="Finalizza sessione ✓" es="Finalizar sesión ✓" />
        </button>
      </div>
    </div>
  );
}
