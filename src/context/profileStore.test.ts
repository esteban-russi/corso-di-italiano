import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorageStub } from "../test/localStorageStub";
import { PROFILE_SCHEMA_VERSION, load } from "./ProfileContext";

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

  it("repairs one corrupt field without discarding the rest", () => {
    // An older build could have written lessonsToday: null. This used to take
    // the whole profile down with it — including completed units, which are
    // the learner's only record of progress until the database lands. Now the
    // broken field is reset and everything else survives.
    storage.raw(KEY, { name: "Esteban", completedUnits: ["u1", "u2"], lessonsToday: null });
    const p = load();
    expect(p.name).toBe("Esteban");
    expect(p.completedUnits).toEqual(["u1", "u2"]);
    expect(p.lessonsToday).toEqual({ date: todayISO(), count: 0 });
  });

  it("drops junk entries inside a field rather than the field", () => {
    storage.raw(KEY, {
      completedUnits: ["u1", 42, null, "u2"],
      weakForms: { "parlare:presente:0": 4, bad: "nope", negative: -3 },
      topics: "not-an-array",
      dailyGoal: -5,
    });
    const p = load();
    expect(p.completedUnits).toEqual(["u1", "u2"]);
    expect(p.weakForms).toEqual({ "parlare:presente:0": 4 });
    expect(p.topics).toEqual([]);
    expect(p.dailyGoal).toBe(1);
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

describe("schema versioning", () => {
  it("stamps the current version on a fresh profile", () => {
    expect(load().schemaVersion).toBe(PROFILE_SCHEMA_VERSION);
  });

  it("migrates an unversioned profile written before versioning existed", () => {
    // The v0 shape is already compatible, so this only stamps the version —
    // but the path has to exist before formKey changes shape
    // (docs/12-persistence.md D-12-2), or every learner's weakForms resets.
    storage.raw(KEY, { name: "Esteban", weakForms: { "parlare:presente:0": 4 } });
    const p = load();
    expect(p.schemaVersion).toBe(PROFILE_SCHEMA_VERSION);
    expect(p.name).toBe("Esteban");
    expect(p.weakForms).toEqual({ "parlare:presente:0": 4 });
  });

  it("keeps a profile written by a newer build instead of downgrading it", () => {
    // The same learner may have two devices on different versions. Discarding
    // what we do not recognise would lose real progress.
    storage.raw(KEY, {
      schemaVersion: PROFILE_SCHEMA_VERSION + 5,
      name: "Esteban",
      completedUnits: ["u1"],
    });
    const p = load();
    expect(p.schemaVersion).toBe(PROFILE_SCHEMA_VERSION + 5);
    expect(p.name).toBe("Esteban");
    expect(p.completedUnits).toEqual(["u1"]);
  });

  it("treats a nonsense version as unversioned", () => {
    storage.raw(KEY, { schemaVersion: "old", name: "Esteban" });
    expect(load().schemaVersion).toBe(PROFILE_SCHEMA_VERSION);
    expect(load().name).toBe("Esteban");
  });
});
