import type { ReactNode } from "react";
import React from "react";

/* ------------------------------------------------------------------ */
/*  STYLE HELPERS                                                      */
/* ------------------------------------------------------------------ */
export const btn = (active = false): React.CSSProperties => ({
  padding: "9px 18px",
  borderRadius: 10,
  border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border-secondary)"}`,
  background: active
    ? "var(--color-primary-softer)"
    : "var(--color-background-primary)",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 14,
  color: active ? "var(--color-primary-hover)" : "var(--color-text-primary)",
});

export const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "1px solid var(--color-border-tertiary)",
  borderTop: "3px solid var(--color-primary)",
  borderRadius: 14,
  padding: "22px 22px",
  boxShadow: "var(--shadow-sm)",
};

export const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  background: "var(--color-background-secondary)",
  borderRadius: 10,
  border: "1px solid var(--color-border-tertiary)",
};

/**
 * Filled-primary surface: the one place that knows what colour sits on top of
 * --color-primary. Used by the header tile, the language toggle, the path
 * START pill and the learner's chat bubble.
 */
export const onPrimary: React.CSSProperties = {
  background: "var(--color-primary)",
  color: "var(--color-on-primary)",
};

/** Full-screen wash behind a modal. `blur` in px; 0 disables the backdrop filter. */
export const scrim = (blur = 3): React.CSSProperties => ({
  position: "fixed",
  inset: 0,
  background: "var(--color-scrim)",
  backdropFilter: blur ? `blur(${blur}px)` : undefined,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

/** Centred dialog panel that sits inside a `scrim`. */
export const modalPanel = (radius = 16): React.CSSProperties => ({
  background: "var(--color-background-primary)",
  borderRadius: radius,
  textAlign: "center",
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--color-border-tertiary)",
});

/** Small categorical chip, coloured by `verbColor` (see config.ts). */
export const badge = (tone: { bg: string; color: string }): React.CSSProperties => ({
  background: tone.bg,
  color: tone.color,
  borderRadius: 999,
  fontWeight: 600,
});

export const sub: React.CSSProperties = {
  fontSize: 14,
  color: "var(--color-text-secondary)",
};

/* ------------------------------------------------------------------ */
/*  UTILITIES                                                          */
/* ------------------------------------------------------------------ */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** "ok" for a confirmation line, "note" for a correction. */
function correctionTone(lines: string[]): "ok" | "note" {
  return lines.some((l) => l.startsWith("✅")) ? "ok" : "note";
}

export function formatMessage(text: string): ReactNode {
  // Parse inline formatting: **bold**
  const parseInline = (str: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      parts.push(
        <b key={m.index} style={{ fontWeight: 600, color: "var(--color-primary-hover)" }}>
          {m[1]}
        </b>
      );
      last = re.lastIndex;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  };

  // Split into lines, classify correction vs conversation
  const lines = text.split("\n");
  const correctionLines: string[] = [];
  const conversationLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("📝") || trimmed.startsWith("✅")) {
      correctionLines.push(trimmed);
    } else {
      conversationLines.push(line);
    }
  }

  const conversationText = conversationLines.join("\n").trim();
  const paragraphs = conversationText.split(/\n\n+/).filter(Boolean);

  return (
    <>
      {correctionLines.length > 0 && (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 12px",
            background: `var(--color-correction-${correctionTone(correctionLines)}-bg)`,
            border: `0.5px solid var(--color-correction-${correctionTone(correctionLines)}-border)`,
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.6,
            color: `var(--color-correction-${correctionTone(correctionLines)}-text)`,
          }}
        >
          {correctionLines.map((line, i) => (
            <div key={i}>{parseInline(line)}</div>
          ))}
        </div>
      )}
      {paragraphs.map((p, i) => (
        <span key={i} style={{ display: "block", marginBottom: i < paragraphs.length - 1 ? 8 : 0 }}>
          {parseInline(p)}
        </span>
      ))}
    </>
  );
}
