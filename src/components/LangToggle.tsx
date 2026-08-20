import { useLang } from "../context/LangContext";

/** Compact EN/ES interface-language switch shown in the header. */
export default function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Interface language"
      style={{
        display: "inline-flex",
        borderRadius: 999,
        border: "1px solid var(--color-border-secondary)",
        overflow: "hidden",
        background: "var(--color-background-primary)",
      }}
    >
      {(["en", "es"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={active}
            style={{
              padding: "6px 12px",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              background: active ? "var(--color-primary)" : "transparent",
              color: active ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {l === "en" ? "EN" : "ES"}
          </button>
        );
      })}
    </div>
  );
}
