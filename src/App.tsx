import { useState, useCallback, useEffect, useRef } from "react";
import { LangProvider, useLang } from "./context/LangContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StreakProvider, useStreak } from "./context/StreakContext";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import type { Lesson } from "./curriculum/types";
import { isForward, navFromPath, pathFor, sameNav, type NavState } from "./navigation";
import LangToggle from "./components/LangToggle";
import LanguageGate from "./components/LanguageGate";
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
  const streak = useStreak();
  // Deep links land on a section; lessons cannot be reconstructed from a URL.
  const initial = useRef(navFromPath(window.location.pathname)).current;
  const [section, setSection] = useState<Section>(initial.section);
  const [stage, setStage] = useState<Stage>({ kind: "home" });
  /** Bumped when the system back gesture is caught during a lesson. */
  const [backSignal, setBackSignal] = useState(0);

  const inLesson = section === "verbs-learning" && stage.kind === "lesson";

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
    home: lang === "en" ? "Conversational Italian" : "Italiano conversacional",
    "verbs-learning": lang === "en" ? "Verb lessons" : "Lecciones de verbos",
    conversation: lang === "en" ? "Chat and calls" : "Chat y llamadas",
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

  const goToSection = useCallback((sec: Section) => {
    setSection(sec);
    setStage({ kind: "home" });
  }, []);

  const backToVerbHome = useCallback(() => setStage({ kind: "home" }), []);

  // When viewing verbs or settings: clean full-page container with top bar
  if (section === "verbs-learning" || section === "settings") {
    return (
      <div className="h-screen w-screen bg-slate-100 text-slate-900 font-sans flex flex-col overflow-hidden">
        {!chosen && <LanguageGate />}
        <header className="px-5 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToSection("conversation")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              ← {lang === "en" ? "Back to Chat" : "Volver al chat"}
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="font-bold text-sm text-slate-900">{subtitle[section]}</span>
          </div>
          <div className="flex items-center gap-3">
            <StreakBadge />
            <LangToggle />
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
          {section === "verbs-learning" && stage.kind === "home" && <VerbHome onStart={startLesson} />}
          {section === "verbs-learning" && stage.kind === "lesson" && (
            <LessonPlayer lesson={stage.lesson} title={stage.title} backSignal={backSignal} onExit={backToVerbHome} onFinish={finishLesson} />
          )}
          {section === "verbs-learning" && stage.kind === "summary" && (
            <LessonSummary errors={stage.errors} startTime={stage.startTime} onReturnHome={backToVerbHome} />
          )}
          {section === "settings" && <Settings onBack={() => goToSection("conversation")} />}
        </main>
      </div>
    );
  }

  // Primary view: Full-screen filling conversational chat and audio calls (Italix-AI UI)
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {!chosen && <LanguageGate />}
      <Conversation
        onNavigate={goToSection}
        activeSection={section}
        streakCount={streak.currentStreak}
      />
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
