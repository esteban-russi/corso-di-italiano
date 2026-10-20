import { describe, expect, it } from "vitest";
import { CHARACTERS, DEFAULT_CHARACTER_ID, getCharacterInfo } from "../curriculum/characters";
import { audioEngine } from "./audioEngine";

describe("characters catalog", () => {
  it("includes all 4 characters with appropriate difficulty and voices", () => {
    expect(CHARACTERS).toHaveProperty("marco");
    expect(CHARACTERS).toHaveProperty("giulia");
    expect(CHARACTERS).toHaveProperty("rosa");
    expect(CHARACTERS).toHaveProperty("luca");

    expect(CHARACTERS.rosa.difficulty).toBe("beginner");
    expect(CHARACTERS.giulia.difficulty).toBe("intermediate");
    expect(CHARACTERS.marco.difficulty).toBe("all_levels");
  });

  it("getCharacterInfo provides default character when input is invalid", () => {
    expect(getCharacterInfo("non_existent").id).toBe(DEFAULT_CHARACTER_ID);
    expect(getCharacterInfo(null).id).toBe(DEFAULT_CHARACTER_ID);
    expect(getCharacterInfo("giulia").id).toBe("giulia");
  });
});

describe("audioEngine", () => {
  it("initializes without errors in node test environment", () => {
    expect(audioEngine).toBeDefined();
    expect(audioEngine.isSpeaking()).toBe(false);
    expect(audioEngine.isListening()).toBe(false);
  });

  it("records and clears latency metrics correctly", () => {
    audioEngine.clearMetrics();
    expect(audioEngine.getMetrics().length).toBe(0);

    audioEngine.logMetric({
      operation: "tts",
      provider: "webSpeech",
      durationMs: 140,
      success: true,
      notes: "Test metric",
    });

    const metrics = audioEngine.getMetrics();
    expect(metrics.length).toBe(1);
    expect(metrics[0].durationMs).toBe(140);
    expect(metrics[0].provider).toBe("webSpeech");
  });
});
