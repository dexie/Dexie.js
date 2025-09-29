/// <reference lib="webworker" />
console.log('🚀 Service Worker starting (built at ' + process.env.BUILD_DATE + ')');

//
// Include Dexie Cloud's service worker code to enable background sync of Dexie Cloud changes
//
import "dexie-cloud-addon/service-worker";

// Import Workbox functionality
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim, skipWaiting } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { createHandlerBoundToURL } from 'workbox-precaching';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Take control immediately
skipWaiting();
clientsClaim();

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Handle navigation requests - use BASE_URL to support subpaths
let baseUrl = import.meta.env.BASE_URL;
if (!baseUrl.endsWith('/')) baseUrl += '/';

const navigationRoute = new NavigationRoute(
  createHandlerBoundToURL(`${baseUrl}index.html`)
);
registerRoute(navigationRoute);

// Cache Google Fonts
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Force update strategy for development
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  const tabs = await self.clients.matchAll({ type: 'window' });
  tabs.forEach((tab: any) => {
    tab.navigate(tab.url);
  });
});