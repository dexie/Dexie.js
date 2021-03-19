import Dexie, { liveQuery } from "dexie";
import { combineLatest } from "rxjs";
import { filter, map } from "rxjs/operators";
import { IS_SERVICE_WORKER } from "../helpers/IS_SERVICE_WORKER";
import { SyncState } from "../types/SyncState";
import { getNumUnsyncedMutationsObservable } from "./numUnsyncedMutations";
import { syncIfNeeded } from "./syncIfNeeded";

export async function startSyncWorker(db: Dexie) {
  if (db.cloud.options.serviceWorker && !IS_SERVICE_WORKER) {
    return; // Don't do this if we're not a service worker and dexie cloud is configured for that.
  }
  const numUnsyncedMuts = getNumUnsyncedMutationsObservable(db);
  const syncStateObservable = liveQuery(
    () =>
      db.table("$syncState").get("syncState") as Promise<SyncState | undefined>
  );
  const syncNeeded = combineLatest([
    syncStateObservable,
    numUnsyncedMuts,
  ]).pipe(
    map(([syncState, num]) => !syncState || num > 0), // true if there are unsynced changes or if initial sync not performed.
    filter(syncNeeded => syncNeeded)
  );

  // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
  syncNeeded.subscribe(() => syncIfNeeded(db));

  // If browser or worker:
  if (typeof self !== "undefined") {
    // Sync whenever client goes online:
    self.addEventListener("online", (ev) => {
      // Trigger a sync when system comes online
      syncIfNeeded(db);
    });

    // Sync whenever service worker gets a periodicsync event:
    self.addEventListener("periodicsync", (event) => {
      // @ts-ignore
      if (event.tag == "sync-push") {
        // @ts-ignore
        event.waitUntil(syncIfNeeded(db));
      }
    });
  }
}
