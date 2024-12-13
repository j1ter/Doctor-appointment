import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  base: '/admin/',
  define: {
    'import.meta.env.VITE_BACKEND_URL': '"https://doctor-appointment.fly.dev"'
  }
})
