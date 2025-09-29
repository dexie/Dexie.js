import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/*
 * TODO: Customize this starter template for your own Dexie Cloud PWA
 * 
 * Before deploying your own app to production, make sure to:
 * 1. Update package.json name, description, and version
 * 2. Replace app icons (see manifest.icons below)
 * 3. Add real app screenshots (see manifest.screenshots below)
 * 4. Update app name, description, and theme colors in manifest
 * 5. Configure your Dexie Cloud database URL in src/db/db.ts
 * 6. Update service worker caching strategy if needed (src/sw.ts)
 * 7. Test PWA functionality on mobile and desktop
 * 8. Set up proper error logging and analytics
 */

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const base = process.env.PUBLIC_URL ?? './'
  
  return {
    base,
    define: {
      // (replaces process.env.BUILD_DATE with actual build timestamp - for logging)
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
          // TODO: Customize your PWA manifest for production
          // 1. Change app name and description to match your app
          name: 'Dexie Cloud ToDo Sample App',
          short_name: 'DexieCloudToDo',
          description: 'A todo app demonstrating Dexie Cloud with Vite',
          
          // TODO: Update theme colors to match your brand
          // (For complete manifest properties reference, see:
          //  https://developer.mozilla.org/en-US/docs/Web/Manifest)
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: './',
          
          // TODO: Replace with your own app icons
          // Create icons in sizes: 64x64, 192x192, 512x512
          // Place them in public/ folder and update paths below
          icons: [
            {
              src: base + 'dexie-icon-64x64.gif',
              sizes: '64x64',
              type: 'image/gif'
            },
            {
              src: base + 'dexie-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: base + 'dexie-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ],
          
          // TODO: Replace with actual app screenshots for better install UX
          // Desktop: 1280x800 or similar wide format
          // Mobile: 320x640 or similar narrow format
          screenshots: [
            {
              src: base + 'dexie-icon-512x512.png', // TODO: Replace with desktop screenshot
              sizes: '512x512',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Dexie Cloud ToDo App - Desktop View' // TODO: Update label
            },
            {
              src: base + 'dexie-icon-512x512.png', // TODO: Replace with mobile screenshot
              sizes: '512x512',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Dexie Cloud ToDo App - Mobile View' // TODO: Update label
            }
          ]
        }
      })
    ],
  }
})