import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000'
  const proxy = {
    target: apiTarget,
    changeOrigin: true,
  }

  return {
    plugins: [react(), tailwindcss()],
    // Avoid host 5173: common Docker maps (e.g. other stacks publishing 5173 on Windows).
    server: {
      port: 5190,
      strictPort: false,
      // Same-origin API in dev (no CORS). Restart dev server after changing proxy env.
      proxy: {
        '/auth': proxy,
        '/devices': proxy,
        '/tickets': proxy,
        '/health': proxy,
      },
    },
  }
})
