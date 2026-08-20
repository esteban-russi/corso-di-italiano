import type { Lang } from "../../types";

// Shared bits for lesson cards: Italian flavor feedback + a normalizer.

const CORRECT_FLAVORS = ["Bravo! 🎉", "Benissimo! ✨", "Perfetto! 👏", "Esatto! ✅", "Ottimo! 🌟"];

export function correctFlavor(seed: number): string {
  return CORRECT_FLAVORS[seed % CORRECT_FLAVORS.length];
}

export function wrongFlavor(lang: Lang): string {
  return lang === "en" ? "Quasi! Here's the correct form:" : "Quasi! Esta es la forma correcta:";
}

/** Compare a typed answer to the target, ignoring case, accents and spacing. */
export function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

export function answersMatch(input: string, answer: string): boolean {
  return normalize(input) === normalize(answer);
}

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const feedbackBox = (ok: boolean): React.CSSProperties => ({
  marginTop: 14,
  padding: "12px 16px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  background: ok ? "var(--color-success-soft)" : "var(--color-danger-soft)",
  color: ok ? "var(--color-success)" : "var(--color-danger-hover)",
  border: `1px solid ${ok ? "var(--color-success)" : "var(--color-danger)"}`,
});

export const answerInput: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  fontSize: 17,
  borderRadius: 12,
  border: "1px solid var(--color-border-secondary)",
  background: "var(--color-background-primary)",
  color: "var(--color-text-primary)",
};
