import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const alias = {
  '@': path.resolve(__dirname, 'src'),
  components: path.resolve(__dirname, 'src/components'),
  ui: path.resolve(__dirname, 'src/components/ui'),
  lib: path.resolve(__dirname, 'src/renderer/lib'),
  hooks: path.resolve(__dirname, 'src/renderer/hooks'),
  utils: path.resolve(__dirname, 'src/renderer/lib/utils'),
}

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        include: [
          'better-sqlite3',
          'playwright',
          'playwright-core',
          'chromium-bidi',
        ],
      }),
    ],
    resolve: { alias },
    build: {
      rollupOptions: {
        input: 'src/main/index.ts',
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      rollupOptions: {
        input: 'src/preload/index.ts',
      },
    },
  },
  renderer: {
    plugins: [react(), tailwind()],
    resolve: { alias },
    optimizeDeps: { exclude: ['better-sqlite3'] },
    build: { rollupOptions: { input: 'src/renderer/index.html' } },
  },
})
