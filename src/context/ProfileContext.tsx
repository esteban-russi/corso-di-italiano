import {
  createContext, useContext, useState, useCallback, type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Personalization store (localStorage): name, path progress, adaptive weak-form
// tracking, daily goal, and preferred conversation topics.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "corso-profile";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Bumped whenever the stored shape changes in a way that needs converting.
 * Versioning exists from day one deliberately: `formKey` identity threads
 * through four files, and CLAUDE.md warns that changing its shape silently
 * invalidates every learner's stored `weakForms`. When that change comes
 * (docs/12-persistence.md D-12-2 normalizes it into columns), there is a place
 * to convert rather than a silent reset.
 */
export const PROFILE_SCHEMA_VERSION = 1;

export type Profile = {
  schemaVersion: number;
  name: string;
  completedUnits: string[];
  /** formKey ("verbId:tense:pronoun") -> miss count. Drives adaptive lessons. */
  weakForms: Record<string, number>;
  dailyGoal: number;
  lessonsToday: { date: string; count: number };
  topics: string[];
};

const EMPTY: Profile = {
  schemaVersion: PROFILE_SCHEMA_VERSION,
  name: "",
  completedUnits: [],
  weakForms: {},
  dailyGoal: 1,
  lessonsToday: { date: todayISO(), count: 0 },
  topics: [],
};

type Raw = Record<string, unknown>;

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((v): v is string => typeof v === "string");
}

function scoreMap(value: unknown): Record<string, number> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const out: Record<string, number> = {};
  for (const [key, score] of Object.entries(value as Raw)) {
    if (typeof score === "number" && Number.isFinite(score) && score > 0) out[key] = score;
  }
  return out;
}

/**
 * Coerce each field independently, so one corrupt value costs that field
 * instead of the learner's whole history. A profile is the only record of
 * their progress until docs/12-persistence.md lands, so losing it to a single
 * bad key would be the worst possible failure here.
 */
function sanitize(raw: Raw): Profile {
  const lessons = raw.lessonsToday as Raw | undefined;
  const date = lessons && typeof lessons.date === "string" ? lessons.date : EMPTY.lessonsToday.date;
  const count =
    lessons && typeof lessons.count === "number" && Number.isFinite(lessons.count)
      ? Math.max(0, Math.floor(lessons.count))
      : 0;
  const goal = typeof raw.dailyGoal === "number" && raw.dailyGoal > 0 ? Math.floor(raw.dailyGoal) : EMPTY.dailyGoal;
  return {
    schemaVersion:
      typeof raw.schemaVersion === "number" && raw.schemaVersion > 0
        ? raw.schemaVersion
        : PROFILE_SCHEMA_VERSION,
    name: typeof raw.name === "string" ? raw.name : EMPTY.name,
    completedUnits: stringArray(raw.completedUnits) ?? [],
    weakForms: scoreMap(raw.weakForms) ?? {},
    dailyGoal: goal,
    lessonsToday: { date, count },
    topics: stringArray(raw.topics) ?? [],
  };
}

/**
 * Convert an older stored profile forward. Each entry takes the raw object
 * from version N to N+1.
 *
 * A profile with no version was written before versioning existed; its shape
 * is already compatible, so that step only stamps the version.
 */
const MIGRATIONS: Record<number, (raw: Raw) => Raw> = {
  0: (raw) => ({ ...raw }),
};

function migrate(raw: Raw): Profile {
  let current = typeof raw.schemaVersion === "number" && raw.schemaVersion > 0 ? raw.schemaVersion : 0;
  let working = raw;
  // A profile from a *newer* build is left alone rather than downgraded: the
  // same learner may have two devices on different versions, and discarding
  // fields we do not recognise would lose real progress.
  while (current < PROFILE_SCHEMA_VERSION && MIGRATIONS[current]) {
    working = MIGRATIONS[current](working);
    current += 1;
  }
  const profile = sanitize(working);
  return { ...profile, schemaVersion: Math.max(current, profile.schemaVersion) };
}

/** Read the stored profile, tolerating absent, corrupt or older-shaped JSON. */
export function load(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, lessonsToday: { date: todayISO(), count: 0 } };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...EMPTY, lessonsToday: { date: todayISO(), count: 0 } };
    }
    const p = migrate(parsed as Raw);
    if (p.lessonsToday.date !== todayISO()) p.lessonsToday = { date: todayISO(), count: 0 };
    return p;
  } catch {
    return { ...EMPTY, lessonsToday: { date: todayISO(), count: 0 } };
  }
}

type ProfileValue = Profile & {
  setName: (n: string) => void;
  setDailyGoal: (n: number) => void;
  setTopics: (t: string[]) => void;
  completeUnit: (id: string) => void;
  /** Record a finished lesson: bump daily count and update weak-form scores. */
  recordLesson: (misses: string[], hits: string[]) => void;
  /** Weak-form keys, strongest-weakness first. */
  weakKeys: () => string[];
  isUnitComplete: (id: string) => boolean;
};

const Ctx = createContext<ProfileValue>({
  ...EMPTY,
  setName: () => {}, setDailyGoal: () => {}, setTopics: () => {},
  completeUnit: () => {}, recordLesson: () => {}, weakKeys: () => [], isUnitComplete: () => false,
});

export function useProfile() {
  return useContext(Ctx);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Profile>(load);

  const persist = useCallback((next: Profile) => {
    setP(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const setName = useCallback((name: string) => persist({ ...load(), name }), [persist]);
  const setDailyGoal = useCallback((dailyGoal: number) => persist({ ...load(), dailyGoal }), [persist]);
  const setTopics = useCallback((topics: string[]) => persist({ ...load(), topics }), [persist]);

  const completeUnit = useCallback((id: string) => {
    const cur = load();
    if (cur.completedUnits.includes(id)) return;
    persist({ ...cur, completedUnits: [...cur.completedUnits, id] });
  }, [persist]);

  const recordLesson = useCallback((misses: string[], hits: string[]) => {
    const cur = load();
    const weakForms = { ...cur.weakForms };
    for (const k of misses) weakForms[k] = (weakForms[k] ?? 0) + 2;
    for (const k of hits) if (weakForms[k]) weakForms[k] = Math.max(0, weakForms[k] - 1);
    for (const k of Object.keys(weakForms)) if (weakForms[k] === 0) delete weakForms[k];
    const date = todayISO();
    const lessonsToday = cur.lessonsToday.date === date
      ? { date, count: cur.lessonsToday.count + 1 }
      : { date, count: 1 };
    persist({ ...cur, weakForms, lessonsToday });
  }, [persist]);

  const weakKeys = useCallback(
    () => Object.entries(p.weakForms).sort((a, b) => b[1] - a[1]).map(([k]) => k),
    [p.weakForms]
  );

  const isUnitComplete = useCallback((id: string) => p.completedUnits.includes(id), [p.completedUnits]);

  return (
    <Ctx.Provider value={{ ...p, setName, setDailyGoal, setTopics, completeUnit, recordLesson, weakKeys, isUnitComplete }}>
      {children}
    </Ctx.Provider>
  );
}
