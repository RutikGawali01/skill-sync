import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis', // sockjs-client uses Node's `global`; polyfill for browser
  },
  server: {
    proxy: {
      // /api/* → forwarded to Spring Boot (avoids CORS entirely in dev)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // /ws/* → WebSocket proxy for STOMP/SockJS
      // ws:true enables WebSocket upgrade proxying (SockJS uses both HTTP + WS)
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
