import { useState, useCallback } from "react";
import { LangProvider, useLang } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StreakProvider } from "./context/StreakContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import type { Lesson } from "./curriculum/types";
import { btn, card } from "./utils";
import LangToggle from "./components/LangToggle";
import LanguageGate from "./components/LanguageGate";
import MainMenu from "./components/MainMenu";
import Settings from "./components/Settings";
import StreakBadge from "./components/StreakBadge";
import VerbHome from "./components/VerbHome";
import LessonPlayer from "./components/lesson/LessonPlayer";
import LessonSummary from "./components/LessonSummary";
import Conversation from "./components/Conversation";

type Section = "home" | "verbs-learning" | "conversation" | "settings";
type Stage =
  | { kind: "home" }
  | { kind: "lesson"; lesson: Lesson; title: string; unitId?: string }
  | { kind: "summary"; errors: number; startTime: number };

function AppContent() {
  const { lang, chosen } = useLang();
  const { completeUnit } = useProfile();
  const [section, setSection] = useState<Section>("home");
  const [stage, setStage] = useState<Stage>({ kind: "home" });

  const inLesson = section === "verbs-learning" && stage.kind === "lesson";
  const showHomeButton = section !== "home" && !inLesson;

  const subtitle: Record<Section, string> = {
    home: lang === "en" ? "Choose a section" : "Elige una sección",
    "verbs-learning": lang === "en" ? "Verb lessons" : "Lecciones de verbos",
    conversation: lang === "en" ? "Chat with Marco" : "Habla con Marco",
    settings: lang === "en" ? "Personalize the app" : "Personaliza la app",
  };

  const startLesson = useCallback((lesson: Lesson, title: string, unitId?: string) => {
    setStage({ kind: "lesson", lesson, title, unitId });
  }, []);

  const finishLesson = useCallback((errors: number, startTime: number) => {
    setStage((s) => {
      if (s.kind === "lesson" && s.unitId) completeUnit(s.unitId);
      return { kind: "summary", errors, startTime };
    });
  }, [completeUnit]);

  const goHome = useCallback(() => {
    setStage({ kind: "home" });
    setSection("home");
  }, []);

  const backToVerbHome = useCallback(() => setStage({ kind: "home" }), []);

  return (
    <div style={{ padding: "1rem 0", fontFamily: "var(--font-sans)" }}>
      {!chosen && <LanguageGate />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, padding: "14px 18px", background: "linear-gradient(135deg, var(--color-primary-softer), var(--color-background-primary) 70%)", borderRadius: 14, border: "1px solid var(--color-border-tertiary)", boxShadow: "var(--shadow-sm)" }}>
        <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: "var(--shadow-md)" }}>🇮🇹</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
            Corso di Italiano
            <span aria-hidden="true" style={{ display: "inline-flex", borderRadius: 3, overflow: "hidden" }}>
              <span style={{ width: 5, height: 12, background: "#009246" }} />
              <span style={{ width: 5, height: 12, background: "#fff", border: "0.5px solid var(--color-border-tertiary)" }} />
              <span style={{ width: 5, height: 12, background: "#CE2B37" }} />
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 2 }}>{subtitle[section]}</div>
        </div>
        <span style={{ flex: 1 }} />
        <StreakBadge />
        {showHomeButton && (
          <button onClick={goHome} className="btn-secondary" style={{ ...btn(), padding: "7px 12px", fontSize: 12.5, fontWeight: 600 }}>
            {lang === "en" ? "Menu" : "Menú"}
          </button>
        )}
        <LangToggle />
      </div>

      {/* Content */}
      <div key={`${section}-${stage.kind}`} className="fade-in" style={card}>
        {section === "home" && <MainMenu onSelectSection={(s) => { setSection(s); setStage({ kind: "home" }); }} />}

        {section === "verbs-learning" && stage.kind === "home" && <VerbHome onStart={startLesson} />}
        {section === "verbs-learning" && stage.kind === "lesson" && (
          <LessonPlayer lesson={stage.lesson} title={stage.title} onExit={backToVerbHome} onFinish={finishLesson} />
        )}
        {section === "verbs-learning" && stage.kind === "summary" && (
          <LessonSummary errors={stage.errors} startTime={stage.startTime} onReturnHome={backToVerbHome} />
        )}

        {section === "conversation" && <Conversation />}
        {section === "settings" && <Settings onBack={goHome} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <ProfileProvider>
          <StreakProvider>
            <AppContent />
          </StreakProvider>
        </ProfileProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
