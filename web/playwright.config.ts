import { defineConfig, devices } from '@playwright/test';

/** End-to-end: real FastAPI (fresh SQLite + demo data) + Angular dev server. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  use: { baseURL: 'http://localhost:4200', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: process.env['CHROMIUM_PATH'] || undefined },
      },
    },
  ],
  webServer: [
    {
      command: 'sh e2e/start-api.sh',
      url: 'http://localhost:8000/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
