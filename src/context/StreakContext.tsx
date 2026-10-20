import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

export type StreakData = {
  currentStreak: number;
  lastActivityDate: string | null; // ISO date YYYY-MM-DD (local)
  longestStreak: number;
};

const STORAGE_KEY = "italiano-streak";

const EMPTY: StreakData = {
  currentStreak: 0,
  lastActivityDate: null,
  longestStreak: 0,
};

const StreakCtx = createContext<{
  currentStreak: number;
  longestStreak: number;
  /** True when the most recent recordActivity() started or extended the streak. */
  newDayRecorded: boolean;
  recordActivity: () => void;
}>({
  currentStreak: 0,
  longestStreak: 0,
  newDayRecorded: false,
  recordActivity: () => {},
});

export function useStreak() {
  return useContext(StreakCtx);
}

/* ------------------------------------------------------------------ */
/*  DATE HELPERS (local time — a "day" is the user's calendar day)    */
/* ------------------------------------------------------------------ */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr(): string {
  return toISODate(new Date());
}

/** Whole calendar days from `from` to `to` (both YYYY-MM-DD). */
function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Read the stored streak, resetting a lapsed one. Exported for tests. */
export function loadInitial(): StreakData {
  let data = EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StreakData>;
      data = {
        currentStreak: Number(parsed.currentStreak) || 0,
        lastActivityDate:
          typeof parsed.lastActivityDate === "string" ? parsed.lastActivityDate : null,
        longestStreak: Number(parsed.longestStreak) || 0,
      };
    }
  } catch {
    data = EMPTY;
  }

  // On mount: if the streak lapsed (last activity older than yesterday),
  // reset the current streak but keep the longest record.
  if (data.lastActivityDate) {
    const diff = daysBetween(data.lastActivityDate, todayStr());
    if (diff > 1) {
      data = { ...data, currentStreak: 0 };
    }
  }

  return data;
}

export function StreakProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StreakData>(loadInitial);
  const [newDayRecorded, setNewDayRecorded] = useState(false);

  // Keep a synchronous mirror so recordActivity reads the freshest value.
  const dataRef = useRef(data);
  dataRef.current = data;

  // Persist on every change (also writes the mount-time lapse reset).
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const recordActivity = useCallback(() => {
    const today = todayStr();
    const prev = dataRef.current;

    // Same day: already counted, nothing to do.
    if (prev.lastActivityDate === today) {
      setNewDayRecorded(false);
      return;
    }

    const diff = prev.lastActivityDate
      ? daysBetween(prev.lastActivityDate, today)
      : Infinity;

    // Yesterday → extend; anything older (or first ever) → start fresh.
    const currentStreak = diff === 1 ? prev.currentStreak + 1 : 1;

    setNewDayRecorded(true);
    setData({
      currentStreak,
      lastActivityDate: today,
      longestStreak: Math.max(prev.longestStreak, currentStreak),
    });
  }, []);

  return (
    <StreakCtx.Provider
      value={{
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        newDayRecorded,
        recordActivity,
      }}
    >
      {children}
    </StreakCtx.Provider>
  );
}
