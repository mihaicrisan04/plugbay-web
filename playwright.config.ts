import { defineConfig, devices } from "@playwright/test";

// Not the dev server port: the tests must run against the production build.
const PORT = 4322;

export default defineConfig({
  fullyParallel: true,
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { height: 900, width: 1440 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  reporter: "list",
  testDir: "./tests",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    // --ignore-lock keeps preview in the foreground; Astro auto-backgrounds it when an agent runs it.
    command: `bun run preview --port ${PORT} --ignore-lock`,
    port: PORT,
    reuseExistingServer: false,
  },
});
