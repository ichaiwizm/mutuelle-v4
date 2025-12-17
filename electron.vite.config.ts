import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

// Load .env file for build-time variables
config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const alias = {
  '@': path.resolve(__dirname, 'src'),
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
    // Injecte les credentials au build (lus depuis .env en dev, depuis secrets CI en prod)
    define: {
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID || ''),
      'process.env.GOOGLE_CLIENT_SECRET': JSON.stringify(process.env.GOOGLE_CLIENT_SECRET || ''),
      'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN || ''),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY || ''),
    },
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
    plugins: [react(), tailwindcss()],
    resolve: { alias },
    optimizeDeps: { exclude: ['better-sqlite3'] },
    build: { rollupOptions: { input: 'src/renderer/index.html' } },
    // Inject SENTRY_DSN for renderer (VITE_ prefix for Vite compatibility)
    define: {
      'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN || ''),
    },
  },
})
