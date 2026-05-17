import { createContext, useContext, useState, type ReactNode } from "react";
import type { Lang } from "../types";

const LangCtx = createContext<{ lang: Lang; toggle: () => void }>({
  lang: "it",
  toggle: () => {},
});

export function useLang() {
  return useContext(LangCtx);
}

export function T({ it, es }: { it: string; es: string }) {
  const { lang } = useLang();
  return <>{lang === "it" ? it : es}</>;
}

export function t(lang: Lang, it: string, es: string) {
  return lang === "it" ? it : es;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("it");
  const toggle = () => setLang((l) => (l === "it" ? "es" : "it"));
  return (
    <LangCtx.Provider value={{ lang, toggle }}>
      {children}
    </LangCtx.Provider>
  );
}
