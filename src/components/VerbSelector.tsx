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
      {/* Welcome panel */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--color-primary-softer), var(--color-background-primary))",
          border: "1px solid var(--color-primary-soft)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--color-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          ✨
        </div>
        <div style={{ fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600 }}>
            <T it="Benvenuto!" es="¡Bienvenido!" />
          </strong>{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            <T
              it="Scegli i verbi e gli esercizi che vuoi praticare."
              es="Elige los verbos y ejercicios que quieras practicar."
            />
          </span>
        </div>
      </div>

      {/* Verb selection */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
        <T it="1. Scegli i verbi" es="1. Elige los verbos" />
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleVerb(v.id);
                }
              }}
              style={{
                position: "relative",
                padding: "13px 14px",
                borderRadius: 12,
                cursor: "pointer",
                border: `2px solid ${isSelected ? colors.color : "var(--color-border-tertiary)"}`,
                background: isSelected ? colors.bg : "var(--color-background-primary)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease",
                boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                transform: isSelected ? "translateY(-1px)" : "none",
              }}
            >
              {isSelected && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: colors.color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </span>
              )}
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
      <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
        <button
          onClick={() => setSelectedVerbs(VERB_REGISTRY.map((v) => v.id))}
          className="btn-ghost"
          style={{ ...btn(), fontSize: 12.5, padding: "6px 12px" }}
        >
          <T it="Seleziona tutti" es="Seleccionar todos" />
        </button>
        <button
          onClick={() => setSelectedVerbs([])}
          className="btn-ghost"
          style={{ ...btn(), fontSize: 12.5, padding: "6px 12px" }}
        >
          <T it="Deseleziona tutti" es="Deseleccionar todos" />
        </button>
      </div>

      {/* Exercise type selection */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
        <T it="2. Scegli gli esercizi" es="2. Elige los ejercicios" />
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
                gap: 12,
                padding: "10px 14px",
                borderRadius: 10,
                cursor: "pointer",
                background: isSelected
                  ? "var(--color-primary-softer)"
                  : "var(--color-background-primary)",
                border: `1px solid ${isSelected ? "var(--color-primary-soft)" : "var(--color-border-tertiary)"}`,
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleExercise(ex.key)}
                style={{ accentColor: "var(--color-primary)", width: 16, height: 16 }}
              />
              <span style={{ fontSize: 17 }} aria-hidden="true">{ex.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: isSelected ? "var(--color-primary-hover)" : "var(--color-text-primary)" }}>
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
            padding: "11px 14px",
            background: "var(--color-primary-softer)",
            border: "1px solid var(--color-primary-soft)",
            borderRadius: 10,
            fontSize: 13,
            color: "var(--color-primary-hover)",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 16 }} aria-hidden="true">⏱️</span>
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
        className="btn-primary"
        style={{
          ...btn(),
          padding: "13px 32px",
          fontSize: 15.5,
          fontWeight: 600,
          width: "100%",
          letterSpacing: "0.01em",
        }}
      >
        <T it="Inizia la lezione →" es="Comenzar la lección →" />
      </button>
    </div>
  );
}
