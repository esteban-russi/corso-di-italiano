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
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
        <T it="Lezione completata!" es="¡Lección completada!" />
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          marginBottom: 24,
          marginTop: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: errors === 0 ? "#0F6E56" : "#A32D2D" }}>
            {errors}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            <T it="errori" es="errores" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--color-text-primary)" }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            <T it="tempo" es="tiempo" />
          </div>
        </div>
      </div>

      {errors === 0 && (
        <p style={{ fontSize: 15, color: "#0F6E56", marginBottom: 20 }}>
          <T it="Perfetto! Nessun errore!" es="¡Perfecto! ¡Ningún error!" />
        </p>
      )}

      <button
        onClick={onRestart}
        style={{
          ...btn(),
          padding: "12px 32px",
          fontSize: 15,
          fontWeight: 600,
          background: "#009246",
          color: "#fff",
          border: "none",
        }}
      >
        <T it="Nuova lezione" es="Nueva lección" />
      </button>
    </div>
  );
}
