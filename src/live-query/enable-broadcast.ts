import {
  globalEvents,
  STORAGE_MUTATED_DOM_EVENT_NAME,
  DEXIE_STORAGE_MUTATED_EVENT_NAME,
} from '../globals/global-events';
import { propagateLocally, propagatingLocally } from './propagate-locally';

if (typeof BroadcastChannel !== 'undefined') {
  const bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);

  //
  // Propagate local changes to remote tabs, windows and workers via BroadcastChannel
  //
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
    if (!propagatingLocally) {
      bc.postMessage(changedParts);
    }
  });

  //
  // Propagate remote changes locally via storage event:
  //
  bc.onmessage = (ev) => {
    if (ev.data) propagateLocally(ev.data);
  };
} else if (typeof self !== 'undefined' && typeof navigator !== 'undefined') {
  // DOM verified - when typeof self !== "undefined", we are a window or worker. Not a Node process.

  //
  // Propagate local changes to remote tabs/windows via storage event and service worker
  // via messages. We have this code here because of https://bugs.webkit.org/show_bug.cgi?id=161472.
  //
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, (changedParts) => {
    try {
      if (!propagatingLocally) {
        if (typeof localStorage !== 'undefined') {
          // We're a browsing window or tab. Propagate to other windows/tabs via storage event:
          localStorage.setItem(
            STORAGE_MUTATED_DOM_EVENT_NAME,
            JSON.stringify({
              trig: Math.random(),
              changedParts,
            })
          );
        }
        if (typeof self['clients'] === 'object') {
          // We're a service worker. Propagate to our browser clients.
          [...self['clients'].matchAll({ includeUncontrolled: true })].forEach(
            (client) =>
              client.postMessage({
                type: STORAGE_MUTATED_DOM_EVENT_NAME,
                changedParts,
              })
          );
        }
      }
    } catch {}
  });

  //
  // Propagate remote changes locally via storage event:
  //
  if (typeof addEventListener !== 'undefined') {
      addEventListener('storage', (ev: StorageEvent) => {
      if (ev.key === STORAGE_MUTATED_DOM_EVENT_NAME) {
        const data = JSON.parse(ev.newValue);
        if (data) propagateLocally(data.changedParts);
      }
    });
  }

  //
  // Propagate messages from service worker
  //
  const swContainer = self.document && navigator.serviceWorker; // self.document is to verify we're not the SW ourself
  if (swContainer) {
    // We're a browser window and want to propagate message from the SW:
    swContainer.addEventListener('message', propagateMessageLocally);
  }
}

function propagateMessageLocally({ data }: MessageEvent) {
  if (data && data.type === STORAGE_MUTATED_DOM_EVENT_NAME) {
    propagateLocally(data.changedParts);
  }
}
