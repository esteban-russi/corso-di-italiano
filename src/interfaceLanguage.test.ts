import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COPY, FLAVOUR_WORDS, ITALIAN_MARKERS, copy } from "./copy";

// The learner does not speak Italian — that is the premise of the app. So no
// Italian may appear in src/components/ except the flavour allowlist.
//
// This guard exists mainly for the future: docs/07-design-system.md is about to
// rewrite every screen, and docs/06-slang-and-idioms.md adds a section full of
// Italian content sitting right next to Italian-looking labels. Without a check
// in CI, that boundary quietly erodes.

const SRC = join(import.meta.dirname, ".");
const COMPONENTS = join(SRC, "components");

const ALLOWED = new Set<string>(FLAVOUR_WORDS);
const MARKERS = new Set<string>(ITALIAN_MARKERS);

function files(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...files(full));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Words inside double- or single-quoted string literals and template literals. */
function stringLiterals(source: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  source.split("\n").forEach((line, i) => {
    // Skip comments: they explain the rule and may legitimately name Italian.
    const code = line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "");
    for (const match of code.match(/"[^"]*"|'[^']*'|`[^`]*`/g) ?? []) {
      out.push({ line: i + 1, text: match.slice(1, -1) });
    }
  });
  return out;
}

function normalizeWord(word: string): string {
  return word.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function leaks(dir: string): string[] {
  const found: string[] = [];
  for (const file of files(dir)) {
    for (const { line, text } of stringLiterals(readFileSync(file, "utf8"))) {
      for (const raw of text.split(/[^\p{L}]+/u)) {
        if (!raw) continue;
        const word = normalizeWord(raw);
        if (MARKERS.has(word) && !ALLOWED.has(word)) {
          found.push(`${file.slice(SRC.length + 1)}:${line}  "${raw}" in ${JSON.stringify(text.slice(0, 60))}`);
        }
      }
    }
  }
  return found;
}

describe("no Italian content in src/components/", () => {
  it("finds no un-allowlisted Italian words", () => {
    // If this fails: the string is either interface text (move it to
    // src/copy.ts and localize it) or Italian content (move it to
    // src/content/italian.ts). It is almost never a new flavour word.
    expect(leaks(COMPONENTS)).toEqual([]);
  });

  it("scans a meaningful number of component files", () => {
    // Guards against the walker silently finding nothing and passing.
    expect(files(COMPONENTS).length).toBeGreaterThan(10);
  });

  it("actually detects a leak when there is one", () => {
    // The guard's own smoke test: prove the detector fires, so a passing suite
    // means "no leaks" rather than "the detector is broken".
    const sample = 'const x = "Non ho capito, puoi ripetere?";';
    const words = stringLiterals(sample).flatMap(({ text }) =>
      text.split(/[^\p{L}]+/u).map(normalizeWord)
    );
    expect(words.some((w) => MARKERS.has(w) && !ALLOWED.has(w))).toBe(true);
  });

  it("does not flag allowlisted flavour words", () => {
    const sample = 'const x = "Bravo — keep it up!"; const y = "Ciao! 👋";';
    const offenders = stringLiterals(sample).flatMap(({ text }) =>
      text
        .split(/[^\p{L}]+/u)
        .map(normalizeWord)
        .filter((w) => MARKERS.has(w) && !ALLOWED.has(w))
    );
    expect(offenders).toEqual([]);
  });
});

describe("flavour-word allowlist", () => {
  it("is lowercase, accent-free and unique, so lookups are stable", () => {
    for (const word of FLAVOUR_WORDS) expect(word).toBe(normalizeWord(word));
    expect(new Set(FLAVOUR_WORDS).size).toBe(FLAVOUR_WORDS.length);
  });

  it("shares no word with the marker list", () => {
    // A word in both would make the marker unreachable and the rule ambiguous.
    const overlap = ITALIAN_MARKERS.filter((m) => ALLOWED.has(m));
    expect(overlap).toEqual([]);
  });
});

describe("copy catalog", () => {
  it("has both languages for every entry, non-empty", () => {
    for (const [id, entry] of Object.entries(COPY)) {
      expect(entry.en.trim(), `${id}.en`).not.toBe("");
      expect(entry.es.trim(), `${id}.es`).not.toBe("");
    }
  });

  it("uses the same placeholders in both languages", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const [id, entry] of Object.entries(COPY)) {
      expect(placeholders(entry.es), `${id}`).toEqual(placeholders(entry.en));
    }
  });

  it("contains no Italian outside the flavour allowlist", () => {
    const offenders: string[] = [];
    for (const [id, entry] of Object.entries(COPY)) {
      for (const value of [entry.en, entry.es]) {
        for (const raw of value.split(/[^\p{L}]+/u)) {
          const word = normalizeWord(raw);
          if (word && MARKERS.has(word) && !ALLOWED.has(word)) offenders.push(`${id}: ${raw}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("interpolates placeholders and leaves unknown ones intact", () => {
    expect(copy("en", "entry.unitProgress", { current: 3, total: 14 })).toBe("Unit 3 of 14");
    expect(copy("es", "entry.unitProgress", { current: 3, total: 14 })).toBe("Unidad 3 de 14");
    expect(copy("en", "entry.unitProgress", { current: 3 })).toBe("Unit 3 of {total}");
  });

  it("returns the requested language", () => {
    expect(copy("en", "state.retry")).toBe("Try again");
    expect(copy("es", "state.retry")).toBe("Inténtalo de nuevo");
  });
});
