import { defineConfig, devices } from '@playwright/test';

// Configurazione Playwright per test E2E del portale Elite
// Include un progetto desktop e uno mobile per verificare la responsività di base del wizard.

export default defineConfig({
  testDir: './specs',
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'playwright-report.json' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],
});
