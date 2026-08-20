import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// CLAUDE.md: always use tokens (var(--color-*)), never literal colours. Colours
// live in index.html so the redesign can restyle in one place
// (docs/07-design-system.md, deliverable 1). This test is what keeps that true
// as screens get rewritten.

const SRC = join(import.meta.dirname, ".");
const INDEX_HTML = join(import.meta.dirname, "..", "index.html");

/** Hex colours and rgb()/rgba() literals. */
const HEX_OR_RGB = /#[0-9a-fA-F]{3,8}\b|rgba?\([0-9.,\s]+\)/g;
/** CSS named colours that read as innocuous but bypass the token layer. */
const NAMED = /\b(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*["'](?:white|black|red|green|blue|grey|gray|orange|yellow|purple|pink)["']/g;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...sourceFiles(full));
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function offenders(pattern: RegExp): string[] {
  const found: string[] = [];
  for (const file of sourceFiles(SRC)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const match of line.match(pattern) ?? []) {
        found.push(`${file.slice(SRC.length + 1)}:${i + 1}  ${match.trim()}`);
      }
    });
  }
  return found;
}

describe("no literal colours in src/", () => {
  it("uses no hex or rgb() literals", () => {
    // If this fails, add a token to index.html (both themes) and reference it.
    expect(offenders(HEX_OR_RGB)).toEqual([]);
  });

  it("uses no CSS named colours", () => {
    expect(offenders(NAMED)).toEqual([]);
  });

  it("actually scans a non-trivial number of files", () => {
    // Guards against the walker silently finding nothing and passing.
    expect(sourceFiles(SRC).length).toBeGreaterThan(15);
  });
});

describe("token layer", () => {
  const html = readFileSync(INDEX_HTML, "utf8");

  /** Token names declared inside a given CSS selector block. */
  function tokensIn(selector: string): Set<string> {
    const start = html.indexOf(selector);
    expect(start, `${selector} block is missing`).toBeGreaterThan(-1);
    const open = html.indexOf("{", start);
    const close = html.indexOf("}", open);
    const block = html.slice(open, close);
    return new Set(block.match(/--[a-z0-9-]+(?=\s*:)/g) ?? []);
  }

  it("defines every colour token used in src/ ", () => {
    const declared = new Set([...tokensIn(":root"), ...tokensIn('[data-theme="dark"]')]);
    const used = new Set<string>();
    for (const file of sourceFiles(SRC)) {
      for (const match of readFileSync(file, "utf8").match(/--color-[a-z0-9-]+/g) ?? []) {
        used.add(match);
      }
    }
    // Tokens built by interpolation (badge slots, correction tones) are checked
    // separately below, since the literal name never appears in the source.
    const interpolated = /^--color-(badge|correction)-/;
    const missing = [...used].filter((t) => !declared.has(t) && !interpolated.test(t));
    expect(missing).toEqual([]);
  });

  it("declares the light and dark palettes symmetrically", () => {
    const light = tokensIn(":root");
    const dark = tokensIn('[data-theme="dark"]');
    // --font-sans is intentionally light-only; everything else must be paired,
    // or a theme switch will silently inherit the wrong value.
    const lightOnly = [...light].filter((t) => !dark.has(t) && t !== "--font-sans");
    const darkOnly = [...dark].filter((t) => !light.has(t));
    expect({ lightOnly, darkOnly }).toEqual({ lightOnly: [], darkOnly: [] });
  });

  it("declares all eight badge slots in both themes", () => {
    for (const theme of [":root", '[data-theme="dark"]']) {
      const tokens = tokensIn(theme);
      for (let slot = 1; slot <= 8; slot++) {
        expect(tokens, `${theme} badge ${slot}`).toContain(`--color-badge-${slot}-bg`);
        expect(tokens, `${theme} badge ${slot}`).toContain(`--color-badge-${slot}-fg`);
      }
    }
  });

  it("declares both correction tones in both themes", () => {
    for (const theme of [":root", '[data-theme="dark"]']) {
      const tokens = tokensIn(theme);
      for (const tone of ["ok", "note"]) {
        for (const part of ["bg", "border", "text"]) {
          expect(tokens, `${theme} ${tone}`).toContain(`--color-correction-${tone}-${part}`);
        }
      }
    }
  });
});
