import { useState, useMemo } from "react";
import { useLang, T } from "../../context/LangContext";
import { riordinaItems } from "../../data/riordina";
import { shuffle, btn, sub } from "../../utils";

export default function Riordina({
  selectedVerbs,
  onError,
  onComplete,
}: {
  selectedVerbs: string[];
  onError: () => void;
  onComplete: () => void;
}) {
  const { lang } = useLang();
  const filtered = useMemo(
    () => riordinaItems.filter((q) => q.verbs.some((v) => selectedVerbs.includes(v))),
    [selectedVerbs]
  );
  const [itemIdx, setItemIdx] = useState(0);
  const item = filtered[itemIdx];
  const [available, setAvailable] = useState(() => shuffle(item.words));
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const pick = (word: string, idx: number) => {
    if (result) return;
    setSelected((s) => [...s, word]);
    setAvailable((a) => a.filter((_, i) => i !== idx));
  };
  const unpick = (idx: number) => {
    if (result) return;
    const word = selected[idx];
    setSelected((s) => s.filter((_, i) => i !== idx));
    setAvailable((a) => [...a, word]);
  };
  const check = () => {
    const attempt = selected.join(" ").toLowerCase();
    const isCorrect = attempt === item.answer;
    setResult(isCorrect ? "correct" : "wrong");
    if (!isCorrect) onError();
  };
  const next = () => {
    const ni = (itemIdx + 1) % filtered.length;
    setItemIdx(ni);
    setAvailable(shuffle(filtered[ni].words));
    setSelected([]);
    setResult(null);
  };
  const reset = () => {
    setAvailable(shuffle(item.words));
    setSelected([]);
    setResult(null);
  };
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Metti le parole nell'ordine giusto per formare una frase corretta."
          es="Pon las palabras en el orden correcto para formar una frase."
        />{" "}
        <span style={{ fontSize: 12 }}>
          ({itemIdx + 1}/{filtered.length})
        </span>
      </p>

      {/* selected area */}
      <div
        style={{
          minHeight: 48,
          padding: "10px 14px",
          background: result === "correct" ? "#E1F5EE" : result === "wrong" ? "#FCEBEB" : "var(--color-background-secondary)",
          borderRadius: 10,
          border: "0.5px solid var(--color-border-tertiary)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {selected.length === 0 && (
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
            <T it="Clicca sulle parole qui sotto..." es="Haz clic en las palabras abajo..." />
          </span>
        )}
        {selected.map((w, i) => (
          <span
            key={i}
            onClick={() => unpick(i)}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              cursor: result ? "default" : "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* available words */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {available.map((w, i) => (
          <span
            key={i}
            onClick={() => pick(w, i)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "var(--color-primary-softer)",
              color: "var(--color-primary-hover)",
              border: "1px solid var(--color-primary-soft)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              transition: "background 0.15s ease, transform 0.08s ease",
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {result === "wrong" && (
        <p style={{ fontSize: 13, color: "#A32D2D", marginBottom: 10 }}>
          <T it="Non è corretto. La risposta giusta è:" es="No es correcto. La respuesta correcta es:" />{" "}
          <i>{item.answer}</i>
        </p>
      )}
      {result === "correct" && item.translationEs && (
        <p style={{ fontSize: 13, color: "#0F6E56", marginBottom: 10 }}>
          ✓ <T it="Perfetto!" es="¡Perfecto!" />{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            ({item.translationEs})
          </span>
        </p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {!result ? (
          <button onClick={check} disabled={selected.length === 0} className="btn-primary" style={{ ...btn(), fontWeight: 600 }}>
            <T it="Verifica" es="Verificar" />
          </button>
        ) : (
          <>
            <button onClick={reset} className="btn-secondary" style={btn()}>
              <T it="Ricomincia" es="Reiniciar" />
            </button>
            <button onClick={next} className="btn-secondary" style={btn()}>
              <T it="Frase successiva →" es="Siguiente frase →" />
            </button>
            <button onClick={onComplete} className="btn-primary" style={{ ...btn(), fontWeight: 600 }}>
              <T it="Continua →" es="Continuar →" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
