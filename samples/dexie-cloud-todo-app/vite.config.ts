import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.PUBLIC_URL ?? './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: false, // Explicitly disable service worker in development
        type: 'module'
      },
      includeAssets: ['favicon.ico', 'dexie-icon-192x192.png', 'dexie-icon-512x512.png'],
      manifest: {
        name: 'Dexie Cloud ToDo App',
        short_name: 'ToDo',
        description: 'Dexie Cloud example application built with Vite',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'dexie-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'dexie-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  define: {
    // For libraries that might still use process.env
    global: 'globalThis',
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 3000
  }
})