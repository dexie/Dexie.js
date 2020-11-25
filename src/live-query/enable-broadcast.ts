import { globalEvents } from "../globals/global-events";
import { propagateLocally, propagatingLocally } from "./propagate-locally";

if (typeof BroadcastChannel !== "undefined") {
  const bc = new BroadcastChannel('dexie-txcommitted');
  
  //
  // Propagate local changes to remote tabs, windows and workers via BroadcastChannel
  //
  globalEvents("txcommitted", (changedParts) => {
    if (!propagatingLocally) {
      bc.postMessage(changedParts);
    }
  });

  //
  // Propagate remote changes locally via storage event:
  //
  bc.onmessage = ev => {
    if (ev.data) propagateLocally(ev.data);
  };
} else if (typeof localStorage !== "undefined") {

  //
  // Propagate local changes to remote tabs/windows via storage event:
  //
  globalEvents("txcommitted", (changedParts) => {
    try {
      if (!propagatingLocally) {
        localStorage.setItem(
          "dexie-txcommitted",
          JSON.stringify({
            trig: Math.random(),
            changedParts,
          })
        );
      }
    } catch {}
  });

  //
  // Propagate remote changes locally via storage event:
  //
  addEventListener("storage", (ev: StorageEvent) => {
    if (ev.key === "dexie-txcommitted") {
      const data = JSON.parse(ev.newValue);
      if (data) propagateLocally(data.changedParts);
    }
  });
}

