import { useState } from "react";
import { useLang, T } from "../../context/LangContext";
import { quizItems } from "../../data/quiz";
import { shuffle, btn, row, sub } from "../../utils";

export default function FlashQuiz() {
  const { lang } = useLang();
  const [quiz, setQuiz] = useState(() => shuffle(quizItems).slice(0, 8));
  const [answers, setAnswers] = useState<string[]>(Array(8).fill(""));
  const [checked, setChecked] = useState(false);
  const update = (i: number, v: string) => {
    const a = [...answers];
    a[i] = v;
    setAnswers(a);
  };
  const correct = (i: number) =>
    answers[i].trim().toLowerCase() === quiz[i].answer;
  const reset = () => {
    const next = shuffle(quizItems).slice(0, 8);
    setQuiz(next);
    setAnswers(Array(8).fill(""));
    setChecked(false);
  };
  return (
    <div>
      <p style={{ ...sub, marginBottom: 16 }}>
        <T
          it="Scrivi la coniugazione corretta per ogni coppia. Veloce!"
          es="Escribe la conjugación correcta para cada par. ¡Rápido!"
        />
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {quiz.map((q, i) => (
          <div key={i} style={row}>
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
              <b style={{ fontWeight: 500 }}>{q.pronoun}</b> +{" "}
              <b style={{ fontWeight: 500 }}>{q.verb}</b>
            </span>
            <input
              value={answers[i]}
              onChange={(e) => update(i, e.target.value)}
              disabled={checked}
              placeholder="..."
              style={{
                width: 110,
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
            {checked && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: correct(i) ? "#0F6E56" : "#A32D2D",
                  minWidth: 70,
                }}
              >
                {correct(i) ? "✓ Esatto!" : "✗ → " + quiz[i].answer}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {!checked ? (
          <button onClick={() => setChecked(true)} style={btn()}>
            <T it="Verifica risposte" es="Verificar respuestas" />
          </button>
        ) : (
          <button onClick={reset} style={btn()}>
            <T it="Riprova" es="Intentar de nuevo" />
          </button>
        )}
        {checked && (
          <span style={{ ...sub, alignSelf: "center" }}>
            {answers.filter((_, i) => correct(i)).length}/{quiz.length}{" "}
            <T it="corrette" es="correctas" />
          </span>
        )}
      </div>
    </div>
  );
}
