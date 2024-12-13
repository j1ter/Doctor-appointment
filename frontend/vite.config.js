import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  base: '/',
  define: {
    'import.meta.env.VITE_BACKEND_URL': '"https://doctor-appointment.fly.dev"'
  }
})
