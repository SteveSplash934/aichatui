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
      '297882fec450.ngrok-free.app'
    ]
    // host: "0.0.0.0",
    // port: 8080
  },
  assetsInclude: ['**/*.lottie'],
})
