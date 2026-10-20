import { useMemo, useState } from "react";
import { useLang } from "../context/LangContext";
import { useProfile } from "../context/ProfileContext";
import { useCopy } from "../copy";
import { verbColor } from "../config";
import { UNITS } from "../curriculum/path";
import { VERBS } from "../curriculum/verbs";
import { generateLesson } from "../curriculum/lesson";
import {
  eligibleTenses,
  nextUnit,
  nextUnitIndex,
  pathProgress,
  pickRandomTarget,
  reachedLevel,
  seenVerbs,
  weakSetForTense,
} from "../curriculum/entry";
import { TENSE_LABEL, type Lesson, type Tense, type Unit } from "../curriculum/types";
import { btn, onPrimary, sub } from "../utils";
import EntryPoints, { type EntryDoor } from "./EntryPoints";

/** Verb count above which Choose offers a search field. */
const SEARCH_THRESHOLD = 20;

type View = "doors" | "choose" | "path";

export default function VerbHome({ onStart }: { onStart: (lesson: Lesson, title: string, unitId?: string) => void }) {
  const { lang } = useLang();
  const c = useCopy();
  const profile = useProfile();
  const [view, setView] = useState<View>("doors");

  const start = (verbIds: string[], tense: Tense, title: string, includeIntro: boolean, unitId?: string) => {
    const weak = weakSetForTense(profile.weakKeys(), tense);
    onStart(generateLesson(verbIds, tense, { weak, includeIntro }), title, unitId);
  };

  const isComplete = (id: string) => profile.isUnitComplete(id);
  const progress = pathProgress(isComplete);
  const upNext = nextUnit(isComplete);
  const level = reachedLevel(profile.completedUnits);

  /**
   * Random is the adaptive door: weak forms are folded in here rather than
   * living behind a fourth button (docs/05-three-ways-in.md D-05-1).
   */
  const startRandom = () => {
    const target = pickRandomTarget({
      pool: seenVerbs(profile.completedUnits),
      weakKeys: profile.weakKeys(),
      level,
    });
    if (!target) return;
    start(target.verbIds, target.tense, c("entry.random.title"), false);
  };

  const startContinue = () => {
    if (upNext) {
      start(upNext.verbIds, upNext.tense, lang === "en" ? upNext.titleEn : upNext.titleEs, true, upNext.id);
      return;
    }
    // Path finished (D-05-3b): Continue becomes review over everything seen.
    const target = pickRandomTarget({
      pool: seenVerbs(profile.completedUnits),
      weakKeys: profile.weakKeys(),
      level,
    });
    if (target) start(target.verbIds, target.tense, c("entry.reviewTitle"), false);
  };

  const doors: EntryDoor[] = [
    {
      kind: "continue",
      emoji: progress.finished ? "🔁" : "▶️",
      title: progress.finished ? c("entry.reviewTitle") : c("entry.continue.title"),
      body: progress.finished ? c("entry.reviewBody") : c("entry.continue.body"),
      meta: progress.finished
        ? undefined
        : c("entry.unitProgress", { current: nextUnitIndex(isComplete) + 1, total: progress.total }),
      onSelect: startContinue,
    },
    {
      kind: "random",
      emoji: "🎲",
      title: c("entry.random.title"),
      body: c("entry.random.body"),
      meta: c("entry.level", { level }),
      onSelect: startRandom,
    },
    {
      kind: "choose",
      emoji: "🎯",
      title: c("entry.choose.title"),
      body: c("entry.choose.body"),
      onSelect: () => setView("choose"),
    },
  ];

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

      {view === "doors" && (
        <>
          <EntryPoints
            doors={doors}
            secondary={{ label: c("entry.viewPath"), onSelect: () => setView("path") }}
          />
          {progress.finished && (
            <p style={{ ...sub, marginTop: 14, textAlign: "center", lineHeight: 1.6 }}>
              {c("empty.pathComplete")}
            </p>
          )}
        </>
      )}

      {view !== "doors" && (
        <button
          onClick={() => setView("doors")}
          className="btn-ghost"
          style={{ ...btn(), marginBottom: 14, padding: "6px 12px", fontSize: 12.5, fontWeight: 600 }}
        >
          ← {c("entry.back")}
        </button>
      )}

      {view === "path" && (
        <PathView
          nextIndex={nextUnitIndex(isComplete)}
          onStartUnit={(u) => start(u.verbIds, u.tense, lang === "en" ? u.titleEn : u.titleEs, true, u.id)}
        />
      )}

      {view === "choose" && <ChooseView level={level} onStart={start} />}
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
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, ...onPrimary }}>
                {lang === "en" ? "START" : "EMPEZAR"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Choose. Multi-select is deliberately preserved from the old "Pick verbs"
 * mode — selecting exactly one verb is the common case and satisfies "pick a
 * specific item", but taking multi-select away would have been a regression.
 * Search appears once the list is long enough to need it.
 */
function ChooseView({
  level,
  onStart,
}: {
  level: number;
  onStart: (verbIds: string[], tense: Tense, title: string, includeIntro: boolean) => void;
}) {
  const { lang } = useLang();
  const c = useCopy();
  const [selected, setSelected] = useState<string[]>([]);
  const [tense, setTense] = useState<Tense>("presente");
  const [query, setQuery] = useState("");

  // Only offer tenses the learner has reached, so Choose cannot hand a
  // beginner a tense they have never seen taught.
  const tenses = useMemo(() => eligibleTenses(level), [level]);
  const activeTense = tenses.includes(tense) ? tense : tenses[0];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VERBS;
    return VERBS.filter(
      (v) =>
        v.infinitive.toLowerCase().includes(q) ||
        v.en.toLowerCase().includes(q) ||
        v.es.toLowerCase().includes(q)
    );
  }, [query]);

  const byLevel = useMemo(() => {
    const groups: Record<number, typeof VERBS> = {};
    for (const v of matches) (groups[v.level] ??= []).push(v);
    return groups;
  }, [matches]);

  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const startLabel =
    selected.length === 0
      ? c("choose.pickSomething")
      : selected.length === 1
        ? c("choose.startOne", { verb: VERBS.find((v) => v.id === selected[0])?.infinitive ?? "" })
        : c("choose.startMany", { count: selected.length });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{c("choose.chooseVerbs")}</div>
        {selected.length > 0 && (
          <button onClick={() => setSelected([])} className="btn-ghost" style={{ ...btn(), padding: "3px 10px", fontSize: 12 }}>
            {c("choose.clear")}
          </button>
        )}
      </div>

      {VERBS.length > SEARCH_THRESHOLD && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={c("choose.searchPlaceholder")}
          aria-label={c("choose.searchPlaceholder")}
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14, borderRadius: 10, marginBottom: 14,
            border: "1px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            fontFamily: "inherit",
          }}
        />
      )}

      {matches.length === 0 ? (
        <p style={{ ...sub, padding: "18px 4px" }}>{c("choose.noResults")}</p>
      ) : (
        Object.keys(byLevel).map(Number).sort((a, b) => a - b).map((lvl) => (
          <div key={lvl} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", marginBottom: 8 }}>
              {c("entry.level", { level: lvl })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
              {byLevel[lvl].map((v) => {
                const on = selected.includes(v.id);
                const tone = verbColor(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => toggle(v.id)}
                    aria-pressed={on}
                    style={{ ...btn(on), padding: "9px 10px", fontSize: 13.5, fontWeight: 600, borderColor: on ? tone.color : undefined, background: on ? tone.bg : undefined, color: on ? tone.color : undefined }}
                  >
                    {v.infinitive}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div style={{ fontSize: 13.5, fontWeight: 600, margin: "6px 0 10px" }}>{c("choose.chooseTense")}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {tenses.map((t) => (
          <button key={t} onClick={() => setTense(t)} style={{ ...btn(activeTense === t), fontSize: 12.5, padding: "7px 12px", fontWeight: 600 }}>
            {TENSE_LABEL[t][lang]}
          </button>
        ))}
      </div>

      <button
        disabled={selected.length === 0}
        onClick={() => onStart(selected, activeTense, c("entry.choose.title"), true)}
        className="btn-primary"
        style={{ ...btn(), width: "100%", padding: "13px 24px", fontWeight: 600, fontSize: 15, opacity: selected.length === 0 ? 0.55 : 1 }}
      >
        {startLabel}
      </button>
    </div>
  );
}
