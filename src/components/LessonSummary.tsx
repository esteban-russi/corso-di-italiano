import { T } from "../context/LangContext";
import { btn } from "../utils";

export default function LessonSummary({
  errors,
  startTime,
  onRestart,
}: {
  errors: number;
  startTime: number;
  onRestart: () => void;
}) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;
  const timeStr = `${mm}:${ss.toString().padStart(2, "0")}`;

  const emoji = errors === 0 ? "🎉" : errors <= 3 ? "👏" : "💪";

  return (
    <div className="fade-in" style={{ textAlign: "center", padding: "32px 20px 16px" }}>
      <div
        aria-hidden="true"
        style={{
          width: 92,
          height: 92,
          borderRadius: "50%",
          margin: "0 auto 18px",
          background: "linear-gradient(135deg, var(--color-primary-soft), var(--color-primary-softer))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
          boxShadow: "var(--shadow-md)",
        }}
      >
        {emoji}
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>
        <T it="Lezione completata!" es="¡Lección completada!" />
      </h2>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24 }}>
        <T it="Bel lavoro — continua così." es="¡Buen trabajo — sigue así!" />
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            flex: "0 1 150px",
            padding: "16px 14px",
            borderRadius: 12,
            background: errors === 0 ? "var(--color-success-soft)" : "var(--color-primary-softer)",
            border: `1px solid ${errors === 0 ? "var(--color-success)" : "var(--color-primary-soft)"}`,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: errors === 0 ? "var(--color-success)" : "var(--color-primary-hover)",
              lineHeight: 1,
            }}
          >
            {errors}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 6, fontWeight: 500 }}>
            <T it="errori" es="errores" />
          </div>
        </div>
        <div
          style={{
            flex: "0 1 150px",
            padding: "16px 14px",
            borderRadius: 12,
            background: "var(--color-primary-softer)",
            border: "1px solid var(--color-primary-soft)",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, color: "var(--color-primary-hover)", lineHeight: 1 }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 6, fontWeight: 500 }}>
            <T it="tempo" es="tiempo" />
          </div>
        </div>
      </div>

      {errors === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-success)", marginBottom: 22, fontWeight: 500 }}>
          <T it="Perfetto! Nessun errore! ✨" es="¡Perfecto! ¡Ningún error! ✨" />
        </p>
      )}

      <button
        onClick={onRestart}
        className="btn-primary"
        style={{
          ...btn(),
          padding: "13px 36px",
          fontSize: 15.5,
          fontWeight: 600,
          letterSpacing: "0.01em",
        }}
      >
        <T it="Nuova lezione →" es="Nueva lección →" />
      </button>
    </div>
  );
}
