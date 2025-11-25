import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      ui: path.resolve(__dirname, 'src/components/ui'),
      lib: path.resolve(__dirname, 'src/renderer/lib'),
      hooks: path.resolve(__dirname, 'src/renderer/hooks'),
      utils: path.resolve(__dirname, 'src/renderer/lib/utils'),
    },
  },
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Exclure tous les tests Playwright E2E
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
  },
});
