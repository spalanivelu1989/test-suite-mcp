import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "apps",
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
