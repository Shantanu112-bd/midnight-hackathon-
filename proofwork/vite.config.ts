import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // @ts-ignore
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    // @ts-ignore
    historyApiFallback: true,
  }
})
