import { useState, useCallback, useEffect, useRef } from "react";
import { LangProvider, useLang } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StreakProvider } from "./context/StreakContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import type { Lesson } from "./curriculum/types";
import { isForward, navFromPath, pathFor, sameNav, type NavState } from "./navigation";
import { btn, card, onPrimary } from "./utils";
import LangToggle from "./components/LangToggle";
import LanguageGate from "./components/LanguageGate";
import MainMenu from "./components/MainMenu";
import Settings from "./components/Settings";
import StreakBadge from "./components/StreakBadge";
import VerbHome from "./components/VerbHome";
import LessonPlayer from "./components/lesson/LessonPlayer";
import LessonSummary from "./components/LessonSummary";
import Conversation from "./components/Conversation";

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
        <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, ...onPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: "var(--shadow-md)" }}>🇮🇹</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
            Corso di Italiano
            <span aria-hidden="true" style={{ display: "inline-flex", borderRadius: 3, overflow: "hidden" }}>
              <span style={{ width: 5, height: 12, background: "var(--color-flag-green)" }} />
              <span style={{ width: 5, height: 12, background: "var(--color-flag-white)", border: "0.5px solid var(--color-border-tertiary)" }} />
              <span style={{ width: 5, height: 12, background: "var(--color-flag-red)" }} />
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
          <LessonPlayer lesson={stage.lesson} title={stage.title} backSignal={backSignal} onExit={backToVerbHome} onFinish={finishLesson} />
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
