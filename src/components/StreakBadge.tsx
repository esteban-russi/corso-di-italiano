import { useState, useRef, useEffect } from "react";
import { T } from "../context/LangContext";
import { useStreak } from "../context/StreakContext";

export default function StreakBadge() {
  const { currentStreak, longestStreak } = useStreak();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const active = currentStreak >= 1;

  // Dismiss the popover on any click outside the badge/popover.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Streak"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "6px 11px",
          borderRadius: 999,
          border: `1px solid ${active ? "var(--color-primary-soft)" : "var(--color-border-secondary)"}`,
          background: active ? "var(--color-primary-softer)" : "var(--color-background-primary)",
          color: active ? "var(--color-primary-hover)" : "var(--color-text-secondary)",
          fontWeight: active ? 700 : 500,
          fontSize: 13.5,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 15, filter: active ? "none" : "grayscale(0.6) opacity(0.7)" }}>
          🍕
        </span>
        {currentStreak}
      </button>

      {open && (
        <div
          className="fade-in"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 1100,
            width: 210,
            padding: "14px 16px",
            background: "var(--color-background-primary)",
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 12,
            boxShadow: "var(--shadow-lg)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>
            🍕 {currentStreak} <T en="days" es="días" />
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginBottom: 10 }}>
            <T en={`Record: ${longestStreak} days`} es={`Récord: ${longestStreak} días`} />
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-primary-hover)",
              paddingTop: 8,
              borderTop: "1px solid var(--color-border-tertiary)",
            }}
          >
            {currentStreak > 0 ? (
              <T en="Keep it up!" es="¡Sigue así!" />
            ) : (
              <T en="Start today!" es="¡Empieza hoy!" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
