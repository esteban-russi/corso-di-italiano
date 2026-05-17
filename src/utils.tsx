import type { ReactNode } from "react";
import React from "react";

/* ------------------------------------------------------------------ */
/*  STYLE HELPERS                                                      */
/* ------------------------------------------------------------------ */
export const btn = (active = false): React.CSSProperties => ({
  padding: "8px 20px",
  borderRadius: 8,
  border: `0.5px solid var(--color-border-secondary)`,
  background: active
    ? "var(--color-background-secondary)"
    : "var(--color-background-primary)",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: 14,
  color: "var(--color-text-primary)",
});

export const card: React.CSSProperties = {
  background: "var(--color-background-primary)",
  border: "0.5px solid var(--color-border-tertiary)",
  borderTop: "3px solid #009246",
  borderRadius: 12,
  padding: "20px 20px",
};

export const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  background: "var(--color-background-secondary)",
  borderRadius: 10,
  border: "0.5px solid var(--color-border-tertiary)",
};

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

export function formatMessage(text: string): ReactNode {
  // Split corrections block from main text
  const correctionRegex = /((?:📝|✅).*)/s;
  const corrMatch = text.match(correctionRegex);
  const mainText = corrMatch ? text.slice(0, corrMatch.index).trim() : text;
  const correctionText = corrMatch ? corrMatch[1].trim() : null;

  // Parse inline formatting: **bold**
  const parseInline = (str: string): ReactNode[] => {
    const parts: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      parts.push(
        <b key={m.index} style={{ fontWeight: 600, color: "#3C3489" }}>
          {m[1]}
        </b>
      );
      last = re.lastIndex;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts;
  };

  // Split main text into paragraphs
  const paragraphs = mainText.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((p, i) => (
        <span key={i} style={{ display: "block", marginBottom: i < paragraphs.length - 1 ? 8 : 0 }}>
          {parseInline(p)}
        </span>
      ))}
      {correctionText && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "#FFF8E6",
            border: "0.5px solid #E8D48A",
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.6,
            color: "#6B5A00",
          }}
        >
          {correctionText.split("\n").map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </>
  );
}
