import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Read the single shared .env from the project root (one folder above /frontend).
  // Vite exposes ONLY variables that start with VITE_ to the browser, so DB passwords
  // and other backend secrets in the same file never reach the frontend bundle.
  envDir: '..',
  server: { port: 5173 },
})