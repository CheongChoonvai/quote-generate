import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // During development, proxy API requests to the backend so calls like
  // `fetch('/api/history')` are forwarded to the Express server.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
