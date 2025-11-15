import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Configuration Playwright pour tester les flows
 *
 * Usage:
 *   pnpm test:e2e      - Lance les tests en headless
 *   pnpm test:e2e:ui   - Lance l'interface UI de Playwright
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  retries: 0,
  workers: 1,

  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    baseURL: 'https://pro.alptis.org',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
