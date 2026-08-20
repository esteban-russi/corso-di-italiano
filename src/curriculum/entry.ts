// ---------------------------------------------------------------------------
// The three ways in: Random, Continue, Choose (docs/05-three-ways-in.md).
//
// Pure selection logic, deliberately free of React and of anything
// verb-specific beyond the registry, so the slang section
// (docs/06-slang-and-idioms.md) can reuse the same shapes.
// ---------------------------------------------------------------------------

import { UNITS } from "./path";
import { VERBS, getVerb } from "./verbs";
import { TENSE_LEVEL, TENSES } from "./types";
import type { Tense, Unit, VerbEntry } from "./types";

/** Verbs per generated lesson. Enough for the generator to build credible distractors. */
export const LESSON_VERB_COUNT = 4;

/**
 * How often Random seeds on a form the learner keeps missing rather than on a
 * free draw. Review is folded into Random instead of being a fourth door
 * (D-05-1), so this is the knob that makes Random genuinely adaptive.
 */
export const WEAK_SEED_BIAS = 0.6;

/** Weak-form keys filtered to one tense. */
export function weakSetForTense(weakKeys: string[], tense: Tense): Set<string> {
  return new Set(weakKeys.filter((k) => k.split(":")[1] === tense));
}

/** Index of the first incomplete unit, or -1 when the path is finished. */
export function nextUnitIndex(isComplete: (unitId: string) => boolean): number {
  return UNITS.findIndex((u) => !isComplete(u.id));
}

/** The unit Continue resumes, or null when the path is finished. */
export function nextUnit(isComplete: (unitId: string) => boolean): Unit | null {
  const index = nextUnitIndex(isComplete);
  return index === -1 ? null : UNITS[index];
}

/** How far along the path the learner is, for a progress label. */
export function pathProgress(isComplete: (unitId: string) => boolean): {
  done: number;
  total: number;
  finished: boolean;
} {
  const done = UNITS.filter((u) => isComplete(u.id)).length;
  return { done, total: UNITS.length, finished: done === UNITS.length };
}

/**
 * The highest unit level the learner has completed, which gates which tenses
 * Random may draw. A learner who has only done presente units is never handed
 * a futuro form out of nowhere.
 */
export function reachedLevel(completedUnitIds: string[]): number {
  const levels = completedUnitIds
    .map((id) => UNITS.find((u) => u.id === id)?.level)
    .filter((l): l is number => typeof l === "number");
  return levels.length ? Math.max(...levels) : 1;
}

/** Tenses introduced at or below the learner's level. Always includes presente. */
export function eligibleTenses(level: number): Tense[] {
  const eligible = TENSES.filter((t) => TENSE_LEVEL[t] <= level);
  return eligible.length ? eligible : ["presente"];
}

/** Verbs the learner has met through completed units, else the easy core. */
export function seenVerbs(completedUnitIds: string[]): VerbEntry[] {
  const seen = new Set<string>();
  for (const id of completedUnitIds) {
    UNITS.find((u) => u.id === id)?.verbIds.forEach((v) => seen.add(v));
  }
  const ids = [...seen];
  if (ids.length >= 3) {
    return ids.map((id) => getVerb(id)).filter((v): v is VerbEntry => !!v);
  }
  return VERBS.filter((v) => v.level <= 2);
}

export type RandomTarget = { verbIds: string[]; tense: Tense; seededOnWeakness: boolean };

/**
 * Draw a lesson target. Seeds on one item and fills from its level neighbours
 * (D-05-2b): a single (verb, tense) pair makes for a thin lesson, and the
 * generator wants around four verbs to build real distractors from.
 *
 * `rng` is injectable so the draw is testable.
 */
export function pickRandomTarget(opts: {
  pool: VerbEntry[];
  weakKeys?: string[];
  level?: number;
  rng?: () => number;
}): RandomTarget | null {
  const { pool, weakKeys = [], level = 1, rng = Math.random } = opts;
  if (pool.length === 0) return null;

  const tenses = eligibleTenses(level);
  let seed: VerbEntry | undefined;
  let tense: Tense | undefined;
  let seededOnWeakness = false;

  // Prefer a form the learner keeps missing, when there is one and the draw
  // lands on it. Only weak keys in an eligible tense qualify.
  if (weakKeys.length && rng() < WEAK_SEED_BIAS) {
    const candidates = weakKeys
      .map((key) => {
        const [verbId, keyTense] = key.split(":");
        return { verb: getVerb(verbId), tense: keyTense as Tense };
      })
      .filter((c) => c.verb && tenses.includes(c.tense));
    if (candidates.length) {
      const chosen = candidates[Math.floor(rng() * candidates.length) % candidates.length];
      seed = chosen.verb;
      tense = chosen.tense;
      seededOnWeakness = true;
    }
  }

  if (!seed) seed = pool[Math.floor(rng() * pool.length) % pool.length];
  if (!tense) tense = tenses[Math.floor(rng() * tenses.length) % tenses.length];

  // Fill from the pool, nearest level first, so the lesson stays coherent in
  // difficulty rather than mixing level 1 with level 5.
  const seedId = seed.id;
  const neighbours = pool
    .filter((v) => v.id !== seedId)
    .map((v) => ({ v, distance: Math.abs(v.level - seed!.level), jitter: rng() }))
    .sort((a, b) => a.distance - b.distance || a.jitter - b.jitter)
    .map((entry) => entry.v);

  const verbIds = [seedId, ...neighbours.slice(0, LESSON_VERB_COUNT - 1).map((v) => v.id)];
  return { verbIds, tense, seededOnWeakness };
}
