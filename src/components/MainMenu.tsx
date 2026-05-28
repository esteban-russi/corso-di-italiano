import { T } from "../context/LangContext";
import { btn } from "../utils";

type MainMenuProps = {
  onSelectSection: (section: "verbs-learning" | "conversation" | "settings") => void;
};

function MenuCard({
  emoji,
  titleIt,
  titleEs,
  bodyIt,
  bodyEs,
  onClick,
}: {
  emoji: string;
  titleIt: string;
  titleEs: string;
  bodyIt: string;
  bodyEs: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-secondary"
      style={{
        ...btn(),
        display: "grid",
        gridTemplateColumns: "48px 1fr auto",
        alignItems: "center",
        gap: 16,
        width: "100%",
        padding: "18px 20px",
        textAlign: "left",
        border: "1px solid var(--color-border-tertiary)",
        borderRadius: 14,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          background: "linear-gradient(135deg, var(--color-primary-softer), var(--color-background-secondary))",
        }}
      >
        {emoji}
      </span>
      <span>
        <span style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 4, color: "var(--color-text-primary)" }}>
          <T it={titleIt} es={titleEs} />
        </span>
        <span style={{ display: "block", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
          <T it={bodyIt} es={bodyEs} />
        </span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 24, color: "var(--color-text-secondary)" }}>→</span>
    </button>
  );
}

export default function MainMenu({ onSelectSection }: MainMenuProps) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          <T it="Menu principale" es="Menú principal" />
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
        bodyIt="Apri l'app di apprendimento attuale."
        bodyEs="Abre la app de aprendizaje actual."
        onClick={() => onSelectSection("verbs-learning")}
      />

      <MenuCard
        emoji="💬"
        titleIt="Conversazione"
        titleEs="Conversación"
        bodyIt="Anteprima della sezione conversazione, non ancora pubblicata."
        bodyEs="Vista previa de la sección de conversación, aún no publicada."
        onClick={() => onSelectSection("conversation")}
      />

      <MenuCard
        emoji="⚙️"
        titleIt="Impostazioni"
        titleEs="Ajustes"
        bodyIt="Anteprima dell'area impostazioni, non ancora pubblicata."
        bodyEs="Vista previa del área de ajustes, aún no publicada."
        onClick={() => onSelectSection("settings")}
      />
    </div>
  );
}