import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.BACKEND_URL || env.API_URL || env.VITE_API_URL || 'http://localhost:5223/api'

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      allowedHosts: true, // Allow localtunnel, cloudflared, ngrok, and local network devices
    },
    preview: {
      port: 5173,
      allowedHosts: true,
    },
  }
})
