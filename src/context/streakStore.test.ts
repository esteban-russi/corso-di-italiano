import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorageStub } from "../test/localStorageStub";
import { loadInitial } from "./StreakContext";

// The streak is calendar-day based in local time. Load-time behaviour decides
// whether a returning learner keeps their streak, so it is pinned against a
// frozen clock rather than the real one.

const KEY = "italiano-streak";
const TODAY = "2026-08-20";
let storage: ReturnType<typeof useLocalStorageStub>;

beforeEach(() => {
  storage = useLocalStorageStub();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T12:00:00`));
});

afterEach(() => vi.useRealTimers());

describe("defaults", () => {
  it("starts at zero with nothing stored", () => {
    expect(loadInitial()).toEqual({ currentStreak: 0, lastActivityDate: null, longestStreak: 0 });
  });
});

describe("corrupt input", () => {
  it("falls back to zeros on unparseable JSON", () => {
    storage.set(KEY, "}{");
    expect(loadInitial()).toEqual({ currentStreak: 0, lastActivityDate: null, longestStreak: 0 });
  });

  it("coerces non-numeric streak values to zero", () => {
    storage.raw(KEY, { currentStreak: "many", longestStreak: null, lastActivityDate: TODAY });
    const s = loadInitial();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
  });

  it("rejects a non-string activity date", () => {
    storage.raw(KEY, { currentStreak: 3, longestStreak: 3, lastActivityDate: 1755000000000 });
    expect(loadInitial().lastActivityDate).toBeNull();
  });
});

describe("lapse handling", () => {
  it("keeps a streak recorded today", () => {
    storage.raw(KEY, { currentStreak: 4, longestStreak: 9, lastActivityDate: TODAY });
    expect(loadInitial()).toEqual({ currentStreak: 4, longestStreak: 9, lastActivityDate: TODAY });
  });

  it("keeps a streak recorded yesterday, which is still extendable", () => {
    storage.raw(KEY, { currentStreak: 4, longestStreak: 9, lastActivityDate: "2026-08-19" });
    expect(loadInitial().currentStreak).toBe(4);
  });

  it("resets the current streak after a two-day gap but keeps the longest", () => {
    storage.raw(KEY, { currentStreak: 4, longestStreak: 9, lastActivityDate: "2026-08-18" });
    const s = loadInitial();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(9);
    expect(s.lastActivityDate).toBe("2026-08-18");
  });

  it("resets after a long absence", () => {
    storage.raw(KEY, { currentStreak: 30, longestStreak: 30, lastActivityDate: "2025-01-01" });
    expect(loadInitial().currentStreak).toBe(0);
    expect(loadInitial().longestStreak).toBe(30);
  });

  it("does not reset across a month boundary that is only one day apart", () => {
    vi.setSystemTime(new Date("2026-09-01T09:00:00"));
    storage.raw(KEY, { currentStreak: 6, longestStreak: 6, lastActivityDate: "2026-08-31" });
    expect(loadInitial().currentStreak).toBe(6);
  });

  it("does not reset across a DST change that is only one day apart", () => {
    // Europe/Rome springs forward on 2026-03-29; a 23-hour day must still be one day.
    vi.setSystemTime(new Date("2026-03-29T12:00:00"));
    storage.raw(KEY, { currentStreak: 2, longestStreak: 2, lastActivityDate: "2026-03-28" });
    expect(loadInitial().currentStreak).toBe(2);
  });
});
