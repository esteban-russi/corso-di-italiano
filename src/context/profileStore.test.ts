import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorageStub } from "../test/localStorageStub";
import { load } from "./ProfileContext";

// CLAUDE.md requires every loader to tolerate absent/corrupt JSON and merge onto
// a defaults object, because profiles written by older builds are still in the
// wild. These tests pin that contract.

const KEY = "corso-profile";
let storage: ReturnType<typeof useLocalStorageStub>;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

beforeEach(() => {
  storage = useLocalStorageStub();
  vi.useRealTimers();
});

describe("defaults", () => {
  it("returns a usable profile when nothing is stored", () => {
    const p = load();
    expect(p.name).toBe("");
    expect(p.completedUnits).toEqual([]);
    expect(p.weakForms).toEqual({});
    expect(p.dailyGoal).toBe(1);
    expect(p.topics).toEqual([]);
    expect(p.lessonsToday).toEqual({ date: todayISO(), count: 0 });
  });
});

describe("corrupt input", () => {
  it("falls back to defaults on unparseable JSON", () => {
    storage.set(KEY, "{not json");
    expect(load().dailyGoal).toBe(1);
  });

  it("falls back to defaults when the stored value is not an object", () => {
    storage.raw(KEY, "a string");
    expect(load().completedUnits).toEqual([]);
    storage.raw(KEY, 42);
    expect(load().completedUnits).toEqual([]);
  });

  it("falls back to defaults when a required nested object is null", () => {
    // An older build could have written lessonsToday: null; reading .date off it
    // throws, and the loader must absorb that rather than crash the app.
    storage.raw(KEY, { name: "Esteban", lessonsToday: null });
    expect(load().name).toBe("");
    expect(load().lessonsToday).toEqual({ date: todayISO(), count: 0 });
  });

  it("returns defaults when localStorage itself throws", () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => { throw new Error("denied"); },
    };
    expect(load().dailyGoal).toBe(1);
  });
});

describe("merging onto defaults", () => {
  it("keeps stored fields and fills the missing ones", () => {
    storage.raw(KEY, { name: "Esteban", dailyGoal: 3 });
    const p = load();
    expect(p.name).toBe("Esteban");
    expect(p.dailyGoal).toBe(3);
    expect(p.completedUnits).toEqual([]);
    expect(p.weakForms).toEqual({});
  });

  it("preserves a profile written by an older build with extra keys", () => {
    storage.raw(KEY, { name: "Esteban", legacyStreak: 9, weakForms: { "parlare:presente:0": 4 } });
    const p = load();
    expect(p.name).toBe("Esteban");
    expect(p.weakForms).toEqual({ "parlare:presente:0": 4 });
  });

  it("preserves completed units and weak-form scores verbatim", () => {
    storage.raw(KEY, {
      completedUnits: ["u1", "u2"],
      weakForms: { "capire:presente:2": 6, "essere:imperfetto:5": 2 },
    });
    const p = load();
    expect(p.completedUnits).toEqual(["u1", "u2"]);
    expect(p.weakForms["capire:presente:2"]).toBe(6);
  });
});

describe("daily goal rollover", () => {
  it("keeps today's lesson count", () => {
    storage.raw(KEY, { lessonsToday: { date: todayISO(), count: 2 } });
    expect(load().lessonsToday).toEqual({ date: todayISO(), count: 2 });
  });

  it("resets the count when the stored date is not today", () => {
    storage.raw(KEY, { lessonsToday: { date: "2020-01-01", count: 7 } });
    expect(load().lessonsToday).toEqual({ date: todayISO(), count: 0 });
  });
});
