// vite.config.ts (à la racine)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwind()],
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
})
