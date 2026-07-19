import { useLang } from "../context/LangContext";
import { useStreak } from "../context/StreakContext";
import { useProfile } from "../context/ProfileContext";
import { btn } from "../utils";

const MILESTONES: Record<number, { en: string; es: string }> = {
  7: { en: "🍕 A week of pizza!", es: "🍕 ¡Una semana de pizza!" },
  30: { en: "🍕🍕 A month of pizza!", es: "🍕🍕 ¡Un mes de pizza!" },
  100: { en: "🍕🍕🍕 A hundred pizzas!", es: "🍕🍕🍕 ¡Cien pizzas!" },
  365: { en: "🍕🍕🍕🍕 A year of pizza!", es: "🍕🍕🍕🍕 ¡Un año de pizza!" },
};

const Stat = ({ value, label, good }: { value: React.ReactNode; label: string; good?: boolean }) => (
  <div style={{ flex: "0 1 150px", padding: "16px 14px", borderRadius: 12, background: good ? "var(--color-success-soft)" : "var(--color-primary-softer)", border: `1px solid ${good ? "var(--color-success)" : "var(--color-primary-soft)"}` }}>
    <div style={{ fontSize: 30, fontWeight: 700, color: good ? "var(--color-success)" : "var(--color-primary-hover)", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", marginTop: 6, fontWeight: 500 }}>{label}</div>
  </div>
);

export default function LessonSummary({
  errors, startTime, onReturnHome,
}: {
  errors: number; startTime: number; onReturnHome: () => void;
}) {
  const { lang } = useLang();
  const { currentStreak, newDayRecorded } = useStreak();
  const { name, dailyGoal, lessonsToday } = useProfile();

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const timeStr = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, "0")}`;
  const emoji = errors === 0 ? "🎉" : errors <= 3 ? "👏" : "💪";
  const milestone = MILESTONES[currentStreak];
  const goalMet = lessonsToday.count >= dailyGoal;

  return (
    <div className="fade-in" style={{ textAlign: "center", padding: "32px 20px 16px" }}>
      <div aria-hidden="true" style={{ width: 92, height: 92, borderRadius: "50%", margin: "0 auto 18px", background: "linear-gradient(135deg, var(--color-primary-soft), var(--color-primary-softer))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, boxShadow: "var(--shadow-md)" }}>{emoji}</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>
        {lang === "en" ? "Lesson complete!" : "¡Lección completada!"}
      </h2>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 24 }}>
        {name
          ? (lang === "en" ? `Bravo, ${name} — keep it up!` : `¡Bravo, ${name} — sigue así!`)
          : (lang === "en" ? "Bravo — keep it up!" : "¡Bravo — sigue así!")}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <Stat value={errors} label={lang === "en" ? "errors" : "errores"} good={errors === 0} />
        <Stat value={timeStr} label={lang === "en" ? "time" : "tiempo"} />
        <Stat value={`🍕 ${currentStreak}`} label={lang === "en" ? "streak" : "racha"} />
      </div>

      {newDayRecorded && (
        <p style={{ fontSize: 13.5, color: "var(--color-success)", marginBottom: 16, fontWeight: 600 }}>
          {lang === "en" ? "New day recorded! 🍕" : "¡Nuevo día registrado! 🍕"}
        </p>
      )}
      {goalMet && (
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-primary-hover)", marginBottom: 18, padding: "12px 16px", background: "var(--color-primary-softer)", border: "1px solid var(--color-primary-soft)", borderRadius: 12 }}>
          🎯 {lang === "en" ? "Daily goal reached!" : "¡Meta diaria alcanzada!"}
        </p>
      )}
      {milestone && (
        <p className="fade-in" style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary-hover)", marginBottom: 22, padding: "12px 16px", background: "var(--color-primary-softer)", border: "1px solid var(--color-primary-soft)", borderRadius: 12 }}>
          {lang === "en" ? milestone.en : milestone.es}
        </p>
      )}
      {errors === 0 && (
        <p style={{ fontSize: 14, color: "var(--color-success)", marginBottom: 22, fontWeight: 500 }}>
          {lang === "en" ? "Perfetto! No mistakes! ✨" : "¡Perfetto! ¡Ningún error! ✨"}
        </p>
      )}

      <button onClick={onReturnHome} className="btn-primary" style={{ ...btn(), padding: "13px 36px", fontSize: 15.5, fontWeight: 600 }}>
        {lang === "en" ? "Back to menu →" : "Volver al menú →"}
      </button>
    </div>
  );
}
