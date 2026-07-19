import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang } from "../types";

const STORAGE_KEY = "corso-lang";

type LangValue = {
  /** Interface language: English or Spanish. Italian is the *content* language. */
  lang: Lang;
  /** False until the learner has explicitly picked a language (first-launch picker). */
  chosen: boolean;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LangCtx = createContext<LangValue>({
  lang: "en",
  chosen: false,
  setLang: () => {},
  toggle: () => {},
});

export function useLang() {
  return useContext(LangCtx);
}

/** Render one of two interface strings. Italian flavor words are plain literals, not `T`. */
export function T({ en, es }: { en: string; es: string }) {
  const { lang } = useLang();
  return <>{lang === "en" ? en : es}</>;
}

export function t(lang: Lang, en: string, es: string) {
  return lang === "en" ? en : es;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "es" ? stored : "en";
  });
  const [chosen, setChosen] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "es";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setChosen(true);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggle = useCallback(() => {
    setLangState((l) => {
      const next = l === "en" ? "es" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
    setChosen(true);
  }, []);

  return (
    <LangCtx.Provider value={{ lang, chosen, setLang, toggle }}>
      {children}
    </LangCtx.Provider>
  );
}
