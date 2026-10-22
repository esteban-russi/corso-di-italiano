import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// WCAG 2.1 AA contrast on the token palette, in both themes (docs/07, deliverables
// 6 and 9). Contrast defects have shipped twice in this project's history (see the
// 07 work log); a palette change must not be able to reintroduce one silently.

const html = readFileSync(join(import.meta.dirname, "..", "index.html"), "utf8");

/** token name → hex value, for one CSS selector block. */
function palette(selector: string): Map<string, string> {
  const start = html.indexOf(selector);
  const open = html.indexOf("{", start);
  const block = html.slice(open, html.indexOf("}", open));
  const out = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) {
    out.set(name, value);
  }
  return out;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5; // AA, body text
const UI = 3; // AA, non-text UI: borders of selected states, meters, focus edges

const surfaces = ["--color-background-primary", "--color-background-secondary"];

/** [foreground, background, minimum ratio] */
const PAIRS: [string, string, number][] = [
  ...surfaces.flatMap((bg): [string, string, number][] => [
    ["--color-text-primary", bg, TEXT],
    ["--color-text-secondary", bg, TEXT],
    ["--color-primary-text", bg, TEXT],
    ["--color-danger", bg, TEXT],
    ["--color-success", bg, TEXT],
    ["--color-primary", bg, UI],
  ]),
  ["--color-on-primary", "--color-primary", TEXT],
  ["--color-on-primary", "--color-primary-hover", TEXT],
  ["--color-on-primary", "--color-primary-active", TEXT],
  ["--color-on-danger", "--color-danger", TEXT],
  ["--color-correction-ok-text", "--color-correction-ok-bg", TEXT],
  ["--color-correction-note-text", "--color-correction-note-bg", TEXT],
  ...Array.from({ length: 8 }, (_, i): [string, string, number] => [
    `--color-badge-${i + 1}-fg`,
    `--color-badge-${i + 1}-bg`,
    TEXT,
  ]),
];

describe.each([":root", '[data-theme="dark"]'])("contrast in %s", (theme) => {
  const tokens = palette(theme);

  it("parses a real palette", () => {
    expect(tokens.size).toBeGreaterThan(40);
  });

  it.each(PAIRS)("%s on %s ≥ %d", (fg, bg, min) => {
    const f = tokens.get(fg);
    const b = tokens.get(bg);
    expect(f, `${fg} is not a 6-digit hex in ${theme}`).toBeDefined();
    expect(b, `${bg} is not a 6-digit hex in ${theme}`).toBeDefined();
    expect(contrast(f!, b!)).toBeGreaterThanOrEqual(min);
  });
});
