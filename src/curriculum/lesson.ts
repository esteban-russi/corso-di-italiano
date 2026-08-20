// ---------------------------------------------------------------------------
// Lesson generator. Composes a short (~2 min) lesson that mixes exercise types,
// all derived from the conjugation engine so content is always correct.
// Adaptive: known-weak forms are surfaced more often.
// ---------------------------------------------------------------------------

import type { Lesson, LessonItem, Tense } from "./types";
import { conjugate, PRONOUNS } from "./conjugator";
import { getVerbs } from "./verbs";

export function formKey(verbId: string, tense: Tense, pronounIndex: number): string {
  return `${verbId}:${tense}:${pronounIndex}`;
}

type Target = { verbId: string; pronounIndex: number; answer: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a lesson. `weak` is a set of formKeys the learner struggles with;
 * those targets are duplicated in the pool so they appear more often.
 */
export function generateLesson(
  verbIds: string[],
  tense: Tense,
  opts: { includeIntro?: boolean; weak?: Set<string>; count?: number } = {}
): Lesson {
  const { includeIntro = true, weak, count = 6 } = opts;
  const verbs = getVerbs(verbIds);
  if (verbs.length === 0) return { verbIds, tense, items: [] };

  // All (verb, pronoun) targets for this tense, with a full conjugation cache.
  const tables = new Map<string, string[]>();
  const targets: Target[] = [];
  for (const v of verbs) {
    const forms = conjugate(v, tense);
    tables.set(v.id, forms);
    forms.forEach((answer, pi) => targets.push({ verbId: v.id, pronounIndex: pi, answer }));
  }

  // Weight weak forms by duplicating them in the draw pool.
  const pool = [...targets];
  if (weak && weak.size) {
    for (const t of targets) {
      if (weak.has(formKey(t.verbId, tense, t.pronounIndex))) pool.push(t, t);
    }
  }
  const draw = shuffle(pool);

  const allForms = [...tables.values()].flat();
  const items: LessonItem[] = [];

  if (includeIntro) items.push({ kind: "intro", verbIds, tense });

  // Interleave a repeating pattern of exercise kinds for variety and pacing.
  const pattern: LessonItem["kind"][] = ["flash", "choice", "complete", "match", "flash", "choice", "complete"];
  const used = new Set<string>();
  let di = 0;
  const nextTarget = (): Target => {
    // Prefer an unused target; fall back to any.
    for (let tries = 0; tries < draw.length; tries++) {
      const t = draw[di++ % draw.length];
      const k = formKey(t.verbId, tense, t.pronounIndex);
      if (!used.has(k)) { used.add(k); return t; }
    }
    return draw[di++ % draw.length];
  };

  for (let i = 0; i < count; i++) {
    const kind = pattern[i % pattern.length];
    if (kind === "match") {
      const v = verbs[i % verbs.length];
      const forms = tables.get(v.id)!;
      const idxs = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 4).sort((a, b) => a - b);
      items.push({
        kind: "match",
        verbId: v.id,
        tense,
        pairs: idxs.map((pi) => ({ pronoun: PRONOUNS[pi], form: forms[pi] })),
      });
    } else if (kind === "choice") {
      const t = nextTarget();
      const distractors = shuffle(allForms.filter((f) => f !== t.answer));
      const options = shuffle([t.answer, ...uniquePick(distractors, t.answer, 3)]);
      items.push({ kind: "choice", verbId: t.verbId, tense, pronounIndex: t.pronounIndex, answer: t.answer, options });
    } else if (kind === "complete") {
      const t = nextTarget();
      items.push({ kind: "complete", verbId: t.verbId, tense, pronounIndex: t.pronounIndex, answer: t.answer });
    } else {
      const t = nextTarget();
      items.push({ kind: "flash", verbId: t.verbId, tense, pronounIndex: t.pronounIndex, answer: t.answer });
    }
  }

  return { verbIds, tense, items };
}

function uniquePick(pool: string[], exclude: string, n: number): string[] {
  const out: string[] = [];
  for (const f of pool) {
    if (f === exclude || out.includes(f)) continue;
    out.push(f);
    if (out.length === n) break;
  }
  return out;
}
