import { describe, expect, it } from "vitest";
import { HOME, isForward, navFromPath, pathFor, sameNav } from "./navigation";
import type { NavState } from "./navigation";

const nav = (section: NavState["section"], stage: NavState["stage"] = "home"): NavState => ({
  section,
  stage,
});

describe("pathFor", () => {
  it("maps each section to its path", () => {
    expect(pathFor(HOME)).toBe("/");
    expect(pathFor(nav("verbs-learning"))).toBe("/verbs");
    expect(pathFor(nav("conversation"))).toBe("/conversation");
    expect(pathFor(nav("settings"))).toBe("/settings");
  });

  it("appends the verbs stage when it is not the section home", () => {
    expect(pathFor(nav("verbs-learning", "lesson"))).toBe("/verbs/lesson");
    expect(pathFor(nav("verbs-learning", "summary"))).toBe("/verbs/summary");
  });

  it("ignores stages on sections that have none", () => {
    expect(pathFor(nav("conversation", "lesson"))).toBe("/conversation");
    expect(pathFor(nav("home", "summary"))).toBe("/");
  });
});

describe("navFromPath", () => {
  it("round-trips the section paths", () => {
    for (const section of ["verbs-learning", "conversation", "settings"] as const) {
      expect(navFromPath(pathFor(nav(section)))).toEqual(nav(section));
    }
    expect(navFromPath("/")).toEqual(HOME);
  });

  it("falls back to home for an unknown path", () => {
    // The server serves the SPA for every path, so this must not throw.
    expect(navFromPath("/nope")).toEqual(HOME);
    expect(navFromPath("/verbs-extra")).toEqual(HOME);
    expect(navFromPath("")).toEqual(HOME);
  });

  it("tolerates trailing slashes, queries and fragments", () => {
    expect(navFromPath("/verbs/")).toEqual(nav("verbs-learning"));
    expect(navFromPath("/settings?from=email")).toEqual(nav("settings"));
    expect(navFromPath("/conversation#top")).toEqual(nav("conversation"));
    expect(navFromPath("///")).toEqual(HOME);
  });

  it("lands on the section for a lesson or summary deep link", () => {
    // Lessons are generated at runtime, so a URL cannot name one: deep-linking
    // into a lesson would invent a different lesson than the learner left.
    expect(navFromPath("/verbs/lesson")).toEqual(nav("verbs-learning", "home"));
    expect(navFromPath("/verbs/summary")).toEqual(nav("verbs-learning", "home"));
  });

  it("never returns a stage it cannot reconstruct", () => {
    for (const path of ["/verbs/lesson", "/verbs/summary", "/verbs/anything"]) {
      expect(navFromPath(path).stage).toBe("home");
    }
  });
});

describe("sameNav", () => {
  it("compares section and stage", () => {
    expect(sameNav(nav("verbs-learning"), nav("verbs-learning"))).toBe(true);
    expect(sameNav(nav("verbs-learning"), nav("verbs-learning", "lesson"))).toBe(false);
    expect(sameNav(nav("verbs-learning"), nav("settings"))).toBe(false);
  });
});

describe("isForward", () => {
  it("treats entering a section from home as forward", () => {
    expect(isForward(HOME, nav("verbs-learning"))).toBe(true);
    expect(isForward(HOME, nav("conversation"))).toBe(true);
  });

  it("treats returning to home as not forward", () => {
    // Otherwise pressing Menu would stack an entry and back would feel stuck.
    expect(isForward(nav("verbs-learning"), HOME)).toBe(false);
    expect(isForward(nav("verbs-learning", "lesson"), HOME)).toBe(false);
  });

  it("treats entering a lesson as forward", () => {
    expect(isForward(nav("verbs-learning"), nav("verbs-learning", "lesson"))).toBe(true);
  });

  it("treats leaving a lesson for the section home as not forward", () => {
    expect(isForward(nav("verbs-learning", "lesson"), nav("verbs-learning"))).toBe(false);
  });

  it("does not stack an entry for the same screen", () => {
    expect(isForward(nav("settings"), nav("settings"))).toBe(false);
    expect(isForward(HOME, HOME)).toBe(false);
  });

  it("treats a sideways section change as not forward", () => {
    // Section switches only happen via home in the current UI, but if they ever
    // happen directly, they should replace rather than deepen the stack.
    expect(isForward(nav("settings"), nav("conversation"))).toBe(false);
  });
});
