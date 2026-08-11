import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke E2E — run against vite preview or dev:
 *   npm run build && npm run preview & npx playwright test
 *   or: PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    // Default away from common 4173 (often occupied by other local projects).
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4177',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run preview -- --host 127.0.0.1 --port 4177 --strictPort',
        url: 'http://127.0.0.1:4177',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
