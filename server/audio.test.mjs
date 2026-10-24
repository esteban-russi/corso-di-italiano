import { describe, expect, it } from "vitest";
import { getProviderStatus, handleSttRequest, handleTtsRequest } from "./audio.mjs";

describe("server/audio", () => {
  it("returns provider status catalog without exposing keys", () => {
    const status = getProviderStatus();
    expect(status).toHaveProperty("gemini");
    expect(status).toHaveProperty("webSpeech");
    expect(status).toHaveProperty("mock");
    expect(JSON.stringify(status)).not.toContain("AIza"); // Ensure no API key leak
  });

  it("handles TTS request for Web Speech API and mock", async () => {
    const resWeb = await handleTtsRequest({
      text: "Ciao, come stai?",
      characterId: "giulia",
      provider: "webSpeech",
    });
    expect(resWeb.provider).toBe("webSpeech");
    expect(resWeb.characterId).toBe("giulia");
    expect(resWeb.voice.rate).toBe(1.1); // Giulia's voice rate

    const resMock = await handleTtsRequest({
      text: "Buongiorno!",
      characterId: "rosa",
      provider: "mock",
    });
    expect(resMock.provider).toBe("mock");
    expect(resMock.characterId).toBe("rosa");
    expect(resMock.durationSec).toBeGreaterThan(0);
  });

  it("handles STT simulated fallback for mock or offline provider", async () => {
    const res = await handleSttRequest({
      provider: "mock",
      simulatedText: "Un cornetto alla crema per favore",
    });
    expect(res.provider).toBe("mock");
    expect(res.transcript).toBe("Un cornetto alla crema per favore");
    expect(res.confidence).toBeGreaterThan(0.8);
  });
});
