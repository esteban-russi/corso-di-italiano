import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formKey, generateLesson } from "./lesson";
import { conjugate, PRONOUNS } from "./conjugator";
import { getVerb } from "./verbs";
import type { ChoiceItem, Lesson, MatchItem, Tense } from "./types";

// generateLesson draws at random, so these tests seed Math.random with a small
// deterministic LCG. Assertions are on invariants that must hold for *every*
// draw, not on one lucky lesson — plus a repeated-draw check for adaptivity.

function seedRandom(seed: number): void {
  let s = seed >>> 0;
  vi.spyOn(Math, "random").mockImplementation(() => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  });
}

const VERB_IDS = ["parlare", "credere", "dormire", "capire"];

function formsFor(ids: string[], tense: Tense): string[] {
  return ids.flatMap((id) => conjugate(getVerb(id)!, tense));
}

beforeEach(() => seedRandom(20260820));
afterEach(() => vi.restoreAllMocks());

describe("formKey", () => {
  it("is verbId:tense:pronounIndex", () => {
    expect(formKey("parlare", "presente", 0)).toBe("parlare:presente:0");
    expect(formKey("essere", "passato_prossimo", 5)).toBe("essere:passato_prossimo:5");
  });

  it("round-trips through split, which is how consumers parse it", () => {
    // VerbHome and Conversation both do key.split(":") — keep the shape stable.
    const [verbId, tense, index] = formKey("capire", "imperfetto", 3).split(":");
    expect([verbId, tense, index]).toEqual(["capire", "imperfetto", "3"]);
  });
});

describe("lesson shape", () => {
  it("produces `count` exercises plus the intro card", () => {
    const lesson = generateLesson(VERB_IDS, "presente");
    expect(lesson.items).toHaveLength(7);
    expect(lesson.items[0].kind).toBe("intro");
    expect(lesson.verbIds).toEqual(VERB_IDS);
    expect(lesson.tense).toBe("presente");
  });

  it("omits the intro when asked (quick practice)", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false });
    expect(lesson.items).toHaveLength(6);
    expect(lesson.items.some((i) => i.kind === "intro")).toBe(false);
  });

  it("honours a custom count", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false, count: 3 });
    expect(lesson.items).toHaveLength(3);
  });

  it("cycles the exercise pattern flash -> choice -> complete -> match", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false });
    expect(lesson.items.map((i) => i.kind)).toEqual([
      "flash", "choice", "complete", "match", "flash", "choice",
    ]);
  });

  it("returns an empty lesson for no known verbs rather than throwing", () => {
    expect(generateLesson([], "presente").items).toEqual([]);
    expect(generateLesson(["not-a-verb"], "presente").items).toEqual([]);
  });

  it("silently drops unknown verb ids and builds from the rest", () => {
    const lesson = generateLesson(["parlare", "not-a-verb"], "presente", { includeIntro: false });
    expect(lesson.items).toHaveLength(6);
    for (const item of lesson.items) {
      if ("verbId" in item) expect(item.verbId).toBe("parlare");
    }
  });
});

describe("every generated answer is a real conjugated form", () => {
  const tenses: Tense[] = ["presente", "passato_prossimo", "imperfetto", "futuro_semplice"];

  it.each(tenses)("holds for %s", (tense) => {
    const lesson = generateLesson(VERB_IDS, tense, { includeIntro: false, count: 12 });
    for (const item of lesson.items) {
      if (item.kind === "match") {
        expect(item.pairs).toHaveLength(4);
        const forms = conjugate(getVerb(item.verbId)!, tense);
        for (const pair of item.pairs) {
          const pronounIndex = PRONOUNS.indexOf(pair.pronoun);
          expect(pronounIndex).toBeGreaterThanOrEqual(0);
          expect(pair.form).toBe(forms[pronounIndex]);
        }
      } else if (item.kind !== "intro") {
        const forms = conjugate(getVerb(item.verbId)!, tense);
        expect(item.answer).toBe(forms[item.pronounIndex]);
      }
    }
  });
});

describe("choice distractors", () => {
  function choices(lesson: Lesson): ChoiceItem[] {
    return lesson.items.filter((i): i is ChoiceItem => i.kind === "choice");
  }

  it("offers four unique options that include the answer", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false, count: 24 });
    const items = choices(lesson);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.options).toHaveLength(4);
      expect(new Set(item.options).size).toBe(4);
      expect(item.options).toContain(item.answer);
    }
  });

  it("builds distractors from real forms of the lesson's own verbs", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false, count: 24 });
    const legal = new Set(formsFor(VERB_IDS, "presente"));
    for (const item of choices(lesson)) {
      for (const option of item.options) expect(legal).toContain(option);
    }
  });

  it("never repeats the answer as a distractor", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false, count: 24 });
    for (const item of choices(lesson)) {
      const occurrences = item.options.filter((o) => o === item.answer);
      expect(occurrences).toHaveLength(1);
    }
  });

  it("still yields four options for a single verb whose forms repeat", () => {
    // essere presente is "sono, sei, è, siamo, siete, sono" — only five distinct
    // forms, and the answer may be the duplicated one.
    const lesson = generateLesson(["essere"], "presente", { includeIntro: false, count: 24 });
    for (const item of lesson.items.filter((i): i is ChoiceItem => i.kind === "choice")) {
      expect(item.options).toHaveLength(4);
      expect(item.options).toContain(item.answer);
    }
  });
});

describe("match items", () => {
  it("picks four distinct pronouns in ascending order", () => {
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false, count: 24 });
    const matches = lesson.items.filter((i): i is MatchItem => i.kind === "match");
    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) {
      const idxs = item.pairs.map((p) => PRONOUNS.indexOf(p.pronoun));
      expect(new Set(idxs).size).toBe(4);
      expect([...idxs].sort((a, b) => a - b)).toEqual(idxs);
    }
  });
});

describe("target selection", () => {
  it("prefers distinct (verb, pronoun) targets while any remain", () => {
    // 4 verbs x 6 pronouns = 24 targets, so 6 exercises should never repeat one.
    const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false });
    const keys = lesson.items
      .filter((i) => i.kind === "flash" || i.kind === "choice" || i.kind === "complete")
      .map((i) => formKey(i.verbId, "presente", (i as ChoiceItem).pronounIndex));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("surfaces weak forms more often than the rest", () => {
    const weakKey = formKey("parlare", "presente", 0);
    const weak = new Set([weakKey]);
    let weakDraws = 0;
    let totalDraws = 0;
    for (let run = 0; run < 200; run++) {
      const lesson = generateLesson(VERB_IDS, "presente", { includeIntro: false, weak, count: 4 });
      for (const item of lesson.items) {
        if (item.kind === "intro" || item.kind === "match") continue;
        totalDraws++;
        if (formKey(item.verbId, "presente", item.pronounIndex) === weakKey) weakDraws++;
      }
    }
    // One of 24 targets, tripled in the pool: ~3/26 of draws, well above 1/24.
    expect(weakDraws / totalDraws).toBeGreaterThan(1 / 24);
  });
});
