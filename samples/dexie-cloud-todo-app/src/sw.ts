/// <reference lib="webworker" />

/* Minimal Service Worker for caching and background sync with Dexie Cloud
 * 
 * This service worker does two main things:
 * 1. Enables Dexie Cloud background sync by importing the Dexie Cloud service worker addon.
 * 2. Pre-caches and routes assets using Workbox for offline capabilities and faster load times.
 * 
 * The service worker is set up to log its build date for easier debugging of deployed versions.
 * It also uses `skipWaiting()` during installation to activate the new service worker immediately.
 * In a production app, consider allowing users to control updates instead.
 * 
 * Note: This file is part of a sample application and may be modified to fit specific needs.
 * 
 * See vite-config.ts for the Vite PWA plugin configuration that generates the final service worker.
 */

console.log(`🚀 Service Worker starting (built at ${process.env.BUILD_DATE})`);

// Enable Dexie Cloud background sync:
import 'dexie-cloud-addon/service-worker';

// Pre-caching and routing of assets:
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope; // typings for service worker

//
// Precache all assets
//
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Optional: Use skipWaiting for immediate updates during development
// In production apps, consider letting users control updates instead
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
