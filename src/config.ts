// App-wide constants: verb badge colors and conversation topics.

const PALETTE: { bg: string; color: string }[] = [
  { bg: "#EEEDFE", color: "#3C3489" },
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#FAECE7", color: "#993C1D" },
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#FFF8E6", color: "#6B5A00" },
  { bg: "#F3E8FF", color: "#6B21A8" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#ECFDF5", color: "#065F46" },
];

/** Stable per-verb color derived from the id, so any verb gets a consistent badge. */
export function verbColor(id: string): { bg: string; color: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export type Topic = { id: string; emoji: string; it: string; en: string; es: string };

export const TOPICS: Topic[] = [
  { id: "travel", emoji: "✈️", it: "Viaggi", en: "Travel", es: "Viajes" },
  { id: "food", emoji: "🍝", it: "Cucina", en: "Food & cooking", es: "Comida" },
  { id: "football", emoji: "⚽", it: "Calcio", en: "Football", es: "Fútbol" },
  { id: "music", emoji: "🎵", it: "Musica", en: "Music", es: "Música" },
  { id: "weekend", emoji: "🎉", it: "Weekend", en: "Weekend", es: "Fin de semana" },
  { id: "work", emoji: "💼", it: "Lavoro", en: "Work", es: "Trabajo" },
  { id: "movies", emoji: "🎬", it: "Film e serie TV", en: "Movies & TV", es: "Cine y series" },
  { id: "daily", emoji: "🏠", it: "Vita quotidiana", en: "Daily life", es: "Vida diaria" },
];
