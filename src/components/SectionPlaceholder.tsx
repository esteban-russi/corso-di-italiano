import { T } from "../context/LangContext";
import { btn } from "../utils";

type SectionPlaceholderProps = {
  emoji: string;
  titleIt: string;
  titleEs: string;
  bodyIt: string;
  bodyEs: string;
  onBack: () => void;
};

export default function SectionPlaceholder({
  emoji,
  titleIt,
  titleEs,
  bodyIt,
  bodyEs,
  onBack,
}: SectionPlaceholderProps) {
  return (
    <div style={{ display: "grid", gap: 18, textAlign: "center" }}>
      <div
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          margin: "0 auto",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, var(--color-primary-softer), var(--color-background-secondary))",
          border: "1px solid var(--color-primary-soft)",
          fontSize: 34,
        }}
      >
        {emoji}
      </div>

      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          <T it={titleIt} es={titleEs} />
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
          <T it={bodyIt} es={bodyEs} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={onBack} className="btn-secondary" style={{ ...btn(), padding: "10px 18px", fontWeight: 600 }}>
          <T it="Torna al menu" es="Volver al menú" />
        </button>
      </div>
    </div>
  );
}