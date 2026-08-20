// ---------------------------------------------------------------------------
// Rule-based Italian conjugation engine.
// Regular -are/-ere/-ire (+ -isc-) forms are generated; irregular forms come
// from per-verb override tables in the registry. Supports the 4 taught tenses.
// ---------------------------------------------------------------------------

import type { Tense, VerbEntry } from "./types";

export const PRONOUNS = ["io", "tu", "lui/lei", "noi", "voi", "loro"];

const PRESENTE_ENDINGS: Record<string, string[]> = {
  are: ["o", "i", "a", "iamo", "ate", "ano"],
  ere: ["o", "i", "e", "iamo", "ete", "ono"],
  ire: ["o", "i", "e", "iamo", "ite", "ono"],
  "ire-isc": ["isco", "isci", "isce", "iamo", "ite", "iscono"],
};

const IMPERFETTO_ENDINGS = ["vo", "vi", "va", "vamo", "vate", "vano"];
const FUTURO_ENDINGS = ["ò", "ai", "à", "emo", "ete", "anno"];

/** Join an -are root to an ending, applying Italian spelling rules. */
function joinAre(infinitive: string, root: string, ending: string): string {
  const startsWithI = ending.startsWith("i");
  // -care / -gare keep the hard sound: insert "h" before i-/e-initial endings.
  if (infinitive.endsWith("care") || infinitive.endsWith("gare")) {
    if (startsWithI || ending.startsWith("e")) return root + "h" + ending;
    return root + ending;
  }
  // -iare (incl. -ciare / -giare): collapse a doubled "i" at the boundary.
  if (root.endsWith("i") && startsWithI) {
    return root + ending.slice(1);
  }
  return root + ending;
}

function presente(verb: VerbEntry): string[] {
  if (verb.irregular?.presente) return verb.irregular.presente;
  const endings = PRESENTE_ENDINGS[verb.group];
  const root = verb.infinitive.slice(0, -3); // drop are/ere/ire
  return endings.map((e) =>
    verb.group === "are" ? joinAre(verb.infinitive, root, e) : root + e
  );
}

function imperfetto(verb: VerbEntry): string[] {
  if (verb.irregular?.imperfetto) return verb.irregular.imperfetto;
  const stem = verb.imperfettoStem ?? verb.infinitive.slice(0, -2); // drop "re"
  return IMPERFETTO_ENDINGS.map((e) => stem + e);
}

/** Compute the regular futuro stem, applying -care/-gare/-ciare/-giare rules. */
function regularFuturoStem(infinitive: string, group: string): string {
  if (group === "are") {
    if (infinitive.endsWith("care")) return infinitive.slice(0, -4) + "cher";
    if (infinitive.endsWith("gare")) return infinitive.slice(0, -4) + "gher";
    if (infinitive.endsWith("ciare")) return infinitive.slice(0, -5) + "cer";
    if (infinitive.endsWith("giare")) return infinitive.slice(0, -5) + "ger";
    return infinitive.slice(0, -3) + "er";
  }
  if (group === "ere") return infinitive.slice(0, -3) + "er";
  // ire / ire-isc
  return infinitive.slice(0, -3) + "ir";
}

function futuro(verb: VerbEntry): string[] {
  if (verb.irregular?.futuro_semplice) return verb.irregular.futuro_semplice;
  const stem = verb.futuroStem ?? regularFuturoStem(verb.infinitive, verb.group);
  return FUTURO_ENDINGS.map((e) => stem + e);
}

const AUX_PRESENTE: Record<"avere" | "essere", string[]> = {
  avere: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"],
  essere: ["sono", "sei", "è", "siamo", "siete", "sono"],
};

function regularParticiple(verb: VerbEntry): string {
  const stem = verb.infinitive.slice(0, -3);
  if (verb.group === "are") return stem + "ato";
  if (verb.group === "ere") return stem + "uto";
  return stem + "ito"; // ire / ire-isc
}

export function pastParticiple(verb: VerbEntry): string {
  return verb.participle ?? regularParticiple(verb);
}

function passatoProssimo(verb: VerbEntry): string[] {
  const aux = AUX_PRESENTE[verb.auxiliary];
  const part = pastParticiple(verb);
  if (verb.auxiliary === "essere") {
    // Agreement with the subject (masculine default: singular -o, plural -i).
    const agreed = [0, 1, 2].map(() => part).concat([3, 4, 5].map(() => part.slice(0, -1) + "i"));
    return aux.map((a, i) => `${a} ${agreed[i]}`);
  }
  return aux.map((a) => `${a} ${part}`);
}

/** Full 6-form conjugation of a verb in a tense. */
export function conjugate(verb: VerbEntry, tense: Tense): string[] {
  switch (tense) {
    case "presente":
      return presente(verb);
    case "imperfetto":
      return imperfetto(verb);
    case "futuro_semplice":
      return futuro(verb);
    case "passato_prossimo":
      return passatoProssimo(verb);
  }
}
