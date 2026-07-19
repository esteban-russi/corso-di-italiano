import { useState } from "react";
import { useLang } from "../context/LangContext";
import { useProfile } from "../context/ProfileContext";
import { verbColor } from "../config";
import { UNITS } from "../curriculum/path";
import { VERBS } from "../curriculum/verbs";
import { generateLesson } from "../curriculum/lesson";
import { TENSES, TENSE_LABEL, type Lesson, type Tense, type Unit } from "../curriculum/types";
import { btn } from "../utils";

type Mode = "path" | "pick" | "quick";

function weakSetForTense(weakKeys: string[], tense: Tense): Set<string> {
  return new Set(weakKeys.filter((k) => k.split(":")[1] === tense));
}

export default function VerbHome({ onStart }: { onStart: (lesson: Lesson, title: string, unitId?: string) => void }) {
  const { lang } = useLang();
  const profile = useProfile();
  const [mode, setMode] = useState<Mode>("path");

  const start = (verbIds: string[], tense: Tense, title: string, includeIntro: boolean, unitId?: string) => {
    const weak = weakSetForTense(profile.weakKeys(), tense);
    onStart(generateLesson(verbIds, tense, { weak, includeIntro }), title, unitId);
  };

  const nextUnitIndex = UNITS.findIndex((u) => !profile.isUnitComplete(u.id));

  return (
    <div>
      {/* Greeting + daily goal */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
          {profile.name
            ? (lang === "en" ? `Ciao, ${profile.name}!` : `¡Ciao, ${profile.name}!`)
            : "Ciao! 👋"}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)", marginTop: 3 }}>
          {lang === "en" ? "Master Italian verbs, one short lesson at a time." : "Domina los verbos italianos, una lección corta a la vez."}
        </div>
        <DailyGoal />
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {([["path", lang === "en" ? "Path" : "Ruta"], ["pick", lang === "en" ? "Pick verbs" : "Elegir verbos"], ["quick", lang === "en" ? "Quick practice" : "Práctica rápida"]] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{ ...btn(mode === m), flex: 1, fontSize: 13, fontWeight: 600, padding: "9px 8px" }}>
            {label}
          </button>
        ))}
      </div>

      {mode === "path" && <PathView nextIndex={nextUnitIndex} onStartUnit={(u) => start(u.verbIds, u.tense, lang === "en" ? u.titleEn : u.titleEs, true, u.id)} />}
      {mode === "pick" && <PickView onStart={start} />}
      {mode === "quick" && <QuickView onStart={start} />}
    </div>
  );
}

function DailyGoal() {
  const { lang } = useLang();
  const { dailyGoal, lessonsToday } = useProfile();
  const done = Math.min(lessonsToday.count, dailyGoal);
  const met = lessonsToday.count >= dailyGoal;
  return (
    <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: "var(--color-primary-softer)", border: "1px solid var(--color-primary-soft)", display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 20 }} aria-hidden="true">{met ? "🎯" : "📅"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary-hover)" }}>
          {met
            ? (lang === "en" ? "Daily goal reached — bravo!" : "¡Meta diaria alcanzada — bravo!")
            : (lang === "en" ? `Daily goal: ${done}/${dailyGoal} lessons` : `Meta diaria: ${done}/${dailyGoal} lecciones`)}
        </div>
        <div style={{ height: 5, background: "var(--color-primary-soft)", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(100, (lessonsToday.count / dailyGoal) * 100)}%`, background: "var(--color-primary)", borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

function PathView({ nextIndex, onStartUnit }: { nextIndex: number; onStartUnit: (u: Unit) => void }) {
  const { lang } = useLang();
  const { isUnitComplete } = useProfile();
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {UNITS.map((u, i) => {
        const done = isUnitComplete(u.id);
        const unlocked = i === 0 || isUnitComplete(UNITS[i - 1].id);
        const isNext = i === nextIndex;
        const title = lang === "en" ? u.titleEn : u.titleEs;
        return (
          <button
            key={u.id}
            disabled={!unlocked}
            onClick={() => onStartUnit(u)}
            style={{
              display: "grid", gridTemplateColumns: "40px 1fr auto", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 14, textAlign: "left", cursor: unlocked ? "pointer" : "not-allowed",
              background: isNext ? "var(--color-primary-softer)" : "var(--color-background-primary)",
              border: `1px solid ${isNext ? "var(--color-primary-soft)" : "var(--color-border-tertiary)"}`,
              opacity: unlocked ? 1 : 0.55, fontFamily: "inherit",
            }}
          >
            <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: done ? "var(--color-success-soft)" : "var(--color-primary-softer)" }}>
              {done ? "✅" : unlocked ? "📘" : "🔒"}
            </span>
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--color-text-primary)" }}>{title}</span>
              <span style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
                {TENSE_LABEL[u.tense][lang]} · {u.verbIds.join(", ")}
              </span>
            </span>
            {isNext && !done && (
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: "var(--color-primary)", color: "#fff" }}>
                {lang === "en" ? "START" : "EMPEZAR"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function VerbGrid({ selected, toggle }: { selected: string[]; toggle: (id: string) => void }) {
  const byLevel: Record<number, typeof VERBS> = {};
  for (const v of VERBS) (byLevel[v.level] ??= []).push(v);
  return (
    <>
      {Object.keys(byLevel).map(Number).sort((a, b) => a - b).map((lvl) => (
        <div key={lvl} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", marginBottom: 8 }}>Level {lvl}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
            {byLevel[lvl].map((v) => {
              const on = selected.includes(v.id);
              const c = verbColor(v.id);
              return (
                <button key={v.id} onClick={() => toggle(v.id)} style={{ ...btn(on), padding: "9px 10px", fontSize: 13.5, fontWeight: 600, borderColor: on ? c.color : undefined, background: on ? c.bg : undefined, color: on ? c.color : undefined }}>
                  {v.infinitive}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function TensePicker({ value, onChange }: { value: Tense; onChange: (t: Tense) => void }) {
  const { lang } = useLang();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {TENSES.map((t) => (
        <button key={t} onClick={() => onChange(t)} style={{ ...btn(value === t), fontSize: 12.5, padding: "7px 12px", fontWeight: 600 }}>
          {TENSE_LABEL[t][lang]}
        </button>
      ))}
    </div>
  );
}

function PickView({ onStart }: { onStart: (verbIds: string[], tense: Tense, title: string, includeIntro: boolean) => void }) {
  const { lang } = useLang();
  const [selected, setSelected] = useState<string[]>([]);
  const [tense, setTense] = useState<Tense>("presente");
  const toggle = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const canStart = selected.length > 0;
  return (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>{lang === "en" ? "1. Choose verbs" : "1. Elige verbos"}</div>
      <VerbGrid selected={selected} toggle={toggle} />
      <div style={{ fontSize: 13.5, fontWeight: 600, margin: "6px 0 10px" }}>{lang === "en" ? "2. Choose a tense" : "2. Elige un tiempo"}</div>
      <TensePicker value={tense} onChange={setTense} />
      <button
        disabled={!canStart}
        onClick={() => onStart(selected, tense, lang === "en" ? "Custom practice" : "Práctica personalizada", true)}
        className="btn-primary"
        style={{ ...btn(), width: "100%", padding: "13px 24px", fontWeight: 600, fontSize: 15 }}
      >
        {lang === "en" ? "Start lesson →" : "Comenzar lección →"}
      </button>
    </div>
  );
}

function QuickView({ onStart }: { onStart: (verbIds: string[], tense: Tense, title: string, includeIntro: boolean) => void }) {
  const { lang } = useLang();
  const { completedUnits, weakKeys } = useProfile();
  // Pool: verbs the learner has already seen (from completed units), else level 1-2.
  const seen = new Set<string>();
  for (const uid of completedUnits) {
    const unit = UNITS.find((u) => u.id === uid);
    unit?.verbIds.forEach((v) => seen.add(v));
  }
  const pool = seen.size >= 3 ? [...seen] : VERBS.filter((v) => v.level <= 2).map((v) => v.id);
  const weakCount = weakKeys().length;

  const startQuick = () => {
    const pick = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    onStart(pick, "presente", lang === "en" ? "Quick practice" : "Práctica rápida", false);
  };
  const startReview = () => {
    // Review weakest verbs across their weak tense.
    const keys = weakKeys().slice(0, 6);
    const byTense: Record<string, Set<string>> = {};
    keys.forEach((k) => { const [v, t] = k.split(":"); (byTense[t] ??= new Set()).add(v); });
    const [tense, verbs] = Object.entries(byTense).sort((a, b) => b[1].size - a[1].size)[0] ?? ["presente", new Set(pool.slice(0, 3))];
    onStart([...verbs], tense as Tense, lang === "en" ? "Weak-spot review" : "Repaso de puntos débiles", false);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button onClick={startQuick} className="btn-primary" style={{ ...btn(), padding: "16px 18px", textAlign: "left", fontWeight: 700, fontSize: 15 }}>
        ⚡ {lang === "en" ? "Quick practice" : "Práctica rápida"}
        <div style={{ fontSize: 12.5, fontWeight: 400, opacity: 0.9, marginTop: 3 }}>
          {lang === "en" ? "A fast mix from verbs you know — under 2 minutes." : "Una mezcla rápida de verbos que conoces — menos de 2 minutos."}
        </div>
      </button>
      <button onClick={startReview} disabled={weakCount === 0} className="btn-secondary" style={{ ...btn(), padding: "16px 18px", textAlign: "left", fontWeight: 700, fontSize: 15, opacity: weakCount === 0 ? 0.55 : 1 }}>
        🎯 {lang === "en" ? "Review weak spots" : "Repasar puntos débiles"}
        <div style={{ fontSize: 12.5, fontWeight: 400, color: "var(--color-text-secondary)", marginTop: 3 }}>
          {weakCount === 0
            ? (lang === "en" ? "No weak spots yet — keep practising!" : "Aún no hay puntos débiles — ¡sigue practicando!")
            : (lang === "en" ? `Focus on the ${weakCount} forms you miss most.` : `Enfócate en las ${weakCount} formas que más fallas.`)}
        </div>
      </button>
    </div>
  );
}
