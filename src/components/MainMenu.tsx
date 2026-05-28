import { T } from "../context/LangContext";

type MainMenuProps = {
  onSelectSection: (section: "verbs-learning" | "conversation" | "settings") => void;
};

function MenuCard({
  emoji,
  titleIt,
  titleEs,
  bodyIt,
  bodyEs,
  accent,
  badge,
  onClick,
}: {
  emoji: string;
  titleIt: string;
  titleEs: string;
  bodyIt: string;
  bodyEs: string;
  accent: string;
  badge?: { it: string; es: string };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "52px 1fr auto",
        alignItems: "center",
        gap: 16,
        width: "100%",
        padding: "20px 22px",
        textAlign: "left",
        background: "var(--color-background-primary)",
        border: "1px solid var(--color-border-tertiary)",
        borderLeft: `4px solid ${accent}`,
        borderRadius: 14,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          background: `${accent}18`,
        }}
      >
        {emoji}
      </span>
      <span>
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)" }}>
            <T it={titleIt} es={titleEs} />
          </span>
          {badge && (
            <span style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--color-border-tertiary)",
              color: "var(--color-text-secondary)",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}>
              <T it={badge.it} es={badge.es} />
            </span>
          )}
        </span>
        <span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
          <T it={bodyIt} es={bodyEs} />
        </span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 20, color: "var(--color-text-secondary)", opacity: 0.5 }}>›</span>
    </button>
  );
}

export default function MainMenu({ onSelectSection }: MainMenuProps) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          <T it="Benvenuto!" es="¡Bienvenido!" />
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          <T
            it="Scegli la sezione del corso che vuoi aprire."
            es="Elige la sección del curso que quieres abrir."
          />
        </div>
      </div>

      <MenuCard
        emoji="📚"
        titleIt="Verbi"
        titleEs="Verbos"
        accent="#2563eb"
        bodyIt="Esercizi interattivi sui verbi irregolari al presente."
        bodyEs="Ejercicios interactivos de verbos irregulares en presente."
        onClick={() => onSelectSection("verbs-learning")}
      />

      <MenuCard
        emoji="💬"
        titleIt="Conversazione"
        titleEs="Conversación"
        accent="#8b5cf6"
        badge={{ it: "Prossimamente", es: "Próximamente" }}
        bodyIt="Scenari di dialogo guidato con feedback."
        bodyEs="Escenarios de diálogo guiado con feedback."
        onClick={() => onSelectSection("conversation")}
      />

      <MenuCard
        emoji="⚙️"
        titleIt="Impostazioni"
        titleEs="Ajustes"
        accent="#64748b"
        bodyIt="Tema, lingua e preferenze dell'app."
        bodyEs="Tema, idioma y preferencias de la app."
        onClick={() => onSelectSection("settings")}
      />
    </div>
  );
}