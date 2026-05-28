import { T } from "../context/LangContext";
import { btn } from "../utils";

type MainMenuProps = {
  onSelectVerbs: () => void;
};

export default function MainMenu({ onSelectVerbs }: MainMenuProps) {
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

      <button
        onClick={onSelectVerbs}
        className="btn-primary"
        style={{
          ...btn(),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "18px 20px",
          textAlign: "left",
        }}
      >
        <span>
          <span style={{ display: "block", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>
            <T it="Verbi" es="Verbos" />
          </span>
          <span style={{ display: "block", fontSize: 13, opacity: 0.9, fontWeight: 500 }}>
            <T it="Apri l'app di apprendimento attuale" es="Abre la app de aprendizaje actual" />
          </span>
        </span>
        <span aria-hidden="true" style={{ fontSize: 24 }}>→</span>
      </button>

      <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
          <T it="Conversazione" es="Conversación" />
        </div>
        <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          <T it="Sezione prevista ma non ancora disponibile." es="Sección prevista pero aún no disponible." />
        </div>
      </div>

      <div style={{ padding: "16px 18px", borderRadius: 14, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
          <T it="Impostazioni" es="Ajustes" />
        </div>
        <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          <T it="Sezione prevista ma non ancora disponibile." es="Sección prevista pero aún no disponible." />
        </div>
      </div>
    </div>
  );
}