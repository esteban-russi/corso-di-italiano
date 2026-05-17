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
        padding: "4px 12px",
        borderRadius: 20,
        border: `0.5px solid ${
          lang === "es"
            ? "var(--color-border-primary)"
            : "var(--color-border-secondary)"
        }`,
        background:
          lang === "es"
            ? "var(--color-background-secondary)"
            : "var(--color-background-primary)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        userSelect: "none",
        WebkitUserSelect: "none",
        transition: "all 0.15s",
      }}
    >
      {lang === "es" ? "Español" : "Traducción"}
    </button>
  );
}
