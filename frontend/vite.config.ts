import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Allow localtunnel, cloudflared, ngrok, and local network devices
  },
  preview: {
    port: 5173,
    allowedHosts: true,
  },
})
