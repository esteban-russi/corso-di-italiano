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
  {
    id: "essere",
    infinitive: "essere",
    conjugations: ["sono", "sei", "è", "siamo", "siete", "sono"],
  },
  {
    id: "avere",
    infinitive: "avere",
    conjugations: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"],
  },
  {
    id: "potere",
    infinitive: "potere",
    conjugations: ["posso", "puoi", "può", "possiamo", "potete", "possono"],
  },
  {
    id: "volere",
    infinitive: "volere",
    conjugations: ["voglio", "vuoi", "vuole", "vogliamo", "volete", "vogliono"],
  },
  {
    id: "dovere",
    infinitive: "dovere",
    conjugations: ["devo", "devi", "deve", "dobbiamo", "dovete", "devono"],
  },
];

export function getConjugations(verbId: string): string[] | undefined {
  return VERB_REGISTRY.find((v) => v.id === verbId)?.conjugations;
}
