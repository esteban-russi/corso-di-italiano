import { useState, useMemo } from "react";
import { useLang, T } from "../../context/LangContext";
import { multipleChoiceItems } from "../../data/multipleChoice";
import { shuffle, btn, sub } from "../../utils";

export default function MultipleChoice({
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
    () => multipleChoiceItems.filter((q) => q.verbs.some((v) => selectedVerbs.includes(v))),
    [selectedVerbs]
  );
  const [items] = useState(() => shuffle(filtered).slice(0, 6));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[currentIdx];
  const isCorrect = selected === item?.answer;

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
  };

  const handleConfirm = () => {
    if (!selected || answered) return;
    setAnswered(true);
    if (selected === item.answer) {
      setScore((s) => s + 1);
    } else {
      onError();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= items.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>
          {score === items.length ? "🎉" : score >= items.length / 2 ? "👏" : "💪"}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
          <T it="Risultato" es="Resultado" />
        </h3>
        <p style={{ fontSize: 16, marginBottom: 16, color: "var(--color-text-secondary)" }}>
          {score}/{items.length} <T it="risposte corrette" es="respuestas correctas" />
        </p>
        <button onClick={handleReset} style={btn()}>
          <T it="Riprova con nuove domande" es="Intentar con nuevas preguntas" />
        </button>
        <button onClick={onComplete} style={{ ...btn(), background: '#009246', color: '#fff', border: 'none', marginTop: 10 }}>
          <T it="Continua →" es="Continuar →" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Seleziona la risposta corretta per ogni domanda."
          es="Selecciona la respuesta correcta para cada pregunta."
        />{" "}
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          ({currentIdx + 1}/{items.length})
        </span>
      </p>

      {/* Question */}
      <div
        style={{
          padding: "14px 18px",
          background: "var(--color-background-secondary)",
          borderRadius: 10,
          border: "0.5px solid var(--color-border-tertiary)",
          marginBottom: 14,
          fontSize: 15,
          fontWeight: 500,
        }}
      >
        {lang === "it" ? item.questionIt : item.questionEs}
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: 8 }}>
        {item.options.map((opt, i) => {
          const isThis = selected === opt;
          const rightAnswer = opt === item.answer;
          let bg = "var(--color-background-primary)";
          let borderColor = isThis ? "var(--color-border-primary)" : "var(--color-border-tertiary)";
          if (answered) {
            if (rightAnswer) {
              bg = "#E1F5EE";
              borderColor = "#1D9E75";
            } else if (isThis && !rightAnswer) {
              bg = "#FCEBEB";
              borderColor = "#E24B4A";
            }
          } else if (isThis) {
            bg = "var(--color-background-secondary)";
          }
          return (
            <div
              key={i}
              onClick={() => handleSelect(opt)}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                cursor: answered ? "default" : "pointer",
                border: `0.5px solid ${borderColor}`,
                background: bg,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `2px solid ${answered && rightAnswer ? "#1D9E75" : answered && isThis ? "#E24B4A" : isThis ? "#3C3489" : "var(--color-border-secondary)"}`,
                  background: isThis ? (answered ? (rightAnswer ? "#1D9E75" : "#E24B4A") : "#3C3489") : "transparent",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isThis && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                )}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
              {answered && rightAnswer && <span style={{ fontSize: 14 }}>✅</span>}
              {answered && isThis && !rightAnswer && <span style={{ fontSize: 14 }}>❌</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: isCorrect ? "#E1F5EE" : "#FAECE7",
            borderRadius: 8,
            fontSize: 13,
            color: isCorrect ? "#0F6E56" : "#993C1D",
          }}
        >
          {isCorrect ? (
            <><b>✓ <T it="Esatto!" es="¡Correcto!" /></b> {lang === "it" ? item.explainIt : item.explainEs}</>
          ) : (
            <><b>✗ <T it="Non è corretto." es="No es correcto." /></b> {lang === "it" ? item.explainIt : item.explainEs}</>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
        {!answered ? (
          <button
            onClick={handleConfirm}
            disabled={!selected}
            style={{ ...btn(), opacity: selected ? 1 : 0.5, cursor: selected ? "pointer" : "not-allowed" }}
          >
            <T it="Conferma" es="Confirmar" />
          </button>
        ) : (
          <button onClick={handleNext} style={btn()}>
            {currentIdx + 1 >= items.length
              ? <T it="Vedi risultato" es="Ver resultado" />
              : <T it="Domanda successiva →" es="Siguiente pregunta →" />}
          </button>
        )}
        <span style={{ ...sub, marginLeft: "auto" }}>
          {score}/{currentIdx + (answered ? 1 : 0)} <T it="corrette" es="correctas" />
        </span>
      </div>
    </div>
  );
}
