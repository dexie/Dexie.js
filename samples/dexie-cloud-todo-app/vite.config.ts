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
      manifest: {
        name: 'Dexie Cloud ToDo Sample App',
        short_name: 'DexieCloudToDo',
        description: 'A todo app demonstrating Dexie Cloud with Vite',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: '/dexie-icon-64x64.gif',
            sizes: '64x64',
            type: 'image/gif'
          },
          {
            src: '/dexie-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/dexie-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})