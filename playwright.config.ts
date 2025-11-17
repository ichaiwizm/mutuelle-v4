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
  outputDir: './e2e/test-results',

  reporter: [
    ['html', { outputFolder: './e2e/playwright-report', open: 'never' }],
    ['list']
  ],

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: '🎲 Random',
      use: {
        ...devices['Desktop Chrome'],
        leadType: 'random',
      },
    },
    {
      name: '👫 Avec conjoint',
      use: {
        ...devices['Desktop Chrome'],
        leadType: 'conjoint',
      },
    },
    {
      name: '👶 Avec enfants',
      use: {
        ...devices['Desktop Chrome'],
        leadType: 'children',
      },
    },
    {
      name: '👨‍👩‍👧 Conjoint + Enfants',
      use: {
        ...devices['Desktop Chrome'],
        leadType: 'both',
      },
    },
  ],
});
