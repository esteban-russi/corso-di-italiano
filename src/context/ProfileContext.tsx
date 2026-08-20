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

export type Profile = {
  name: string;
  completedUnits: string[];
  /** formKey ("verbId:tense:pronoun") -> miss count. Drives adaptive lessons. */
  weakForms: Record<string, number>;
  dailyGoal: number;
  lessonsToday: { date: string; count: number };
  topics: string[];
};

const EMPTY: Profile = {
  name: "",
  completedUnits: [],
  weakForms: {},
  dailyGoal: 1,
  lessonsToday: { date: todayISO(), count: 0 },
  topics: [],
};

/** Read the stored profile, tolerating absent, corrupt or older-shaped JSON. */
export function load(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const p = { ...EMPTY, ...JSON.parse(raw) } as Profile;
    if (p.lessonsToday.date !== todayISO()) p.lessonsToday = { date: todayISO(), count: 0 };
    return p;
  } catch {
    return EMPTY;
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
