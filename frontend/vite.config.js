import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Avoid host 5173: common Docker maps (e.g. other stacks publishing 5173 on Windows).
  server: {
    port: 5190,
    strictPort: false,
  },
})
