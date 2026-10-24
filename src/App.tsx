import { useState, useCallback, useEffect, useRef } from "react";
import { LangProvider, useLang } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StreakProvider } from "./context/StreakContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import type { Lesson } from "./curriculum/types";
import { isForward, navFromPath, pathFor, sameNav, type NavState } from "./navigation";
import { btn, card } from "./utils";
import { useCopy } from "./copy";
import LangToggle from "./components/LangToggle";
import LanguageGate from "./components/LanguageGate";
import MainMenu from "./components/MainMenu";
import Settings from "./components/Settings";
import StreakBadge from "./components/StreakBadge";
import VerbHome from "./components/VerbHome";
import LessonPlayer from "./components/lesson/LessonPlayer";
import LessonSummary from "./components/LessonSummary";
import Conversation from "./components/Conversation";
import { ExperimentLab } from "./components/lab/ExperimentLab";

type Section = NavState["section"];
type Stage =
  | { kind: "home" }
  | { kind: "lesson"; lesson: Lesson; title: string; unitId?: string }
  | { kind: "summary"; errors: number; startTime: number };

function AppContent() {
  const { lang, chosen } = useLang();
  const { completeUnit } = useProfile();
  // Deep links land on a section; lessons cannot be reconstructed from a URL.
  const initial = useRef(navFromPath(window.location.pathname)).current;
  const [section, setSection] = useState<Section>(initial.section);
  const [stage, setStage] = useState<Stage>({ kind: "home" });
  /** Bumped when the system back gesture is caught during a lesson. */
  const [backSignal, setBackSignal] = useState(0);

  const inLesson = section === "verbs-learning" && stage.kind === "lesson";
  const showHomeButton = section !== "home" && !inLesson;

  const nav: NavState = { section, stage: stage.kind };
  const navRef = useRef(nav);
  const inLessonRef = useRef(inLesson);
  inLessonRef.current = inLesson;

  /**
   * Keep the URL in step with the state machine, so the platform back gesture
   * goes back a screen instead of leaving the app (docs/14-platform-pwa.md
   * D-14-2). Going deeper pushes; anything else replaces, so back never lands
   * on a screen the learner did not visit.
   */
  useEffect(() => {
    const previous = navRef.current;
    navRef.current = nav;
    if (sameNav(previous, nav) && window.history.state) return;
    const path = pathFor(nav);
    if (isForward(previous, nav)) window.history.pushState(nav, "", path);
    else window.history.replaceState(nav, "", path);
  }, [nav.section, nav.stage]);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      // A lesson in progress is not abandoned silently: re-assert the entry and
      // let LessonPlayer ask, exactly as its own exit button does.
      if (inLessonRef.current) {
        window.history.pushState(navRef.current, "", pathFor(navRef.current));
        setBackSignal((n) => n + 1);
        return;
      }
      const target: NavState = (event.state as NavState | null) ?? { section: "home", stage: "home" };
      setSection(target.section);
      setStage({ kind: "home" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const subtitle: Record<Section, string> = {
    home: lang === "en" ? "Choose a section" : "Elige una sección",
    "verbs-learning": lang === "en" ? "Verb lessons" : "Lecciones de verbos",
    conversation: lang === "en" ? "Chat with Marco" : "Habla con Marco",
    lab: lang === "en" ? "AI & Voice Experimentation" : "Laboratorio de IA y Voz",
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

  const c = useCopy();

  return (
    <div style={{ padding: "0.5rem 0", fontFamily: "var(--font-sans)" }}>
      {!chosen && <LanguageGate />}

      {/* Editorial Italian Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
          padding: "12px 16px",
          background: "var(--color-background-primary)",
          borderRadius: 8,
          border: "1px solid var(--color-border-secondary)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Corso
            </span>
            <span style={{ color: "var(--color-primary-text)", fontSize: 24, fontWeight: 700 }}>·</span>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-secondary)",
              marginTop: 1,
            }}
          >
            {subtitle[section]}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StreakBadge />
          {showHomeButton && (
            <button
              onClick={goHome}
              className="btn-secondary"
              style={{ ...btn(), padding: "6px 12px", fontSize: 12.5, fontWeight: 600 }}
            >
              {lang === "en" ? "Menu" : "Menú"}
            </button>
          )}
          <LangToggle />
        </div>
      </header>

      {/* Main Content View */}
      <main key={`${section}-${stage.kind}`} className="fade-in" style={card}>
        {section === "home" && <MainMenu onSelectSection={(s) => { setSection(s); setStage({ kind: "home" }); }} />}

        {section === "verbs-learning" && stage.kind === "home" && <VerbHome onStart={startLesson} />}
        {section === "verbs-learning" && stage.kind === "lesson" && (
          <LessonPlayer lesson={stage.lesson} title={stage.title} backSignal={backSignal} onExit={backToVerbHome} onFinish={finishLesson} />
        )}
        {section === "verbs-learning" && stage.kind === "summary" && (
          <LessonSummary errors={stage.errors} startTime={stage.startTime} onReturnHome={backToVerbHome} />
        )}

        {section === "conversation" && <Conversation />}
        {section === "lab" && <ExperimentLab />}
        {section === "settings" && <Settings onBack={goHome} />}
      </main>

      {/* Pattern C Mobile Bottom Navigation Bar */}
      {!inLesson && (
        <nav
          aria-label="Main Navigation"
          style={{
            position: "sticky",
            bottom: 8,
            marginTop: 20,
            padding: "8px 12px calc(8px + env(safe-area-inset-bottom))",
            background: "var(--color-background-primary)",
            border: "1px solid var(--color-border-secondary)",
            borderRadius: 8,
            boxShadow: "var(--shadow-md)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            zIndex: 40,
          }}
        >
          {[
            { id: "home", label: c("nav.talk"), icon: "💬" },
            { id: "verbs-learning", label: c("nav.learn"), icon: "📚" },
            { id: "lab", label: c("nav.lab"), icon: "🧪" },
            { id: "settings", label: c("nav.you"), icon: "⚙️" },
          ].map((tab) => {
            const active = section === tab.id || (tab.id === "home" && section === "conversation");
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSection(tab.id as Section);
                  setStage({ kind: "home" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "4px 14px",
                  color: active ? "var(--color-primary-text)" : "var(--color-text-secondary)",
                  fontWeight: active ? 700 : 500,
                  fontSize: 11.5,
                  fontFamily: "var(--font-sans)",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span>{tab.label}</span>
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      width: 18,
                      height: 2,
                      borderRadius: 1,
                      background: "var(--color-primary)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
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
