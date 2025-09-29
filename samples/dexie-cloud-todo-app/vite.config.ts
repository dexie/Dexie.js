import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.PUBLIC_URL ?? './',
  define: {
    // Replace process.env.BUILD_DATE with actual timestamp
    "process.env.BUILD_DATE": JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 3001
  },
  plugins: [
    react(),
    VitePWA({
      injectRegister: false, // We handle registration manually
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
    })
  ],
})