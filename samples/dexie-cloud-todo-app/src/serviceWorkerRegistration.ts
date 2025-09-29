// This file integrates with vite-plugin-pwa for service worker functionality
// vite-plugin-pwa automatically generates the service worker based on the config

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onNeedRefresh?: () => void;
};

export function register(config?: Config) {
  // Only register in production and if service worker is supported
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        // Use Vite's BASE_URL to support deployment to subpaths
        let baseUrl = import.meta.env.BASE_URL;
        // Ensure baseUrl ends with /
        if (!baseUrl.endsWith('/')) baseUrl += '/';
        
        const registration = await navigator.serviceWorker.register(`${baseUrl}sw.js`, {
          scope: baseUrl
        });
        
        console.log(`🔧 Service Worker: Registration successful`, registration);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content is available and will be used when all tabs for this page are closed.');
                config?.onUpdate?.(registration);
                config?.onNeedRefresh?.();
              } else {
                console.log('App ready to work offline.');
                config?.onSuccess?.(registration);
                config?.onOfflineReady?.();
              }
            }
          });
        });

      } catch (error) {
        console.error('🚨 Service worker registration failed:', error);
        if (error instanceof Error) {
          console.error('🚨 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
      }
    });
  } else {
    if (!import.meta.env.PROD) {
      console.log('🚫 Service Worker: Disabled in development mode for easier debugging');
    } else if (!('serviceWorker' in navigator)) {
      console.log('🚫 Service Worker: Not supported in this browser');
    }
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
