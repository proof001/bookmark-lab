import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type ProxyOptions } from 'vite'

const USER_AGENT =
  'last30days-scout/0.0.1 (bookmark-lab demo; +https://github.com/proof001/bookmark-lab)'

const proxy: Record<string, ProxyOptions> = {
  '/api/hn': {
    target: 'https://hn.algolia.com',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/hn/, ''),
  },
  '/api/reddit': {
    target: 'https://www.reddit.com',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/reddit/, ''),
    headers: { 'User-Agent': USER_AGENT },
  },
  '/api/github': {
    target: 'https://api.github.com',
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/api\/github/, ''),
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    proxy,
  },
  preview: {
    host: true,
    proxy,
  },
})
