import { expect, test, type Page } from "@playwright/test";

async function chooseLanguage(page: Page, label: "English" | "Español") {
  await page.goto("/");
  await expect(page.getByText("Choose your language / Elige tu idioma")).toBeVisible();
  await page.getByRole("button", { name: new RegExp(label) }).click();
  await expect(page.getByText("Choose your language / Elige tu idioma")).toBeHidden();
}

test.describe("AI & Voice Experimentation Lab", () => {
  test.beforeEach(async ({ page }) => {
    await chooseLanguage(page, "English");
  });

  test("can navigate to the Lab from the Main Menu", async ({ page }) => {
    await expect(page.getByRole("button", { name: /AI & Voice Lab/ })).toBeVisible();
    await page.getByRole("button", { name: /AI & Voice Lab/ }).click();
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.getByText("AI & Voice Experimentation Lab")).toBeVisible();
  });

  test("can navigate directly to /lab deep-link", async ({ page }) => {
    await page.goto("/lab");
    await expect(page.getByText("AI & Voice Experimentation Lab")).toBeVisible();
    await expect(page.getByRole("button", { name: /Providers & Models/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Character Roster/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Speech & Audio/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Live Sandbox/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Diagnostics & Logs/ })).toBeVisible();
  });

  test("can switch to Character Roster tab and view character bibles", async ({ page }) => {
    await page.goto("/lab");
    await page.getByRole("button", { name: /Character Roster/ }).click();

    await expect(page.getByText("Marco").first()).toBeVisible();
    await expect(page.getByText("Giulia").first()).toBeVisible();
    await expect(page.getByText("Nonna Rosa").first()).toBeVisible();
    await expect(page.getByText("Luca").first()).toBeVisible();

    await expect(page.getByText("Beginner Friendly")).toBeVisible();
    await expect(page.getByText("Milanese crisp rhythm")).toBeVisible();
  });

  test("can switch to Speech & Audio workbench and trigger interruption test", async ({ page }) => {
    await page.goto("/lab");
    await page.getByRole("button", { name: /Speech & Audio/ }).click();

    await expect(page.getByText("Text-to-Speech (TTS) Benchmarking")).toBeVisible();
    await expect(page.getByText("Speech-to-Text (STT) Recognition")).toBeVisible();
    await expect(page.getByText("Test Interruption (Barge-in)")).toBeVisible();

    await page.getByRole("button", { name: "Start Interruption Test" }).click();
  });

  test("can run mock sandbox turn and record latency metric", async ({ page }) => {
    await page.goto("/lab");

    // Select Mock provider
    await page.getByText(/Mock/i).first().click();

    // Go to Sandbox tab
    await page.getByRole("button", { name: /Live Sandbox/ }).click();

    await page.getByPlaceholder(/Type Italian or test message/).fill("Vorrei un cornetto");
    await page.getByRole("button", { name: "Send Message" }).click();

    await expect(page.getByText(/Risposta di prova/)).toBeVisible();
  });
});

test.describe("Conversation v2 — Character switching and Recap", () => {
  test.beforeEach(async ({ page }) => {
    await chooseLanguage(page, "English");
  });

  test("allows switching partner to Giulia or Nonna Rosa", async ({ page }) => {
    await page.goto("/conversation");

    // Click Giulia
    await page.getByRole("button", { name: /Giulia/ }).click();
    await expect(page.getByText("Talk with Giulia")).toBeVisible();
    await expect(page.getByText("Milano")).toBeVisible();

    // Click Nonna Rosa
    await page.getByRole("button", { name: /Nonna Rosa/ }).click();
    await expect(page.getByText("Talk with Nonna Rosa")).toBeVisible();
    await expect(page.getByText("Napoli")).toBeVisible();
  });

  test("opens session recap modal", async ({ page }) => {
    await page.goto("/conversation");
    await page.getByRole("button", { name: /Start chatting/ }).click();

    await page.getByRole("button", { name: /Conversation Recap/ }).click();
    await expect(page.getByText("Great practice! Here is what was covered in this session:")).toBeVisible();
    await page.getByRole("button", { name: "Continue conversation" }).click();
    await expect(page.getByText("Great practice! Here is what was covered in this session:")).toBeHidden();
  });
});
