import Dexie from "dexie";
import { filter, map } from 'rxjs/operators';
import { IS_SERVICE_WORKER } from '../helpers/IS_SERVICE_WORKER';
import { getNumUnsyncedMutationsObservable, numUnsyncedMutations } from "./numUnsyncedMutations";
import { syncIfNeeded } from "./sync";

export async function startSyncWorker(db: Dexie) {
  if (db.cloud.options.serviceWorker && !IS_SERVICE_WORKER) {
    return; // Don't do this if we're not a service worker and dexie cloud is configured for that.
  }
  let needSync = false;
  const numUnsyncedMuts = getNumUnsyncedMutationsObservable(db);
  const needSyncChanged = numUnsyncedMuts.pipe(
    map(num => num > 0),
    filter(newNeedSync => newNeedSync !== needSync),
    map(newNeedSync => (needSync = newNeedSync))
  );

  // Sync eagerly whenever a change has happened:
  needSyncChanged.subscribe(()=>syncIfNeeded(db));

  // If browser or worker:
  if (typeof self !== "undefined") {
    // Sync whenever client goes online:
    self.addEventListener("online", ev => {
      // Trigger a sync when system comes online
      syncIfNeeded(db);
    });

    // Sync whenever service worker gets a periodicsync event:
    self.addEventListener('periodicsync', event => {
      // @ts-ignore
      if (event.tag == 'sync-push') {
        // @ts-ignore
        event.waitUntil(syncIfNeeded(db));
      }
    });
  }
}
