import { defineConfig, devices } from "@playwright/test";

/**
 * Runs the suite against the production build served by `vite preview`,
 * so tests exercise the same bundle that ships. (CSP/headers are validated
 * separately via `wrangler pages dev`, since they're applied at the edge.)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run build && vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
