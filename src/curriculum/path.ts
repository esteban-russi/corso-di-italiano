// ---------------------------------------------------------------------------
// The learning path: an ordered list of units. Each unit combines a small set
// of verbs with one tense. Units unlock in order (progress in localStorage).
// ---------------------------------------------------------------------------

import type { Unit } from "./types";

export const UNITS: Unit[] = [
  {
    id: "u1", level: 1, tense: "presente", verbIds: ["essere", "avere"],
    titleIt: "I due pilastri", titleEn: "The two pillars", titleEs: "Los dos pilares",
  },
  {
    id: "u2", level: 1, tense: "presente", verbIds: ["fare", "stare", "andare"],
    titleIt: "Verbi di tutti i giorni", titleEn: "Everyday verbs", titleEs: "Verbos de cada día",
  },
  {
    id: "u3", level: 2, tense: "presente", verbIds: ["potere", "volere", "dovere"],
    titleIt: "I verbi modali", titleEn: "Modal verbs", titleEs: "Verbos modales",
  },
  {
    id: "u4", level: 2, tense: "presente", verbIds: ["dire", "dare"],
    titleIt: "Dire e dare", titleEn: "Say and give", titleEs: "Decir y dar",
  },
  {
    id: "u5", level: 3, tense: "presente", verbIds: ["parlare", "abitare", "lavorare", "mangiare", "studiare"],
    titleIt: "Verbi regolari -are", titleEn: "Regular -are verbs", titleEs: "Verbos regulares -are",
  },
  {
    id: "u6", level: 4, tense: "presente", verbIds: ["credere", "prendere", "leggere", "scrivere", "vivere"],
    titleIt: "Verbi -ere", titleEn: "-ere verbs", titleEs: "Verbos -ere",
  },
  {
    id: "u7", level: 5, tense: "presente", verbIds: ["dormire", "partire", "capire", "finire", "preferire"],
    titleIt: "Verbi -ire", titleEn: "-ire verbs", titleEs: "Verbos -ire",
  },
  {
    id: "u8", level: 5, tense: "presente", verbIds: ["venire", "uscire"],
    titleIt: "Venire e uscire", titleEn: "Come and go out", titleEs: "Venir y salir",
  },
  {
    id: "u9", level: 2, tense: "passato_prossimo", verbIds: ["essere", "avere", "fare", "andare"],
    titleIt: "Il passato — le basi", titleEn: "The past — basics", titleEs: "El pasado — lo básico",
  },
  {
    id: "u10", level: 3, tense: "passato_prossimo", verbIds: ["mangiare", "prendere", "leggere", "dire"],
    titleIt: "Il passato — participi", titleEn: "The past — participles", titleEs: "El pasado — participios",
  },
  {
    id: "u11", level: 3, tense: "imperfetto", verbIds: ["essere", "avere", "fare"],
    titleIt: "L'imperfetto", titleEn: "The imperfect", titleEs: "El imperfecto",
  },
  {
    id: "u12", level: 4, tense: "imperfetto", verbIds: ["parlare", "abitare", "vivere"],
    titleIt: "Imperfetto — abitudini", titleEn: "Imperfect — habits", titleEs: "Imperfecto — hábitos",
  },
  {
    id: "u13", level: 4, tense: "futuro_semplice", verbIds: ["essere", "avere", "andare", "fare"],
    titleIt: "Il futuro", titleEn: "The future", titleEs: "El futuro",
  },
  {
    id: "u14", level: 5, tense: "futuro_semplice", verbIds: ["potere", "volere", "venire"],
    titleIt: "Futuro — irregolari", titleEn: "Future — irregulars", titleEs: "Futuro — irregulares",
  },
];

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}
