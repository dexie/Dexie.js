const swHolder: { registration?: ServiceWorkerRegistration } = {};
const swContainer = typeof self !== 'undefined' && self.document && // self.document is to verify we're not the SW ourself
                    typeof navigator !== 'undefined' && navigator.serviceWorker; 
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

/** This class is a fallback for browsers that lacks BroadcastChannel but have
 * service workers (which is Safari versions 11.1 through 15.3).
 * Safari 15.4 with BroadcastChannel was released on 2022-03-14.
 * We might be able to remove this class in a near future as Safari < 15.4 is
 * already very low in market share as of 2023-03-10.
 */
export class SWBroadcastChannel {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  subscribe(listener: (message: any) => void) {
    if (!swContainer) return () => {};
    const forwarder = (ev: MessageEvent) => {
      if (ev.data?.type === `sw-broadcast-${this.name}`) {
        listener(ev.data.message);
      }
    };
    swContainer.addEventListener('message', forwarder);
    return () => swContainer.removeEventListener('message', forwarder);
  }
  postMessage(message: any) {
    if (typeof self['clients'] === 'object') {
      // We're a service worker. Propagate to our browser clients.
      [...self['clients'].matchAll({ includeUncontrolled: true })].forEach(
        (client) =>
          client.postMessage({
            type: `sw-broadcast-${this.name}`,
            message,
          })
      );
    } else if (swHolder.registration) {
      // We're a client (browser window or other worker)
      // Post to SW so it can repost to all its clients and to itself
      swHolder.registration.active?.postMessage({
        type: `sw-broadcast-${this.name}`,
        message,
      });
    }
  }
}
