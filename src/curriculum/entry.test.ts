import { describe, expect, it } from "vitest";
import {
  LESSON_VERB_COUNT,
  eligibleTenses,
  nextUnit,
  nextUnitIndex,
  pathProgress,
  pickRandomTarget,
  reachedLevel,
  seenVerbs,
  weakSetForTense,
} from "./entry";
import { UNITS } from "./path";
import { VERBS, getVerb } from "./verbs";
import { formKey } from "./lesson";

/** Deterministic stand-in for Math.random. */
function sequence(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

const completeAll = () => true;
const completeNone = () => false;
const completeUpTo = (count: number) => (id: string) =>
  UNITS.findIndex((u) => u.id === id) < count;

describe("Continue — resuming the path", () => {
  it("resumes the first unit for a new learner", () => {
    expect(nextUnitIndex(completeNone)).toBe(0);
    expect(nextUnit(completeNone)?.id).toBe(UNITS[0].id);
  });

  it("resumes the first incomplete unit", () => {
    expect(nextUnitIndex(completeUpTo(3))).toBe(3);
    expect(nextUnit(completeUpTo(3))?.id).toBe(UNITS[3].id);
  });

  it("reports no next unit when the path is finished", () => {
    // The path is only 14 units; a committed learner will reach the end
    // (D-05-3), so this must be a real state and not a crash.
    expect(nextUnitIndex(completeAll)).toBe(-1);
    expect(nextUnit(completeAll)).toBeNull();
  });

  it("skips a completed unit even when a later one is incomplete", () => {
    const isComplete = (id: string) => id === UNITS[0].id || id === UNITS[2].id;
    expect(nextUnit(isComplete)?.id).toBe(UNITS[1].id);
  });
});

describe("path progress", () => {
  it("counts nothing done for a new learner", () => {
    expect(pathProgress(completeNone)).toEqual({ done: 0, total: UNITS.length, finished: false });
  });

  it("counts partial progress", () => {
    expect(pathProgress(completeUpTo(5))).toEqual({ done: 5, total: UNITS.length, finished: false });
  });

  it("flags a finished path", () => {
    expect(pathProgress(completeAll)).toEqual({
      done: UNITS.length,
      total: UNITS.length,
      finished: true,
    });
  });
});

describe("level gating", () => {
  it("starts a new learner at level 1", () => {
    expect(reachedLevel([])).toBe(1);
  });

  it("takes the highest completed unit level", () => {
    const ids = UNITS.slice(0, 6).map((u) => u.id);
    const expected = Math.max(...UNITS.slice(0, 6).map((u) => u.level));
    expect(reachedLevel(ids)).toBe(expected);
  });

  it("ignores unit ids that are no longer in the path", () => {
    expect(reachedLevel(["deleted-unit"])).toBe(1);
  });

  it("offers only presente at level 1", () => {
    expect(eligibleTenses(1)).toEqual(["presente"]);
  });

  it("unlocks tenses as the level rises", () => {
    expect(eligibleTenses(2)).toEqual(["presente", "passato_prossimo"]);
    expect(eligibleTenses(4)).toHaveLength(4);
  });

  it("never returns an empty tense list", () => {
    expect(eligibleTenses(0)).toEqual(["presente"]);
    expect(eligibleTenses(-5)).toEqual(["presente"]);
  });
});

describe("seenVerbs", () => {
  it("falls back to the easy core for a new learner", () => {
    const pool = seenVerbs([]);
    expect(pool.length).toBeGreaterThan(0);
    for (const v of pool) expect(v.level).toBeLessThanOrEqual(2);
  });

  it("uses verbs from completed units once there are enough", () => {
    const ids = UNITS.slice(0, 4).map((u) => u.id);
    const expected = new Set(UNITS.slice(0, 4).flatMap((u) => u.verbIds));
    const pool = seenVerbs(ids).map((v) => v.id);
    expect(new Set(pool)).toEqual(expected);
  });

  it("returns only verbs that exist in the registry", () => {
    for (const v of seenVerbs(UNITS.map((u) => u.id))) {
      expect(getVerb(v.id)).toBeDefined();
    }
  });
});

describe("Random — the adaptive draw", () => {
  const pool = VERBS.filter((v) => v.level <= 2);

  it("returns null for an empty pool rather than throwing", () => {
    expect(pickRandomTarget({ pool: [] })).toBeNull();
  });

  it("draws a lesson-sized set of distinct verbs", () => {
    const target = pickRandomTarget({ pool, rng: sequence([0.1, 0.4, 0.7]) })!;
    expect(target.verbIds).toHaveLength(LESSON_VERB_COUNT);
    expect(new Set(target.verbIds).size).toBe(LESSON_VERB_COUNT);
    for (const id of target.verbIds) expect(getVerb(id)).toBeDefined();
  });

  it("never draws a tense above the learner's level", () => {
    for (let i = 0; i < 50; i++) {
      const target = pickRandomTarget({ pool, level: 1, rng: sequence([i / 50, 0.3, 0.6]) })!;
      expect(target.tense).toBe("presente");
    }
  });

  it("uses the higher tenses once the level allows", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const target = pickRandomTarget({ pool, level: 4, rng: sequence([0.99, i / 60, 0.5]) })!;
      seen.add(target.tense);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("seeds on a weak form when the draw favours it", () => {
    const weakKey = formKey("parlare", "presente", 2);
    // First rng() < WEAK_SEED_BIAS selects the weak path.
    const target = pickRandomTarget({
      pool: VERBS,
      weakKeys: [weakKey],
      level: 1,
      rng: sequence([0.0, 0.0, 0.5]),
    })!;
    expect(target.seededOnWeakness).toBe(true);
    expect(target.verbIds[0]).toBe("parlare");
    expect(target.tense).toBe("presente");
  });

  it("ignores a weak form whose tense is above the learner's level", () => {
    const target = pickRandomTarget({
      pool,
      weakKeys: [formKey("parlare", "futuro_semplice", 0)],
      level: 1,
      rng: sequence([0.0, 0.0, 0.5]),
    })!;
    expect(target.seededOnWeakness).toBe(false);
    expect(target.tense).toBe("presente");
  });

  it("ignores a weak form whose verb left the registry", () => {
    const target = pickRandomTarget({
      pool,
      weakKeys: ["removed-verb:presente:0"],
      level: 1,
      rng: sequence([0.0, 0.0, 0.5]),
    })!;
    expect(target.seededOnWeakness).toBe(false);
    expect(target.verbIds.length).toBeGreaterThan(0);
  });

  it("does not always seed on weakness, so Random stays random", () => {
    // rng above the bias takes the free-draw path.
    const target = pickRandomTarget({
      pool,
      weakKeys: [formKey("parlare", "presente", 0)],
      level: 1,
      rng: sequence([0.99, 0.2, 0.5]),
    })!;
    expect(target.seededOnWeakness).toBe(false);
  });

  it("fills from the seed's level neighbourhood", () => {
    const target = pickRandomTarget({ pool: VERBS, level: 1, rng: sequence([0.99, 0.0, 0.0, 0.5]) })!;
    const levels = target.verbIds.map((id) => getVerb(id)!.level);
    const spread = Math.max(...levels) - Math.min(...levels);
    // Coherent difficulty: never level 1 sitting next to level 5.
    expect(spread).toBeLessThanOrEqual(2);
  });

  it("copes with a pool smaller than a lesson", () => {
    const tiny = VERBS.slice(0, 2);
    const target = pickRandomTarget({ pool: tiny, rng: sequence([0.99, 0.1, 0.2]) })!;
    expect(target.verbIds).toHaveLength(2);
    expect(new Set(target.verbIds).size).toBe(2);
  });

  it("copes with a single-verb pool", () => {
    const target = pickRandomTarget({ pool: [VERBS[0]], rng: sequence([0.99, 0.1]) })!;
    expect(target.verbIds).toEqual([VERBS[0].id]);
  });
});

describe("weakSetForTense", () => {
  it("keeps only keys in the requested tense", () => {
    const keys = [
      formKey("parlare", "presente", 0),
      formKey("parlare", "imperfetto", 1),
      formKey("capire", "presente", 3),
    ];
    expect(weakSetForTense(keys, "presente")).toEqual(
      new Set([formKey("parlare", "presente", 0), formKey("capire", "presente", 3)])
    );
  });

  it("returns an empty set when nothing matches", () => {
    expect(weakSetForTense([formKey("parlare", "presente", 0)], "futuro_semplice").size).toBe(0);
  });

  it("tolerates a malformed key", () => {
    expect(weakSetForTense(["nonsense"], "presente").size).toBe(0);
  });
});
