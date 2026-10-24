import { useState } from "react";
import { useLang } from "../context/LangContext";
import { useProfile } from "../context/ProfileContext";
import { useCopy } from "../copy";
import { FEATURED_DAILY_PROMPT } from "../content/italian";
import { btn, card, row } from "../utils";

type Section = "verbs-learning" | "conversation" | "lab" | "settings";

export default function MainMenu({ onSelectSection }: { onSelectSection: (s: Section) => void }) {
  const { lang } = useLang();
  const c = useCopy();
  const { name, lessonsToday, dailyGoal } = useProfile();
  const [showTranslation, setShowTranslation] = useState(false);

  const goalRatio = Math.min(100, Math.round(((lessonsToday.count || 0) / Math.max(1, dailyGoal)) * 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Editorial rule & Kicker */}
      <div style={{ borderBottom: "1px solid var(--color-border-secondary)", paddingBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-primary-text)" }}>
          {c("home.kicker")}
        </div>
      </div>

      {/* Character Hero Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            borderRadius: 6,
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            display: "grid",
            placeItems: "center",
            fontSize: 22,
            fontFamily: "var(--font-serif)",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          M
        </div>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-serif)", color: "var(--color-text-primary)" }}>
            Marco
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-success)", display: "inline-block" }} />
            {lang === "en" ? "Rome · football, food, opinions" : "Roma · fútbol, comida, opiniones"}
          </div>
        </div>
      </div>

      {/* Opener quote in DM Serif Display */}
      <div style={{ borderLeft: "3px solid var(--color-primary)", paddingLeft: 16, margin: "4px 0" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontStyle: "italic", lineHeight: 1.25, color: "var(--color-text-primary)" }}>
          {FEATURED_DAILY_PROMPT.italian}
        </div>
        <button
          onClick={() => setShowTranslation((s) => !s)}
          className="btn-ghost"
          style={{
            ...btn(),
            padding: 0,
            marginTop: 8,
            fontSize: 12,
            color: "var(--color-text-secondary)",
            background: "transparent",
            border: "none",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor: "pointer",
          }}
        >
          {showTranslation ? c("home.hideTranslation") : c("home.showTranslation")}
        </button>
        {showTranslation && (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 6, fontStyle: "normal" }}>
            {FEATURED_DAILY_PROMPT.translation[lang]}
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onSelectSection("conversation")}
          className="btn-primary"
          style={{
            ...btn(),
            flex: 1,
            height: 50,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {c("home.reply")}
        </button>
        <button
          onClick={() => onSelectSection("conversation")}
          className="btn-secondary"
          aria-label="Start voice chat"
          style={{
            ...btn(),
            width: 50,
            height: 50,
            padding: 0,
            fontSize: 18,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          🎙️
        </button>
      </div>

      {/* Today's Goal Card */}
      <div style={{ ...card, padding: "16px 18px", marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)" }}>
            {c("home.today")}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>
            {c("home.goalProgress", { count: lessonsToday.count || 0, goal: dailyGoal })}
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: "var(--color-border-secondary)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${goalRatio}%`,
              background: "var(--color-primary)",
              borderRadius: "inherit",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Practise from your chats */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-secondary)", marginBottom: 10 }}>
          {c("home.practiceHeader")}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <button
            onClick={() => onSelectSection("verbs-learning")}
            style={{
              ...row,
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              justifyContent: "space-between",
              border: "1px solid var(--color-border-secondary)",
              background: "var(--color-background-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>📚</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {lang === "en" ? "Verb Lessons" : "Lecciones de verbos"}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {lang === "en" ? "Conjugate regular and irregular forms" : "Conjuga formas regulares e irregulares"}
                </div>
              </div>
            </div>
            <span aria-hidden="true" style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>›</span>
          </button>

          <button
            onClick={() => onSelectSection("lab")}
            style={{
              ...row,
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              justifyContent: "space-between",
              border: "1px solid var(--color-border-secondary)",
              background: "var(--color-background-primary)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>🧪</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {c("nav.lab")}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {lang === "en" ? "AI Voice & pronunciation workbench" : "Banco de pruebas de voz y pronunciación"}
                </div>
              </div>
            </div>
            <span aria-hidden="true" style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
