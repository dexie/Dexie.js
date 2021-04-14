import Dexie, { liveQuery } from "dexie";
import { combineLatest } from "rxjs";
import { filter, map } from "rxjs/operators";
import { IS_SERVICE_WORKER } from "../helpers/IS_SERVICE_WORKER";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
import { getNumUnsyncedMutationsObservable } from "./numUnsyncedMutations";
import { syncIfNeeded } from "./syncIfNeeded";
import { DexieCloudDB } from "../db/DexieCloudDB";

export async function startSyncWorker(db: DexieCloudDB) {
  if (db.cloud.options?.usingServiceWorker && !IS_SERVICE_WORKER) {
    return {stop: ()=>{}}; // Don't do this if we're not a service worker and dexie cloud is configured for that.
  }
  // Start by checking if sync is needed
  await syncIfNeeded(db);
  const numUnsyncedMuts = getNumUnsyncedMutationsObservable(db);
  const syncNeeded = numUnsyncedMuts.pipe(
    map((num) => num > 0), // true if there are unsynced changes
    filter((syncNeeded) => syncNeeded)
  );
  // NOTE: We don't need to set syncNeeded for inital sync - the sync worker must not be started
  // before there has been an initial sync.

  // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
  const syncNeededSubscription = syncNeeded.subscribe(() => syncIfNeeded(db));
  const onlineHandler = () => {
    // Trigger a sync when system comes online
    syncIfNeeded(db);
  };
  const periodicSyncHandler = (event: Event) => {
    // @ts-ignore
    if (event.tag == "sync-push") {
      // @ts-ignore
      event.waitUntil(syncIfNeeded(db));
    }
  };

  // If browser or worker:
  if (typeof self !== "undefined") {
    // Sync whenever client goes online:
    self.addEventListener("online", onlineHandler);

    // Sync whenever service worker gets a periodicsync event:
    self.addEventListener("periodicsync", periodicSyncHandler);
  }

  return {
    stop() {
      if (typeof self !== "undefined") {
        self.removeEventListener("online", onlineHandler);
        self.removeEventListener("periodicsync", periodicSyncHandler);
      }
      syncNeededSubscription.unsubscribe();
    }
  }
}
