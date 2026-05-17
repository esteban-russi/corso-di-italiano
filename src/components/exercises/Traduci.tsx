import { useState, useMemo } from "react";
import { useLang, T, t } from "../../context/LangContext";
import { traduciItems } from "../../data/traduci";
import { shuffle, btn, sub } from "../../utils";

export default function Traduci({
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
    () => traduciItems.filter((q) => q.verbs.some((v) => selectedVerbs.includes(v))),
    [selectedVerbs]
  );
  const [items] = useState(() => shuffle(filtered).slice(0, 4));
  const [answers, setAnswers] = useState<string[]>(Array(items.length).fill(""));
  const [checked, setChecked] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const update = (i: number, v: string) => {
    const a = [...answers];
    a[i] = v;
    setAnswers(a);
  };
  const correct = (i: number) =>
    items[i].accept.some(
      (a) =>
        answers[i].trim().toLowerCase().replace(/[?.!,]/g, "").replace(/\s+/g, " ") ===
        a.toLowerCase()
    );
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Traduci queste frasi dallo spagnolo all'italiano usando fare, andare o dire."
          es="Traduce estas frases del español al italiano usando fare, andare o dire."
        />
      </p>
      <div style={{ display: "grid", gap: 14 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              padding: "12px 16px",
              background: "var(--color-background-secondary)",
              borderRadius: 10,
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, minWidth: 24, color: "var(--color-text-secondary)" }}>
                {i + 1}.
              </span>
              <span style={{ fontSize: 14, fontStyle: "italic" }}>🇪🇸 {item.es}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 34 }}>
              <span style={{ fontSize: 14 }}>🇮🇹</span>
              <input
                value={answers[i]}
                onChange={(e) => update(i, e.target.value)}
                disabled={checked}
                placeholder={t(lang, "Scrivi in italiano...", "Escribe en italiano...")}
                style={{
                  flex: 1,
                  fontSize: 14,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `0.5px solid ${
                    checked
                      ? correct(i)
                        ? "#1D9E75"
                        : "#E24B4A"
                      : "var(--color-border-secondary)"
                  }`,
                  background: checked
                    ? correct(i)
                      ? "#E1F5EE"
                      : "#FCEBEB"
                    : "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
            </div>
            {showHints && !checked && (
              <p style={{ fontSize: 11, color: "#185FA5", marginTop: 6, marginLeft: 34, fontStyle: "italic" }}>
                {lang === "it" ? item.hintIt : item.hintEs}
              </p>
            )}
            {checked && !correct(i) && (
              <p style={{ fontSize: 12, color: "#A32D2D", marginTop: 6, marginLeft: 34 }}>
                → {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <>
            <button onClick={() => {
              setChecked(true);
              const errorCount = answers.filter((_, i) => !correct(i)).length;
              for (let e = 0; e < errorCount; e++) onError();
            }} style={btn()}>
              <T it="Verifica" es="Verificar" />
            </button>
            <button
              onClick={() => setShowHints((h) => !h)}
              style={{
                ...btn(),
                fontSize: 12,
                padding: "6px 16px",
                color: "var(--color-text-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                background: "transparent",
              }}
            >
              <T it={showHints ? "Nascondi" : "Suggerimenti"} es={showHints ? "Ocultar" : "Pistas"} />
            </button>
          </>
        ) : (
          <>
          <button
            onClick={() => {
              setAnswers(Array(items.length).fill(""));
              setChecked(false);
            }}
            style={btn()}
          >
            <T it="Riprova" es="Intentar de nuevo" />
          </button>
          <button onClick={onComplete} style={{ ...btn(), background: '#009246', color: '#fff', border: 'none' }}>
            <T it="Continua →" es="Continuar →" />
          </button>
          </>
        )}
        {checked && (
          <span style={{ ...sub, alignSelf: "center" }}>
            {answers.filter((_, i) => correct(i)).length}/{items.length}{" "}
            <T it="corrette" es="correctas" />
          </span>
        )}
      </div>
    </div>
  );
}
