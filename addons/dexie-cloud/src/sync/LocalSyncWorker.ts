import { Subscription } from "rxjs";
import { syncIfPossible } from "./syncIfPossible";
import { DexieCloudDB } from "../db/DexieCloudDB";

export function LocalSyncWorker(db: DexieCloudDB) {
  let syncNeededSubscription: Subscription | null = null;
  let onlineHandler: ((event: Event) => void) | null = null;
  let visibilityHandler: ((event: Event) => void) | null = null;
  //let syncHandler: ((event: Event) => void) | null = null;
  //let periodicSyncHandler: ((event: Event) => void) | null = null;
  let cancelToken = { cancelled: false };

  const start = () => {
    // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
    // This initial subscribe will also trigger an sync also now.
    syncNeededSubscription = db.localSyncEvent.subscribe(() =>
      syncIfPossible(db, { cancelToken }).catch((e) => {
        if (cancelToken.cancelled) stop();
      })
    );
    onlineHandler = () => {
      // Trigger a sync when system comes online
      syncIfPossible(db, { cancelToken }).catch((e) => {
        if (cancelToken.cancelled) stop();
      });
    };
    visibilityHandler = () => {
      // Trigger a sync when tab becomes visible
      if (document.visibilityState === "visible") {
        syncIfPossible(db, { cancelToken }).catch((e) => {
          if (cancelToken.cancelled) stop();
        });
      }
    };
    /*syncHandler = (event: SyncEvent) => {
      // Trigger a background sync when system comes online and app/site is closed.
      if (event.tag === "dexie-cloud") {
        event.waitUntil(syncIfPossible(db));
      }
    }
    periodicSyncHandler = (event: SyncEvent) => {
      if (event.tag == "dexie-cloud") {
        event.waitUntil(syncIfPossible(db));
      }
    };*/

    // If browser or worker:
    if (typeof self !== "undefined") {
      // Sync whenever client goes online:
      self.addEventListener("online", onlineHandler);

      // Sync whenever service worker gets a periodicsync event:
      //self.addEventListener("periodicsync", periodicSyncHandler);
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", visibilityHandler);
    }
  };

  const stop = () => {
    cancelToken.cancelled = true;
    if (typeof self !== "undefined") {
      if (onlineHandler) {
        self.removeEventListener("online", onlineHandler);
      }
    }
    if (typeof document !== "undefined") {
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler!);
      }
    }
    /*if (periodicSyncHandler)
        self.removeEventListener("periodicsync", periodicSyncHandler);*/
    if (syncNeededSubscription) syncNeededSubscription.unsubscribe();
  };

  return {
    start,
    stop,
  };
}
