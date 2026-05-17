export const PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"];

export const VERB_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  fare: { bg: "#EEEDFE", color: "#3C3489" },
  andare: { bg: "#E1F5EE", color: "#0F6E56" },
  dire: { bg: "#FAECE7", color: "#993C1D" },
  essere: { bg: "#E6F1FB", color: "#185FA5" },
  avere: { bg: "#FFF8E6", color: "#6B5A00" },
  potere: { bg: "#F3E8FF", color: "#6B21A8" },
  volere: { bg: "#FCE7F3", color: "#9D174D" },
  dovere: { bg: "#ECFDF5", color: "#065F46" },
};

export const EXERCISE_REGISTRY = [
  { key: "intro" as const, labelIt: "Coniugazioni", labelEs: "Conjugaciones", emoji: "📋", estimatedMinutes: 2 },
  { key: "flash-quiz" as const, labelIt: "Flash-Quiz", labelEs: "Flash-Quiz", emoji: "⚡", estimatedMinutes: 1.5 },
  { key: "multiple-choice" as const, labelIt: "Scelta multipla", labelEs: "Opción múltiple", emoji: "🔘", estimatedMinutes: 1.5 },
  { key: "completa" as const, labelIt: "Completa la frase", labelEs: "Completa la frase", emoji: "✏️", estimatedMinutes: 1.5 },
  { key: "riordina" as const, labelIt: "Riordina", labelEs: "Reordena", emoji: "🔀", estimatedMinutes: 1.5 },
  { key: "traduci" as const, labelIt: "Traduci", labelEs: "Traduce", emoji: "🇪🇸→🇮🇹", estimatedMinutes: 2 },
  { key: "abbina" as const, labelIt: "Abbina", labelEs: "Empareja", emoji: "🔗", estimatedMinutes: 1.5 },
  { key: "chat" as const, labelIt: "Conversazione", labelEs: "Conversación", emoji: "💬", estimatedMinutes: 3 },
];
