import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// In dev, proxy /api to the local Node server (run `npm run start` alongside).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  // Tests are pure-function/unit level (see docs/15-quality-and-testing.md):
  // the curriculum engine, answer grading and the localStorage loaders. No DOM
  // environment is needed — loaders are tested against a stubbed localStorage.
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.mjs"],
  },
});
