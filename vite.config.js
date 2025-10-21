import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    historyApiFallback: true,
    allowedHosts: [
      '6887c587097d.ngrok-free.app'
    ]
    // host: "192.168.137.1",
    // port: 8080
  },
  assetsInclude: ['**/*.lottie'],
})
