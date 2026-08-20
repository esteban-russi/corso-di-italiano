import { describe, expect, it } from "vitest";
import { TRANSLATION_MARKER, buildChatPrompt, splitTranslation } from "./prompt.mjs";

// The translation rides along in the same turn (docs/01-conversation-core.md
// D-01-1b), so splitting it correctly is what keeps the marker out of the thread.

describe("splitTranslation", () => {
  it("splits the reply from the translation", () => {
    const raw = `Ciao! Come stai?\n${TRANSLATION_MARKER} Hi! How are you?`;
    expect(splitTranslation(raw)).toEqual({
      reply: "Ciao! Come stai?",
      translation: "Hi! How are you?",
    });
  });

  it("degrades to no translation when the marker is absent", () => {
    expect(splitTranslation("Ciao!")).toEqual({ reply: "Ciao!", translation: "" });
  });

  it("never leaks the marker into the reply", () => {
    const raw = `Andiamo!\n${TRANSLATION_MARKER}\nLet's go!`;
    const { reply, translation } = splitTranslation(raw);
    expect(reply).not.toContain(TRANSLATION_MARKER);
    expect(translation).not.toContain(TRANSLATION_MARKER);
    expect(translation).toBe("Let's go!");
  });

  it("keeps only the first marker's split point", () => {
    const raw = `Ciao ${TRANSLATION_MARKER} Hello ${TRANSLATION_MARKER} again`;
    const { reply, translation } = splitTranslation(raw);
    expect(reply).toBe("Ciao");
    expect(translation).toContain("Hello");
  });

  it("preserves correction lines and bold markup in the reply", () => {
    const raw = `📝 "io andare" → "**io vado**" — use the conjugated form.\nCiao!\n${TRANSLATION_MARKER} Hi!`;
    const { reply } = splitTranslation(raw);
    expect(reply).toContain("📝");
    expect(reply).toContain("**io vado**");
  });

  it("tolerates empty, null and undefined input", () => {
    expect(splitTranslation("")).toEqual({ reply: "", translation: "" });
    expect(splitTranslation(null)).toEqual({ reply: "", translation: "" });
    expect(splitTranslation(undefined)).toEqual({ reply: "", translation: "" });
  });
});

describe("buildChatPrompt", () => {
  it("asks for the translation in the learner's language", () => {
    expect(buildChatPrompt({ uiLang: "en" })).toContain(TRANSLATION_MARKER);
    expect(buildChatPrompt({ uiLang: "es" })).toContain("Spanish");
    expect(buildChatPrompt({ uiLang: "en" })).toContain("English");
  });

  it("falls back to English for an unknown interface language", () => {
    expect(buildChatPrompt({ uiLang: "zz" })).toContain("English");
  });

  it("keeps the conversation in Italian and corrections in the native language", () => {
    const prompt = buildChatPrompt({ uiLang: "es" });
    expect(prompt).toContain("Everything you SAY is in Italian");
    expect(prompt).toContain("CORRECTIONS (in Spanish)");
  });

  it("includes focus verbs, name, topic and weak verbs when given", () => {
    const prompt = buildChatPrompt({
      uiLang: "en", verbs: ["parlare", "mangiare"], name: "Esteban",
      topic: "Calcio", weakVerbs: ["capire"],
    });
    expect(prompt).toContain("parlare, mangiare");
    expect(prompt).toContain("Esteban");
    expect(prompt).toContain("Calcio");
    expect(prompt).toContain("capire");
  });

  it("still produces a usable prompt with no arguments", () => {
    const prompt = buildChatPrompt({});
    expect(prompt).toContain("essere, avere, fare");
    expect(prompt.length).toBeGreaterThan(200);
  });
});
