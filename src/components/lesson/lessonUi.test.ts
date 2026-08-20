import { describe, expect, it } from "vitest";
import { answersMatch, cap, correctFlavor, normalize, wrongFlavor } from "./lessonUi";

// Every typed answer in the app is graded through answersMatch. A learner on a
// keyboard without accents must not be marked wrong for "e" instead of "è".

describe("normalize", () => {
  it("lowercases", () => {
    expect(normalize("Parlo")).toBe("parlo");
    expect(normalize("HO PARLATO")).toBe("ho parlato");
  });

  it("strips accents", () => {
    expect(normalize("è")).toBe("e");
    expect(normalize("parlerò")).toBe("parlero");
    expect(normalize("parlerà")).toBe("parlera");
  });

  it("trims and collapses internal whitespace", () => {
    expect(normalize("  ho   parlato  ")).toBe("ho parlato");
    expect(normalize("ho\tparlato")).toBe("ho parlato");
  });

  it("is idempotent", () => {
    const once = normalize("  Sono   Andàto ");
    expect(normalize(once)).toBe(once);
  });

  it("leaves an empty string empty", () => {
    expect(normalize("   ")).toBe("");
  });
});

describe("answersMatch", () => {
  it("accepts an exact answer", () => {
    expect(answersMatch("parlo", "parlo")).toBe(true);
  });

  it("ignores case, accents and spacing", () => {
    expect(answersMatch("Parlo", "parlo")).toBe(true);
    expect(answersMatch("parlero", "parlerò")).toBe(true);
    expect(answersMatch("PARLERÀ", "parlerà")).toBe(true);
    expect(answersMatch("  ho  parlato ", "ho parlato")).toBe(true);
    expect(answersMatch("E", "è")).toBe(true);
  });

  it("accepts a decomposed accent typed as base + combining mark", () => {
    expect(answersMatch("parlerò", "parlerò")).toBe(true);
  });

  it("still rejects a wrong form", () => {
    expect(answersMatch("parli", "parlo")).toBe(false);
    expect(answersMatch("", "parlo")).toBe(false);
    expect(answersMatch("ho parlato", "hai parlato")).toBe(false);
  });

  it("does not accept a form missing its auxiliary", () => {
    expect(answersMatch("parlato", "ho parlato")).toBe(false);
  });
});

describe("feedback flavour", () => {
  it("returns an Italian flavour word for any seed, wrapping around", () => {
    const seeds = [0, 1, 2, 3, 4, 5, 12];
    for (const seed of seeds) expect(correctFlavor(seed)).toMatch(/\S/);
    expect(correctFlavor(0)).toBe(correctFlavor(5));
  });

  it("explains the correction in the interface language, not Italian", () => {
    // Italian is flavour only: "Quasi!" may lead, but the instruction is
    // localized. See docs/04-interface-language.md.
    expect(wrongFlavor("en")).toContain("Here's the correct form");
    expect(wrongFlavor("es")).toContain("Esta es la forma correcta");
  });
});

describe("cap", () => {
  it("capitalizes the first character only", () => {
    expect(cap("parlo")).toBe("Parlo");
    expect(cap("ho parlato")).toBe("Ho parlato");
  });

  it("tolerates an empty string", () => {
    expect(cap("")).toBe("");
  });
});
