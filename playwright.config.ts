import { defineConfig, devices } from "@playwright/test";

// One core-loop suite, per docs/15-quality-and-testing.md D-15-2(a). Kept
// deliberately small: a broader suite written against screens that
// docs/07-design-system.md is about to rewrite would be thrown away.
//
// Mobile is the first project, not an afterthought: D2 makes mobile-first web
// the platform, so that is the configuration that must stay green.

const PORT = Number(process.env.E2E_PORT ?? 8123);

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 5"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // Serves the built dist/ plus /api, the same way production does. No
    // GEMINI_API_KEY is needed: every test that touches /api/chat mocks it, so
    // the suite is deterministic and costs nothing to run.
    command: `node server/index.mjs`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
