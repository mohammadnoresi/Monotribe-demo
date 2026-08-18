import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Monotribe-demo/',
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [react()],
})
