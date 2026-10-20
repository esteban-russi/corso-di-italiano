// Client-side character catalog and metadata.
// Plan 08 — The character & Plan 01 — Conversation core.
// Interface copy is bilingual (EN/ES) per docs/04-interface-language.md.

export type CharacterId = "marco" | "giulia" | "rosa" | "luca";

export interface CharacterVoiceSettings {
  pitch: number;
  rate: number;
  gender: "male" | "female";
  accentLabel: { en: string; es: string };
}

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  age: number;
  city: string;
  region: string;
  avatarEmoji: string;
  accentColor: string;
  badgeBg: string;
  badgeFg: string;
  title: { en: string; es: string };
  tagline: { en: string; es: string };
  difficulty: "beginner" | "intermediate" | "all_levels";
  difficultyLabel: { en: string; es: string };
  voice: CharacterVoiceSettings;
  sampleGreeting: string;
  pedagogicalFocus: { en: string; es: string };
}

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  marco: {
    id: "marco",
    name: "Marco",
    age: 32,
    city: "Roma",
    region: "Lazio",
    avatarEmoji: "☕",
    accentColor: "var(--color-primary)",
    badgeBg: "var(--color-badge-1-bg)",
    badgeFg: "var(--color-badge-1-fg)",
    title: { en: "Everyday Friend (Rome)", es: "Amigo de Roma" },
    tagline: {
      en: "Warm, relaxed, passionate about food and football. Great for daily chat.",
      es: "Cálido, relajado, apasionado por la comida y el fútbol. Ideal para la charla diaria.",
    },
    difficulty: "all_levels",
    difficultyLabel: { en: "All Levels", es: "Todos los niveles" },
    voice: {
      pitch: 1.0,
      rate: 1.0,
      gender: "male",
      accentLabel: { en: "Roman cadence", es: "Cadencia romana" },
    },
    sampleGreeting: "Ciao! Piacere di conoscerti, io sono Marco. Facciamo due chiacchiere in italiano?",
    pedagogicalFocus: {
      en: "Natural conversation flow, balanced pace, gentle error correction.",
      es: "Fluidez conversacional natural, ritmo balanceado y corrección suave.",
    },
  },
  giulia: {
    id: "giulia",
    name: "Giulia",
    age: 27,
    city: "Milano",
    region: "Lombardia",
    avatarEmoji: "⚡",
    accentColor: "var(--color-accent-conversation)",
    badgeBg: "var(--color-badge-2-bg)",
    badgeFg: "var(--color-badge-2-fg)",
    title: { en: "Dynamic Professional (Milan)", es: "Profesional dinámica (Milán)" },
    tagline: {
      en: "Fast-paced, modern, sardonic wit. Talks design, espresso, and aperitivo culture.",
      es: "Rápida, moderna, con humor irónico. Habla de diseño, espresso y aperitivos.",
    },
    difficulty: "intermediate",
    difficultyLabel: { en: "Intermediate", es: "Intermedio" },
    voice: {
      pitch: 1.1,
      rate: 1.12,
      gender: "female",
      accentLabel: { en: "Milanese crisp rhythm", es: "Ritmo milanés enérgico" },
    },
    sampleGreeting: "Ciao! Piacere, sono Giulia. Qui a Milano si corre sempre, ma un buon caffè e una chiacchierata ci stanno sempre!",
    pedagogicalFocus: {
      en: "Contemporary slang, faster listening comprehension, professional and social vocabulary.",
      es: "Jerga actual, comprensión auditiva ágil, vocabulario laboral y social.",
    },
  },
  rosa: {
    id: "rosa",
    name: "Nonna Rosa",
    age: 71,
    city: "Napoli",
    region: "Campania",
    avatarEmoji: "👵",
    accentColor: "var(--color-success)",
    badgeBg: "var(--color-badge-3-bg)",
    badgeFg: "var(--color-badge-3-fg)",
    title: { en: "Nonna Rosa (Naples)", es: "Nonna Rosa (Nápoles)" },
    tagline: {
      en: "Endlessly patient and affectionate. Speaks slowly and clearly. Perfect for beginners.",
      es: "Infinitamente paciente y cariñosa. Habla claro y pausado. Perfecta para principiantes.",
    },
    difficulty: "beginner",
    difficultyLabel: { en: "Beginner Friendly", es: "Para principiantes" },
    voice: {
      pitch: 0.92,
      rate: 0.88,
      gender: "female",
      accentLabel: { en: "Southern melodic & gentle", es: "Melódico del sur y pausado" },
    },
    sampleGreeting: "Benvenuto tesoro mio! Siediti comodo con Nonna Rosa. Piano piano impariamo tutto!",
    pedagogicalFocus: {
      en: "Low-anxiety practice, clear articulation, high encouragement, family and culinary themes.",
      es: "Práctica sin ansiedad, articulación clara, mucho aliento, cocina y familia.",
    },
  },
  luca: {
    id: "luca",
    name: "Luca",
    age: 22,
    city: "Bologna",
    region: "Emilia-Romagna",
    avatarEmoji: "🎸",
    accentColor: "var(--color-primary)",
    badgeBg: "var(--color-badge-4-bg)",
    badgeFg: "var(--color-badge-4-fg)",
    title: { en: "Curious Student (Bologna)", es: "Estudiante universitario (Bolonia)" },
    tagline: {
      en: "Casual, friendly, loves travel, indie music, and student life.",
      es: "Informal, amigable, amante de los viajes, música indie y vida estudiantil.",
    },
    difficulty: "all_levels",
    difficultyLabel: { en: "All Levels", es: "Todos los niveles" },
    voice: {
      pitch: 1.05,
      rate: 1.04,
      gender: "male",
      accentLabel: { en: "Emilian relaxed & open", es: "Emiliano relajado y abierto" },
    },
    sampleGreeting: "Ehi ciao! Io sono Luca. Che bello fare due chiacchiere con chi studia l'italiano! Che musica ascolti di solito?",
    pedagogicalFocus: {
      en: "Informal register, travel conversation, youth expressions, relaxed peer practice.",
      es: "Registro informal, viajes, expresiones jóvenes, práctica entre pares.",
    },
  },
};

export const CHARACTER_LIST: CharacterInfo[] = Object.values(CHARACTERS);

export const DEFAULT_CHARACTER_ID: CharacterId = "marco";

export function getCharacterInfo(id?: string | null): CharacterInfo {
  if (id && id in CHARACTERS) {
    return CHARACTERS[id as CharacterId];
  }
  return CHARACTERS[DEFAULT_CHARACTER_ID];
}
