import { useState, useCallback } from "react";
import { LangProvider, useLang, T } from "./context/LangContext";
import { VERB_BADGE_COLORS } from "./config";
import { btn, card } from "./utils";
import type { ExerciseType } from "./types";
import LangToggle from "./components/LangToggle";
import SectionHeader from "./components/SectionHeader";
import ConjTable from "./components/ConjTable";
import VerbSelector from "./components/VerbSelector";
import LessonSummary from "./components/LessonSummary";
import FlashQuiz from "./components/exercises/FlashQuiz";
import MultipleChoice from "./components/exercises/MultipleChoice";
import Completa from "./components/exercises/Completa";
import Riordina from "./components/exercises/Riordina";
import Traduci from "./components/exercises/Traduci";
import Abbina from "./components/exercises/Abbina";
import Chat from "./components/exercises/Chat";

type AppStage =
  | { kind: "selector" }
  | { kind: "lesson"; verbs: string[]; exercises: ExerciseType[]; step: number; errors: number; startTime: number }
  | { kind: "summary"; errors: number; startTime: number };

const exerciseMeta: Record<string, { emoji: string; titleIt: string; titleEs: string; descIt: string; descEs: string }> = {
  "intro": { emoji: "📋", titleIt: "Tabella di coniugazione", titleEs: "Tabla de conjugación", descIt: "Studia le coniugazioni dei verbi selezionati.", descEs: "Estudia las conjugaciones de los verbos seleccionados." },
  "flash-quiz": { emoji: "⚡", titleIt: "Flash-Quiz", titleEs: "Flash-Quiz", descIt: "Flash-quiz di coniugazione. Risposte rapide.", descEs: "Flash-quiz de conjugación. Respuestas rápidas." },
  "multiple-choice": { emoji: "🔘", titleIt: "Scelta multipla", titleEs: "Opción múltiple", descIt: "Scegli la risposta corretta tra le opzioni.", descEs: "Elige la respuesta correcta entre las opciones." },
  "completa": { emoji: "✏️", titleIt: "Completa la frase", titleEs: "Completa la frase", descIt: "Inserisci il verbo corretto nel contesto.", descEs: "Inserta el verbo correcto en contexto." },
  "riordina": { emoji: "🔀", titleIt: "Riordina la frase", titleEs: "Reordena la frase", descIt: "Metti le parole nell'ordine giusto.", descEs: "Pon las palabras en el orden correcto." },
  "traduci": { emoji: "🇪🇸→🇮🇹", titleIt: "Traduci", titleEs: "Traduce", descIt: "Traduci dallo spagnolo all'italiano.", descEs: "Traduce del español al italiano." },
  "abbina": { emoji: "🔗", titleIt: "Abbina", titleEs: "Empareja", descIt: "Collega ogni pronome alla forma verbale corretta.", descEs: "Conecta cada pronombre con la forma verbal correcta." },
  "chat": { emoji: "💬", titleIt: "Conversazione", titleEs: "Conversación", descIt: "Conversa con il tuo amico italiano. Lui ti correggerà.", descEs: "Conversa con tu amigo italiano. Él te corregirá." },
};

function renderExercise(
  exerciseKey: ExerciseType,
  verbs: string[],
  onError: () => void,
  onComplete: () => void,
  step: number,
) {
  const props = { selectedVerbs: verbs, onError, onComplete };
  switch (exerciseKey) {
    case "intro": return (
      <div key={`intro-${step}`} className="fade-in">
        <ConjTable selectedVerbs={verbs} />
        <button
          onClick={onComplete}
          className="btn-primary"
          style={{ ...btn(), marginTop: 16, padding: "11px 22px", fontWeight: 600 }}
        >
          <T it="Continua →" es="Continuar →" />
        </button>
      </div>
    );
    case "flash-quiz": return <FlashQuiz key={`fq-${step}`} {...props} />;
    case "multiple-choice": return <MultipleChoice key={`mc-${step}`} {...props} />;
    case "completa": return <Completa key={`co-${step}`} {...props} />;
    case "riordina": return <Riordina key={`ri-${step}`} {...props} />;
    case "traduci": return <Traduci key={`tr-${step}`} {...props} />;
    case "abbina": return <Abbina key={`ab-${step}`} {...props} />;
    case "chat": return <Chat key={`ch-${step}`} selectedVerbs={verbs} onComplete={onComplete} />;
    default: return null;
  }
}

function AppContent() {
  const { lang } = useLang();
  const [stage, setStage] = useState<AppStage>({ kind: "selector" });
  const [showConjTable, setShowConjTable] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleStart = useCallback((verbs: string[], exercises: ExerciseType[]) => {
    setStage({ kind: "lesson", verbs, exercises, step: 0, errors: 0, startTime: Date.now() });
    setShowConjTable(false);
  }, []);

  const handleError = useCallback(() => {
    setStage((s) => s.kind === "lesson" ? { ...s, errors: s.errors + 1 } : s);
  }, []);

  const handleNextStep = useCallback(() => {
    setStage((s) => {
      if (s.kind !== "lesson") return s;
      const nextStep = s.step + 1;
      if (nextStep >= s.exercises.length) {
        return { kind: "summary", errors: s.errors, startTime: s.startTime };
      }
      return { ...s, step: nextStep };
    });
  }, []);

  const handleRestart = useCallback(() => {
    setStage({ kind: "selector" });
    setShowConjTable(false);
  }, []);

  return (
    <div style={{ padding: "1rem 0", fontFamily: "var(--font-sans)" }}>
      <h2 className="sr-only">Classe interattiva di italiano</h2>

      {/* Header bar — friendly blue with a tricolor accent */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 22,
          padding: "14px 18px",
          background: "linear-gradient(135deg, var(--color-primary-softer), var(--color-background-primary) 70%)",
          borderRadius: 14,
          border: "1px solid var(--color-border-tertiary)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--color-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            boxShadow: "var(--shadow-md)",
          }}
        >
          🇮🇹
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Corso di Italiano
            <span
              aria-hidden="true"
              style={{ display: "inline-flex", borderRadius: 3, overflow: "hidden" }}
            >
              <span style={{ width: 5, height: 12, background: "#009246" }} />
              <span style={{ width: 5, height: 12, background: "#fff", border: "0.5px solid var(--color-border-tertiary)" }} />
              <span style={{ width: 5, height: 12, background: "#CE2B37" }} />
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>
            <T it="Verbi irregolari — presente indicativo" es="Verbos irregulares — presente indicativo" />
          </div>
        </div>
        <span style={{ flex: 1 }} />
        <LangToggle />
      </div>

      {/* Lesson in progress: verb badges + progress bar + controls */}
      {stage.kind === "lesson" && (
        <>
          <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {stage.verbs.map((v) => {
              const colors = VERB_BADGE_COLORS[v] ?? { bg: "#eee", color: "#333" };
              return (
                <span key={v} style={{ padding: "4px 16px", borderRadius: 20, fontWeight: 500, fontSize: 13, background: colors.bg, color: colors.color }}>
                  {v}
                </span>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>
                <T it={`Esercizio ${stage.step + 1} di ${stage.exercises.length}`} es={`Ejercicio ${stage.step + 1} de ${stage.exercises.length}`} />
              </span>
              <span style={{ color: stage.errors > 0 ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
                {stage.errors} <T it="errori" es="errores" />
              </span>
            </div>
            <div style={{ height: 6, background: "var(--color-border-tertiary)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${((stage.step + 1) / stage.exercises.length) * 100}%`,
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))",
                  borderRadius: 999,
                  transition: "width 0.4s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <button
              onClick={() => setShowConjTable((s) => !s)}
              className="btn-secondary"
              style={{ ...btn(), fontSize: 12.5, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              📋 <T it={showConjTable ? "Nascondi tabella" : "Mostra tabella"} es={showConjTable ? "Ocultar tabla" : "Mostrar tabla"} />
            </button>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setShowExitConfirm(true)}
              className="btn-danger"
              style={{ ...btn(), fontSize: 12.5, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ✕ <T it="Esci" es="Salir" />
            </button>
          </div>

          {showConjTable && (
            <div style={{ ...card, marginBottom: 16 }}>
              <ConjTable selectedVerbs={stage.verbs} />
            </div>
          )}
        </>
      )}

      {/* Exit confirmation overlay */}
      {showExitConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="fade-in"
            style={{
              background: "var(--color-background-primary)",
              borderRadius: 16,
              padding: "30px 32px 26px",
              maxWidth: 380,
              width: "90%",
              textAlign: "center",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border-tertiary)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--color-primary-soft)",
                color: "var(--color-primary-hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                margin: "0 auto 14px",
              }}
            >
              👋
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: "var(--color-text-primary)" }}>
              <T it="Vuoi uscire dalla lezione?" es="¿Quieres salir de la lección?" />
            </div>
            <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginBottom: 22, lineHeight: 1.5 }}>
              <T it="Il tuo progresso non sarà salvato." es="Tu progreso no se guardará." />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="btn-secondary"
                style={{ ...btn(), padding: "10px 22px", fontSize: 14, fontWeight: 500 }}
              >
                <T it="Annulla" es="Cancelar" />
              </button>
              <button
                onClick={() => { setShowExitConfirm(false); handleRestart(); }}
                className="btn-danger-solid"
                style={{ ...btn(), padding: "10px 22px", fontSize: 14, fontWeight: 600 }}
              >
                <T it="Esci" es="Salir" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div key={stage.kind} className="fade-in" style={card}>
        {stage.kind === "selector" && <VerbSelector onStart={handleStart} />}

        {stage.kind === "lesson" && (() => {
          const exerciseKey = stage.exercises[stage.step];
          const meta = exerciseMeta[exerciseKey];
          if (!meta) return null;
          return (
            <>
              <SectionHeader emoji={meta.emoji} titleIt={meta.titleIt} titleEs={meta.titleEs} descIt={meta.descIt} descEs={meta.descEs} />
              {renderExercise(exerciseKey, stage.verbs, handleError, handleNextStep, stage.step)}
            </>
          );
        })()}

        {stage.kind === "summary" && <LessonSummary errors={stage.errors} startTime={stage.startTime} onRestart={handleRestart} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
