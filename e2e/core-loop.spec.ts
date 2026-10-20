import { expect, test, type Page } from "@playwright/test";

// The irreducible paths through the app: pick a language, reach each section,
// start a lesson, hold a conversation. If any of these breaks, the product is
// broken regardless of what the unit tests say.
//
// /api/chat is always mocked. The real endpoint costs money per call and its
// replies are non-deterministic, neither of which belongs in CI.

/** Marco's reply shape, including the translation the server splits out. */
function mockChat(page: Page, body: Record<string, unknown>, status = 200) {
  return page.route("**/api/chat", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  );
}

async function chooseLanguage(page: Page, label: "English" | "Español") {
  await page.goto("/");
  await expect(page.getByText("Choose your language / Elige tu idioma")).toBeVisible();
  await page.getByRole("button", { name: new RegExp(label) }).click();
  await expect(page.getByText("Choose your language / Elige tu idioma")).toBeHidden();
}

test.describe("first run", () => {
  test("gates on language, then shows the three sections in English", async ({ page }) => {
    await chooseLanguage(page, "English");

    await expect(page.getByRole("button", { name: /Verbs/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Conversation/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Settings/ })).toBeVisible();
  });

  test("shows the interface in Spanish when Spanish is chosen", async ({ page }) => {
    await chooseLanguage(page, "Español");

    await expect(page.getByRole("button", { name: /Verbos/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Conversación/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ajustes/ })).toBeVisible();
  });

  test("remembers the language across a reload", async ({ page }) => {
    await chooseLanguage(page, "English");
    await page.reload();
    await expect(page.getByText("Choose your language / Elige tu idioma")).toBeHidden();
    await expect(page.getByRole("button", { name: /Verbs/ })).toBeVisible();
  });
});

test.describe("verbs section — three ways in", () => {
  test.beforeEach(async ({ page }) => {
    await chooseLanguage(page, "English");
    await page.getByRole("button", { name: /Verbs/ }).click();
  });

  test("offers Continue, Random and Choose", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Continue/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Learn something new/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Choose/ })).toBeVisible();
    // The path stays reachable, but is no longer the only way in.
    await expect(page.getByRole("button", { name: /See the whole path/ })).toBeVisible();
  });

  test("Continue starts the first unit in one tap", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Unit 1 of/ })).toBeVisible();
    await page.getByRole("button", { name: /Continue/ }).click();

    // The intro card is a conjugation table, so the pronoun column appears.
    await expect(page.getByRole("cell", { name: "io", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "voi", exact: true })).toBeVisible();
  });

  test("Choose filters by search and starts with one verb", async ({ page }) => {
    await page.getByRole("button", { name: /^Choose/ }).click();

    const search = page.getByRole("textbox", { name: "Search verbs" });
    await search.fill("parl");
    await expect(page.getByRole("button", { name: "parlare", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "mangiare", exact: true })).toBeHidden();

    await page.getByRole("button", { name: "parlare", exact: true }).click();
    await expect(page.getByRole("button", { name: "Practise parlare" })).toBeEnabled();
  });

  test("Choose reports an empty result rather than showing nothing", async ({ page }) => {
    await page.getByRole("button", { name: /^Choose/ }).click();
    await page.getByRole("textbox", { name: "Search verbs" }).fill("zzzz");
    await expect(page.getByText("No verbs match that.")).toBeVisible();
  });

  test("the full path is browsable and locks later units", async ({ page }) => {
    await page.getByRole("button", { name: /See the whole path/ }).click();
    await expect(page.getByRole("button", { name: /The two pillars/ })).toBeEnabled();
    // Units unlock in sequence, so a later one must not be startable.
    await expect(page.getByRole("button", { name: /Modal verbs/ })).toBeDisabled();
  });
});

test.describe("navigation history", () => {
  test("the back gesture goes back a screen instead of leaving the app", async ({ page }) => {
    await chooseLanguage(page, "English");
    await page.getByRole("button", { name: /Settings/ }).click();
    await expect(page).toHaveURL(/\/settings$/);

    await page.goBack();
    await expect(page.getByRole("button", { name: /Verbs/ })).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("sections are deep-linkable", async ({ page }) => {
    await chooseLanguage(page, "English");
    await page.goto("/conversation");
    await expect(page.getByRole("button", { name: /Start chatting/ })).toBeVisible();
  });

  test("a lesson URL lands on the section rather than inventing a lesson", async ({ page }) => {
    // Lessons are generated at runtime, so a URL cannot name one.
    await chooseLanguage(page, "English");
    await page.goto("/verbs/lesson");
    await expect(page.getByRole("button", { name: /Learn something new/ })).toBeVisible();
  });

  test("back during a lesson asks before discarding progress", async ({ page }) => {
    await chooseLanguage(page, "English");
    await page.getByRole("button", { name: /Verbs/ }).click();
    await page.getByRole("button", { name: /Continue/ }).click();
    await expect(page.getByRole("cell", { name: "io", exact: true })).toBeVisible();

    await page.goBack();
    await expect(page.getByText("Leave the lesson?")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Leave the lesson?")).toBeHidden();
    // Still in the lesson.
    await expect(page.getByRole("cell", { name: "io", exact: true })).toBeVisible();

    await page.goBack();
    // The header carries a "✕ Exit" control too; this is the dialog's.
    await page.getByRole("button", { name: "Exit", exact: true }).click();
    await expect(page.getByRole("button", { name: /Learn something new/ })).toBeVisible();
  });
});

test.describe("conversation — the core loop", () => {
  test.beforeEach(async ({ page }) => {
    await chooseLanguage(page, "English");
  });

  test("sends a message and renders Marco's reply", async ({ page }) => {
    await mockChat(page, {
      reply: "Ciao! Anche io **mangio** la pizza.",
      translation: "Hi! I eat pizza too.",
    });

    await page.getByRole("button", { name: /Conversation/ }).click();
    await page.getByRole("button", { name: /Start chatting/ }).click();

    await page.getByRole("textbox").last().fill("Ciao Marco!");
    await page.keyboard.press("Enter");

    await expect(page.getByText(/Anche io/)).toBeVisible();
  });

  test("translates a message on demand and hides it again", async ({ page }) => {
    await mockChat(page, {
      reply: "Ciao! Anche io **mangio** la pizza.",
      translation: "Hi! I eat pizza too.",
    });

    await page.getByRole("button", { name: /Conversation/ }).click();
    await page.getByRole("button", { name: /Start chatting/ }).click();
    await page.getByRole("textbox").last().fill("Ciao Marco!");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Anche io/)).toBeVisible();

    // Hidden until asked for: no second call, no spinner.
    await expect(page.getByText("Hi! I eat pizza too.")).toBeHidden();
    await page.getByRole("button", { name: "Translate" }).last().click();
    await expect(page.getByText("Hi! I eat pizza too.")).toBeVisible();

    await page.getByRole("button", { name: "Hide translation" }).last().click();
    await expect(page.getByText("Hi! I eat pizza too.")).toBeHidden();
  });

  test("scrolls the revealed translation into view", async ({ page }) => {
    // Revealing a translation makes the message taller; without following it,
    // the text the learner just asked for sits clipped below the fold.
    await mockChat(page, {
      reply: "Ciao! Anche io **mangio** la pizza ogni settimana, davvero.",
      translation: "Hi! I eat pizza every week too, honestly. And I never get tired of it.",
    });

    await page.getByRole("button", { name: /Conversation/ }).click();
    await page.getByRole("button", { name: /Start chatting/ }).click();
    await page.getByRole("textbox").last().fill("Ciao Marco!");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Anche io/)).toBeVisible();

    await page.getByRole("button", { name: "Translate" }).last().click();
    const translation = page.getByText(/I eat pizza every week too/);
    await expect(translation).toBeVisible();
    await expect(translation).toBeInViewport();
  });

  test("says so in the learner's language when a reply has no translation", async ({ page }) => {
    await mockChat(page, { reply: "Ciao!", translation: "" });

    await page.getByRole("button", { name: /Conversation/ }).click();
    await page.getByRole("button", { name: /Start chatting/ }).click();
    await page.getByRole("textbox").last().fill("Ciao");
    await page.keyboard.press("Enter");

    await page.getByRole("button", { name: "Translate" }).last().click();
    await expect(page.getByText("No translation available for this message.")).toBeVisible();
  });

  test("shows a localized notice when rate limited", async ({ page }) => {
    await mockChat(page, { error: "rate_limited", reply: "(fallback)" }, 429);

    await page.getByRole("button", { name: /Conversation/ }).click();
    await page.getByRole("button", { name: /Start chatting/ }).click();
    await page.getByRole("textbox").last().fill("Ciao");
    await page.keyboard.press("Enter");

    // The server sends a code; the client renders the learner's language, and
    // the English fallback must never reach the thread.
    await expect(page.getByText(/take a short break/)).toBeVisible();
    await expect(page.getByText("(fallback)")).toBeHidden();
  });

  test("survives a reload with the thread intact", async ({ page }) => {
    await mockChat(page, { reply: "Ciao! Come stai?", translation: "Hi! How are you?" });

    await page.getByRole("button", { name: /Conversation/ }).click();
    await page.getByRole("button", { name: /Start chatting/ }).click();
    await page.getByRole("textbox").last().fill("Ciao");
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Come stai/)).toBeVisible();

    await page.reload();
    await page.goto("/conversation");
    await expect(page.getByText(/Come stai/)).toBeVisible();
  });
});
