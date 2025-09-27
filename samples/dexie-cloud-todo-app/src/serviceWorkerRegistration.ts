// This file integrates with vite-plugin-pwa for service worker functionality
// vite-plugin-pwa automatically generates the service worker based on the config

import { registerSW } from 'virtual:pwa-register'

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onNeedRefresh?: () => void;
};

export function register(config?: Config) {
  // Only register in production
  if (import.meta.env.PROD) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('New content is available and will be used when all tabs for this page are closed.');
        if (config?.onUpdate && 'serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              config.onUpdate!(registration);
            }
          });
        }
        if (config?.onNeedRefresh) {
          config.onNeedRefresh();
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline.');
        if (config?.onSuccess && 'serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              config.onSuccess!(registration);
            }
          });
        }
        if (config?.onOfflineReady) {
          config.onOfflineReady();
        }
      },
    });

    // Return function to manually update the service worker
    return updateSW;
  }
  
  return () => {};
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
