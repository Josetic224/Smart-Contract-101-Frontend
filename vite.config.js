import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow external access
    port: 3000,        // Specify the port, change if needed
    allowedHosts: ['smart-contract-101-frontend.onrender.com'], // Allow this specific host
  },
})
