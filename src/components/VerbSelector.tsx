import { useState } from "react";
import { useLang, T } from "../context/LangContext";
import { VERB_REGISTRY } from "../data/verbs";
import { EXERCISE_REGISTRY, VERB_BADGE_COLORS } from "../config";
import type { ExerciseType } from "../types";
import { btn } from "../utils";

const exerciseTypes = EXERCISE_REGISTRY.filter((e) => e.key !== "intro");

export default function VerbSelector({
  onStart,
}: {
  onStart: (verbs: string[], exercises: ExerciseType[]) => void;
}) {
  const { lang } = useLang();
  const [selectedVerbs, setSelectedVerbs] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseType[]>(
    () => exerciseTypes.map((e) => e.key)
  );

  const toggleVerb = (id: string) => {
    setSelectedVerbs((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleExercise = (key: ExerciseType) => {
    setSelectedExercises((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key]
    );
  };

  const estimatedMinutes = selectedVerbs.length * selectedExercises.length * 1.5;
  const canStart = selectedVerbs.length > 0 && selectedExercises.length > 0;

  return (
    <div>
      {/* Verb selection */}
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
        <T it="Scegli i verbi da praticare" es="Elige los verbos para practicar" />
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {VERB_REGISTRY.map((v) => {
          const isSelected = selectedVerbs.includes(v.id);
          const colors = VERB_BADGE_COLORS[v.id] ?? { bg: "#eee", color: "#333" };
          return (
            <div
              key={v.id}
              onClick={() => toggleVerb(v.id)}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                cursor: "pointer",
                border: `2px solid ${isSelected ? colors.color : "var(--color-border-tertiary)"}`,
                background: isSelected ? colors.bg : "var(--color-background-primary)",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isSelected ? colors.color : "var(--color-text-primary)",
                  marginBottom: 4,
                }}
              >
                {v.infinitive}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                {v.conjugations[0]}, {v.conjugations[1]}, {v.conjugations[2]}...
              </div>
            </div>
          );
        })}
      </div>

      {/* Select/deselect all verbs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setSelectedVerbs(VERB_REGISTRY.map((v) => v.id))}
          style={{ ...btn(), fontSize: 12, padding: "5px 12px" }}
        >
          <T it="Seleziona tutti" es="Seleccionar todos" />
        </button>
        <button
          onClick={() => setSelectedVerbs([])}
          style={{ ...btn(), fontSize: 12, padding: "5px 12px" }}
        >
          <T it="Deseleziona tutti" es="Deseleccionar todos" />
        </button>
      </div>

      {/* Exercise type selection */}
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>
        <T it="Scegli gli esercizi" es="Elige los ejercicios" />
      </h3>
      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {exerciseTypes.map((ex) => {
          const isSelected = selectedExercises.includes(ex.key);
          return (
            <label
              key={ex.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                background: isSelected
                  ? "var(--color-background-secondary)"
                  : "var(--color-background-primary)",
                border: `0.5px solid ${isSelected ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleExercise(ex.key)}
                style={{ accentColor: "#009246" }}
              />
              <span style={{ fontSize: 16 }} aria-hidden="true">{ex.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: isSelected ? 500 : 400 }}>
                {lang === "it" ? ex.labelIt : ex.labelEs}
              </span>
            </label>
          );
        })}
      </div>

      {/* Estimated time */}
      {canStart && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--color-background-secondary)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--color-text-secondary)",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>⏱</span>
          <T
            it={`Tempo stimato: ~${Math.round(estimatedMinutes)} minuti`}
            es={`Tiempo estimado: ~${Math.round(estimatedMinutes)} minutos`}
          />
        </div>
      )}

      {/* Start button */}
      <button
        onClick={() => canStart && onStart(selectedVerbs, selectedExercises)}
        disabled={!canStart}
        style={{
          ...btn(),
          padding: "12px 32px",
          fontSize: 15,
          fontWeight: 600,
          opacity: canStart ? 1 : 0.4,
          cursor: canStart ? "pointer" : "not-allowed",
          background: canStart ? "#009246" : "var(--color-background-primary)",
          color: canStart ? "#fff" : "var(--color-text-secondary)",
          border: canStart ? "none" : undefined,
          width: "100%",
        }}
      >
        <T it="Inizia la lezione" es="Comenzar la lección" />
      </button>
    </div>
  );
}
