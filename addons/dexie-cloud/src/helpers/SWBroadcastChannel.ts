const swHolder: { registration?: ServiceWorkerRegistration } = {};
const swContainer = self.document && navigator.serviceWorker; // self.document is to verify we're not the SW ourself
if (swContainer)
  swContainer.ready.then(
    (registration) => (swHolder.registration = registration)
  );

if (typeof self !== 'undefined' && 'clients' in self && !self.document) {
  // We are the service worker. Propagate messages to all our clients.
  addEventListener('message', (ev: any) => {
    if (ev.data?.type?.startsWith('sw-broadcast-')) {
      [...self['clients'].matchAll({ includeUncontrolled: true })].forEach(
        (client) => client.id !== ev.source?.id && client.postMessage(ev.data)
      );
    }
  });
}

export class SWBroadcastChannel {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  subscribe(listener: (message: any) => void) {
    if (!swContainer) return ()=>{};
    const forwarder = (ev: MessageEvent) => {
      if (ev.data?.type === `sw-broadcast-${this.name}`) {
        listener(ev.data.message);
      }
    };
    swContainer.addEventListener('message', forwarder);
    return () =>
      swContainer.removeEventListener('message', forwarder);
  }
  postMessage(message: any) {
    if (typeof self['clients'] === 'object') {
      // We're a service worker. Propagate to our browser clients.
      [...self['clients'].matchAll({ includeUncontrolled: true })].forEach(
        (client) =>
          client.postMessage({
            type: `sw-broadcast-${this.name}`,
            message
          })
      );
    } else if (swHolder.registration) {
      // We're a client (browser window or other worker)
      // Post to SW so it can repost to all its clients and to itself
      swHolder.registration.active?.postMessage({
        type: `sw-broadcast-${this.name}`,
        message
      });
    }
  }
}
