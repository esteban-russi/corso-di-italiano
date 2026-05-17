import { useState } from "react";
import { useLang, T } from "../../context/LangContext";
import { completaItems } from "../../data/completa";
import { shuffle, btn, row, sub } from "../../utils";

export default function Completa() {
  const { lang } = useLang();
  const [items] = useState(() => shuffle(completaItems).slice(0, 6));
  const [answers, setAnswers] = useState<string[]>(Array(6).fill(""));
  const [checked, setChecked] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const update = (i: number, v: string) => {
    const a = [...answers];
    a[i] = v;
    setAnswers(a);
  };
  const correct = (i: number) =>
    answers[i].trim().toLowerCase() === items[i].answer;
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Completa ogni frase con la forma corretta del verbo."
          es="Completa cada frase con la forma correcta del verbo."
        />
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, i) => {
          const parts = item.sentence.split("___");
          return (
            <div key={i} style={{ ...row, flexWrap: "wrap" }}>
              <span
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  minWidth: 24,
                  color: "var(--color-text-secondary)",
                }}
              >
                {i + 1}.
              </span>
              <span style={{ fontSize: 14, flex: 1 }}>
                {parts[0]}
                <input
                  value={answers[i]}
                  onChange={(e) => update(i, e.target.value)}
                  disabled={checked}
                  placeholder="___"
                  style={{
                    width: 100,
                    fontSize: 14,
                    padding: "4px 8px",
                    borderRadius: 6,
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
                    margin: "0 4px",
                  }}
                />
                {parts[1]}
              </span>
              {checked && !correct(i) && (
                <span style={{ fontSize: 12, color: "#A32D2D", fontWeight: 500 }}>
                  → {items[i].answer}
                </span>
              )}
              {checked && correct(i) && (
                <span style={{ fontSize: 12, color: "#0F6E56", fontWeight: 500 }}>
                  ✓
                </span>
              )}
              {showHints && !checked && (
                <span style={{ fontSize: 11, color: "#185FA5", fontStyle: "italic" }}>
                  {lang === "it" ? item.hintIt : item.hintEs}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <>
            <button onClick={() => setChecked(true)} style={btn()}>
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
              <T it={showHints ? "Nascondi suggerimenti" : "Suggerimenti"} es={showHints ? "Ocultar pistas" : "Pistas"} />
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setAnswers(Array(6).fill(""));
              setChecked(false);
            }}
            style={btn()}
          >
            <T it="Riprova" es="Intentar de nuevo" />
          </button>
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
