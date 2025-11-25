import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import './playwright-setup';

/**
 * Configuration Playwright pour tester les flows
 *
 * Usage:
 *   pnpm test:e2e      - Lance les tests en headless
 *   pnpm test:e2e:ui   - Lance l'interface UI de Playwright
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 180 * 1000, // Increased to 180s (3min) for SwissLife complete Step 1 with all sections and fixtures
  retries: 0,
  workers: 1,
  outputDir: './e2e/test-results',

  reporter: [
    ['html', { outputFolder: './e2e/playwright-report', open: 'never' }],
    ['list']
  ],

  use: {
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
});
