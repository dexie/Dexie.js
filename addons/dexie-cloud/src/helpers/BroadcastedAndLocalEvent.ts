import { Observable } from "rxjs";
import { SWBroadcastChannel } from "./SWBroadcastChannel";

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
      self.addEventListener(`lbc-${name}`, onCustomEvent);  
      if (bc instanceof SWBroadcastChannel) {
        unsubscribe = bc.subscribe(message => subscriber.next(message));
      } else {
        console.debug("BroadcastedAndLocalEvent: bc.addEventListener()", name, "bc is a", bc);
        bc.addEventListener("message", onMessageEvent);
      }
      return () => {
        self.removeEventListener(`lbc-${name}`, onCustomEvent);
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
    self.dispatchEvent(ev);
  }
}
