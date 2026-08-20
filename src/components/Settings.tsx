import { T } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import { btn } from "../utils";

type ThemeMode = "light" | "dark" | "system";

const OPTIONS: { value: ThemeMode; emoji: string; labelIt: string; labelEs: string }[] = [
  { value: "light", emoji: "☀️", labelIt: "Chiaro", labelEs: "Claro" },
  { value: "dark", emoji: "🌙", labelIt: "Scuro", labelEs: "Oscuro" },
  { value: "system", emoji: "💻", labelIt: "Sistema", labelEs: "Sistema" },
];

export default function Settings({ onBack }: { onBack: () => void }) {
  const { mode, setMode } = useTheme();

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          <T it="Impostazioni" es="Ajustes" />
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <T it="Personalizza l'aspetto dell'app." es="Personaliza el aspecto de la app." />
        </div>
      </div>

      {/* Theme section */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10 }}>
          <T it="Tema" es="Tema" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {OPTIONS.map((opt) => {
            const active = mode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "16px 8px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  border: `2px solid ${active ? "var(--color-primary)" : "var(--color-border-tertiary)"}`,
                  background: active ? "var(--color-primary-softer)" : "var(--color-background-primary)",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
              >
                <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--color-primary-hover)" : "var(--color-text-primary)",
                }}>
                  <T it={opt.labelIt} es={opt.labelEs} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex" }}>
        <button onClick={onBack} className="btn-secondary" style={{ ...btn(), padding: "10px 18px", fontWeight: 600 }}>
          <T it="Torna al menu" es="Volver al menú" />
        </button>
      </div>
    </div>
  );
}
