import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/crt': {
        target: 'https://crt.name',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/crt/, ''),
      },
    },
  },
})
