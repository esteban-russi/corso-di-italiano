import { useState, useRef } from "react";
import { useLang } from "../../context/LangContext";
import { useStreak } from "../../context/StreakContext";
import { useProfile } from "../../context/ProfileContext";
import { verbColor } from "../../config";
import { getVerb } from "../../curriculum/verbs";
import type { Lesson } from "../../curriculum/types";
import { badge, btn, card, modalPanel, scrim } from "../../utils";
import ConjTable from "../ConjTable";
import { FlashCard, ChoiceCard, CompleteCard, MatchCard, IntroCard, type LessonResult } from "./LessonCards";

export default function LessonPlayer({
  lesson, title, onExit, onFinish,
}: {
  lesson: Lesson;
  title: string;
  onExit: () => void;
  onFinish: (errors: number, startTime: number) => void;
}) {
  const { lang } = useLang();
  const { recordActivity } = useStreak();
  const { recordLesson } = useProfile();
  const [step, setStep] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const startTime = useRef(Date.now()).current;
  const errors = useRef(0);
  const misses = useRef<string[]>([]);
  const hits = useRef<string[]>([]);

  const items = lesson.items;
  const item = items[step];

  const advance = () => {
    if (step + 1 >= items.length) {
      recordLesson(misses.current, hits.current);
      recordActivity();
      onFinish(errors.current, startTime);
    } else {
      setStep((s) => s + 1);
    }
  };

  const onResult = (r: LessonResult) => {
    errors.current += r.misses.length;
    misses.current.push(...r.misses);
    hits.current.push(...r.hits);
    advance();
  };

  return (
    <div>
      {/* Verb badges */}
      <div style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginRight: 4 }}>{title}</span>
        {lesson.verbIds.map((v) => {
          const c = verbColor(v);
          return (
            <span key={v} style={{ ...badge(c), padding: "3px 12px", fontSize: 12.5 }}>
              {getVerb(v)?.infinitive ?? v}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 6 }}>
          <span style={{ fontWeight: 500 }}>{step + 1} / {items.length}</span>
          <span style={{ color: errors.current > 0 ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
            {errors.current} {lang === "en" ? "errors" : "errores"}
          </span>
        </div>
        <div style={{ height: 6, background: "var(--color-border-tertiary)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((step + 1) / items.length) * 100}%`, background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))", borderRadius: 999, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <button onClick={() => setShowTable((s) => !s)} className="btn-secondary" style={{ ...btn(), fontSize: 12.5, padding: "6px 12px" }}>
          📋 {showTable ? (lang === "en" ? "Hide table" : "Ocultar tabla") : (lang === "en" ? "Show table" : "Mostrar tabla")}
        </button>
        <span style={{ flex: 1 }} />
        <button onClick={() => setShowExit(true)} className="btn-danger" style={{ ...btn(), fontSize: 12.5, padding: "6px 12px" }}>
          ✕ {lang === "en" ? "Exit" : "Salir"}
        </button>
      </div>

      {showTable && (
        <div style={{ ...card, marginBottom: 16 }}>
          <ConjTable verbIds={lesson.verbIds} tense={lesson.tense} />
        </div>
      )}

      {/* Current exercise */}
      <div key={step} className="fade-in">
        {item.kind === "intro" && <IntroCard item={item} onComplete={advance} />}
        {item.kind === "flash" && <FlashCard item={item} onComplete={onResult} />}
        {item.kind === "choice" && <ChoiceCard item={item} onComplete={onResult} />}
        {item.kind === "complete" && <CompleteCard item={item} onComplete={onResult} />}
        {item.kind === "match" && <MatchCard item={item} onComplete={onResult} />}
      </div>

      {/* Exit confirmation */}
      {showExit && (
        <div style={{ ...scrim(2), zIndex: 1000 }}>
          <div className="fade-in" style={{ ...modalPanel(16), padding: "30px 32px 26px", maxWidth: 380, width: "90%" }}>
            <div aria-hidden="true" style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: "var(--color-text-primary)" }}>
              {lang === "en" ? "Leave the lesson?" : "¿Salir de la lección?"}
            </div>
            <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginBottom: 22, lineHeight: 1.5 }}>
              {lang === "en" ? "Your progress won't be saved." : "Tu progreso no se guardará."}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setShowExit(false)} className="btn-secondary" style={{ ...btn(), padding: "10px 22px", fontWeight: 500 }}>
                {lang === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button onClick={onExit} className="btn-danger-solid" style={{ ...btn(), padding: "10px 22px", fontWeight: 600 }}>
                {lang === "en" ? "Exit" : "Salir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
