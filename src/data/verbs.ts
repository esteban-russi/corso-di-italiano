import type { Verb } from "../types";

export const VERB_REGISTRY: Verb[] = [
  {
    id: "fare",
    infinitive: "fare",
    conjugations: ["faccio", "fai", "fa", "facciamo", "fate", "fanno"],
  },
  {
    id: "andare",
    infinitive: "andare",
    conjugations: ["vado", "vai", "va", "andiamo", "andate", "vanno"],
  },
  {
    id: "dire",
    infinitive: "dire",
    conjugations: ["dico", "dici", "dice", "diciamo", "dite", "dicono"],
  },
];

export function getConjugations(verbId: string): string[] | undefined {
  return VERB_REGISTRY.find((v) => v.id === verbId)?.conjugations;
}
