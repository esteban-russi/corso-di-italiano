// App-wide constants: verb badge colors and conversation topics.

/**
 * Categorical badge palette. The values live in index.html as
 * --color-badge-N-bg / --color-badge-N-fg so the redesign (and dark mode) can
 * restyle them in one place; only the count is knowledge held here.
 */
const BADGE_COUNT = 8;

/** Stable per-verb color derived from the id, so any verb gets a consistent badge. */
export function verbColor(id: string): { bg: string; color: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const slot = (h % BADGE_COUNT) + 1;
  return { bg: `var(--color-badge-${slot}-bg)`, color: `var(--color-badge-${slot}-fg)` };
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
