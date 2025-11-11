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

// Helper: considère tout id qui contient le segment comme "external"
const isExternal = (id: string) =>
  id.includes('better-sqlite3') ||
  id.includes('drizzle-orm/better-sqlite3')

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      rollupOptions: {
        input: 'src/main/index.ts',
        external: (id) => isExternal(id),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias },
    build: {
      rollupOptions: {
        input: 'src/preload/index.ts',
        external: (id) => isExternal(id),
      },
    },
  },
  renderer: {
    plugins: [react(), tailwind()],
    resolve: { alias },
    // Par sécurité, évite tout “pre-bundle” de ce module côté renderer
    optimizeDeps: { exclude: ['better-sqlite3'] },
    build: { rollupOptions: { input: 'src/renderer/index.html' } },
  },
})
