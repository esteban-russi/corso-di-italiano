import { useLang } from "../context/LangContext";

export default function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      title={lang === "it" ? "Mostra in spagnolo" : "Mostrar en italiano"}
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        border: "0.5px solid var(--color-border-secondary)",
        background: "var(--color-background-secondary)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
      }}
    >
      {lang === "it" ? "🇪🇸 Ver en Español" : "🇮🇹 Italiano"}
    </button>
  );
}
