import { useLang } from "../context/LangContext";
import type { Lang } from "../types";

/**
 * First-launch overlay: pick the interface language (English or Spanish).
 * Italian flavor words (Ciao!, Andiamo!) are shown regardless — they set the tone.
 */
export default function LanguageGate() {
  const { setLang } = useLang();

  const OPTIONS: { value: Lang; flag: string; label: string; sub: string }[] = [
    { value: "en", flag: "🇬🇧", label: "English", sub: "Continue in English" },
    { value: "es", flag: "🇪🇸", label: "Español", sub: "Continuar en español" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
    >
      <div
        className="fade-in"
        style={{
          background: "var(--color-background-primary)",
          borderRadius: 18,
          padding: "34px 30px 28px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--color-border-tertiary)",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 6 }} aria-hidden="true">
          🇮🇹
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
          Ciao! 👋
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "8px 0 22px", lineHeight: 1.55 }}>
          Choose your language / Elige tu idioma
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setLang(o.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "left",
                border: "1px solid var(--color-border-secondary)",
                background: "var(--color-background-primary)",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 26 }} aria-hidden="true">{o.flag}</span>
              <span>
                <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {o.label}
                </span>
                <span style={{ display: "block", fontSize: 12.5, color: "var(--color-text-secondary)" }}>
                  {o.sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
