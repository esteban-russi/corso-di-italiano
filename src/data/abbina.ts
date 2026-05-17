import type { AbbinaItem } from "../types";

export const abbinaItems: AbbinaItem[] = [
  {
    verb: "fare",
    pairs: [
      { pronoun: "io", form: "faccio" },
      { pronoun: "tu", form: "fai" },
      { pronoun: "lui/lei", form: "fa" },
      { pronoun: "noi", form: "facciamo" },
      { pronoun: "voi", form: "fate" },
      { pronoun: "loro", form: "fanno" },
    ],
    verbs: ["fare"],
  },
  {
    verb: "andare",
    pairs: [
      { pronoun: "io", form: "vado" },
      { pronoun: "tu", form: "vai" },
      { pronoun: "lui/lei", form: "va" },
      { pronoun: "noi", form: "andiamo" },
      { pronoun: "voi", form: "andate" },
      { pronoun: "loro", form: "vanno" },
    ],
    verbs: ["andare"],
  },
  {
    verb: "dire",
    pairs: [
      { pronoun: "io", form: "dico" },
      { pronoun: "tu", form: "dici" },
      { pronoun: "lui/lei", form: "dice" },
      { pronoun: "noi", form: "diciamo" },
      { pronoun: "voi", form: "dite" },
      { pronoun: "loro", form: "dicono" },
    ],
    verbs: ["dire"],
  },
];
