import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const alias = {
  '@': path.resolve(__dirname, 'src'),
  components: path.resolve(__dirname, 'src/renderer/components'),
  ui: path.resolve(__dirname, 'src/renderer/components/ui'),
  lib: path.resolve(__dirname, 'src/renderer/lib'),
  hooks: path.resolve(__dirname, 'src/renderer/hooks'),
  utils: path.resolve(__dirname, 'src/renderer/lib/utils'),
}

export default defineConfig({
  main: {
    // facultatif: plugins si besoin
    resolve: { alias },
    build: { rollupOptions: { input: 'src/main/index.ts' } },
  },
  preload: {
    resolve: { alias },
    build: { rollupOptions: { input: 'src/preload/index.ts' } },
  },
  renderer: {
    plugins: [react(), tailwind()],
    resolve: { alias },
    build: { rollupOptions: { input: 'src/renderer/index.html' } },
  },
})
