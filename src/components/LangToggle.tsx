import { useCallback } from "react";
import { useLang } from "../context/LangContext";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  const show = useCallback(() => setLang("es"), [setLang]);
  const hide = useCallback(() => setLang("it"), [setLang]);

  return (
    <button
      onMouseDown={show}
      onMouseUp={hide}
      onMouseLeave={hide}
      onTouchStart={show}
      onTouchEnd={hide}
      title="Mantén presionado para ver en español"
      style={{
        padding: "6px 14px",
        borderRadius: 999,
        border: `1px solid ${lang === "es" ? "var(--color-primary)" : "var(--color-border-secondary)"}`,
        background:
          lang === "es"
            ? "var(--color-primary-softer)"
            : "var(--color-background-primary)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        color: lang === "es" ? "var(--color-primary-hover)" : "var(--color-text-secondary)",
        userSelect: "none",
        WebkitUserSelect: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span aria-hidden="true">🌐</span>
      {lang === "es" ? "Español" : "Traducción"}
    </button>
  );
}
