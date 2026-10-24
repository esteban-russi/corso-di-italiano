import { describe, expect, it } from "vitest";
import { CHARACTERS, DEFAULT_CHARACTER, getCharacter } from "./characters.mjs";
import { buildChatPrompt } from "./prompt.mjs";

describe("characters", () => {
  it("defines the core roster: Marco, Giulia, Nonna Rosa, Luca", () => {
    expect(CHARACTERS).toHaveProperty("marco");
    expect(CHARACTERS).toHaveProperty("giulia");
    expect(CHARACTERS).toHaveProperty("rosa");
    expect(CHARACTERS).toHaveProperty("luca");
  });

  it("each character has required persona, location, voice, and greetings", () => {
    for (const [id, char] of Object.entries(CHARACTERS)) {
      expect(char.id).toBe(id);
      expect(char.name).toBeTruthy();
      expect(char.city).toBeTruthy();
      expect(char.region).toBeTruthy();
      expect(char.persona.length).toBeGreaterThan(100);
      expect(char.voice.rate).toBeGreaterThan(0.5);
      expect(char.voice.pitch).toBeGreaterThan(0.5);
      expect(char.greetings.firstMeeting).toBeTruthy();
      expect(char.greetings.returningSameDay).toBeTruthy();
      expect(char.greetings.returningGap).toBeTruthy();
    }
  });

  it("getCharacter falls back to default Marco for unknown id", () => {
    expect(getCharacter("unknown").id).toBe(DEFAULT_CHARACTER);
    expect(getCharacter("giulia").id).toBe("giulia");
    expect(getCharacter(null).id).toBe(DEFAULT_CHARACTER);
  });

  it("buildChatPrompt adapts to Giulia's persona and location", () => {
    const prompt = buildChatPrompt({ characterId: "giulia", uiLang: "en" });
    expect(prompt).toContain("You are Giulia");
    expect(prompt).toContain("Milano");
  });

  it("buildChatPrompt adapts to Nonna Rosa's persona and location", () => {
    const prompt = buildChatPrompt({ characterId: "rosa", uiLang: "en" });
    expect(prompt).toContain("You are Nonna Rosa");
    expect(prompt).toContain("Napoli");
  });

  it("buildChatPrompt embeds scenario information when provided", () => {
    const prompt = buildChatPrompt({
      characterId: "marco",
      scenario: {
        setting: "Al bar per un espresso",
        characterRole: "Barista",
        objective: "Order a coffee and a pastry",
      },
    });
    expect(prompt).toContain("ACTIVE SCENARIO:");
    expect(prompt).toContain("Al bar per un espresso");
    expect(prompt).toContain("Barista");
  });
});
