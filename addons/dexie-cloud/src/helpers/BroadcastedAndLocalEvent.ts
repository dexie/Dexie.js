import { Observable } from "rxjs";
import { SWBroadcastChannel } from "./SWBroadcastChannel";

const events: Map<string, Array<(ev: CustomEvent)=>void>> =
  globalThis['lbc-events'] || (globalThis['lbc-events'] = new Map<string, Array<(ev: CustomEvent)=>void>>());

function addListener(name: string, listener: (ev: CustomEvent)=>void) {
  if (events.has(name)) {
    events.get(name)!.push(listener);
  } else {
    events.set(name, [listener]);
  }
}
function removeListener(name: string, listener: (ev: CustomEvent)=>void) {
  const listeners = events.get(name);
  if (listeners) {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  }
}
function dispatch(ev: CustomEvent) {
  const listeners = events.get(ev.type);
  if (listeners) {
    listeners.forEach(listener => {
      try {
        listener(ev);
      } catch {
      }
    });
  }
}

export class BroadcastedAndLocalEvent<T> extends Observable<T>{
  name: string;
  bc: BroadcastChannel | SWBroadcastChannel

  constructor(name: string) {
    const bc = typeof BroadcastChannel === "undefined"
      ? new SWBroadcastChannel(name) : new BroadcastChannel(name);
    super(subscriber => {
      function onCustomEvent(ev: CustomEvent) {
        subscriber.next(ev.detail);
      }
      function onMessageEvent(ev: MessageEvent) {
        console.debug("BroadcastedAndLocalEvent: onMessageEvent", ev);
        subscriber.next(ev.data);
      }
      let unsubscribe: ()=>void;
      //self.addEventListener(`lbc-${name}`, onCustomEvent); // Fails in service workers
      addListener(`lbc-${name}`, onCustomEvent); // Works better in service worker

      try {  
        if (bc instanceof SWBroadcastChannel) {
          unsubscribe = bc.subscribe(message => subscriber.next(message));
        } else {
          console.debug("BroadcastedAndLocalEvent: bc.addEventListener()", name, "bc is a", bc);
          bc.addEventListener("message", onMessageEvent);
        }
      } catch (err) {
        // Service workers might fail to subscribe outside its initial script.
        console.warn('Failed to subscribe to broadcast channel', err);
      }
      return () => {
        //self.removeEventListener(`lbc-${name}`, onCustomEvent);
        removeListener(`lbc-${name}`, onCustomEvent);
        if (bc instanceof SWBroadcastChannel) {
          unsubscribe!();
        } else {
          bc.removeEventListener("message", onMessageEvent);
        }
      }
    });
    this.name = name;
    this.bc = bc;
  }

  next(message: T) {
    console.debug("BroadcastedAndLocalEvent: bc.postMessage()", {...message}, "bc is a", this.bc);
    this.bc.postMessage(message);
    const ev = new CustomEvent(`lbc-${this.name}`, { detail: message });
    //self.dispatchEvent(ev);
    dispatch(ev);
  }
}
