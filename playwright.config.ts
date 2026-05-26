import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";

// BROWSER_TESTER_ROOT is always set by run-playwright.ts to PROJECT_ROOT.
// The fallback (process.cwd()) is only used for IDE test-discovery.
const TEST_ROOT = process.env.BROWSER_TESTER_ROOT
  ? resolve(process.env.BROWSER_TESTER_ROOT)
  : process.cwd();

export default defineConfig({
  testDir: TEST_ROOT,
  outputDir: "test-results",
  timeout: 60_000,
  retries: 1,
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
