import { sessionStorage } from './sessionstorage';

let subscribers: SubscriberEntry[] = [];
let counter = 1;

export function publish(channel: string, msg) {
  const key = "ps:" + (++counter) + ":" + channel;
  if (sessionStorage) sessionStorage.setItem(key, msg);
}

export function subscribe(channel: string, subscriber: (msg) => void) {
  if (!subscribers.some(s => s.subscriber === subscriber)) {
    subscribers.push({channel, subscriber});
  }
}

export function unsubscribe(channel: string, subscriber: (msg) => void) {
  subscribers = subscribers.filter(s => s.subscriber !== subscriber);
}

interface SubscriberEntry {
  channel: string;
  subscriber: (msg) => void;
}

addEventListener('storage', ev => {
  if (ev.key && ev.storageArea === sessionStorage && ev.key.startsWith('ps:')) {
    const msg = ev.newValue;
    if (msg !== null) { // Don't deletions

      const [_, counter, channel] = ev.key.split(':');
    
      subscribers.filter(s => s.channel === channel)
        .forEach(({subscriber}) => {
          // Rather than just calling callback, queue it asynchronically
          // so that any exception does not make other subscribers to fail.
          Promise.resolve().then(()=>subscriber(msg));
      });

      // Cleanup
      sessionStorage.removeItem(ev.key);
    }
  }
});

