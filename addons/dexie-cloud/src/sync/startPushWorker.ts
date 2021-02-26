import Dexie from "dexie";
import { filter, map } from 'rxjs/operators';
import { IS_SERVICE_WORKER } from '../helpers/IS_SERVICE_WORKER';
import { getNumUnsyncedMutationsObservable, numUnsyncedMutations } from "./numUnsyncedMutations";
import { syncIfNeeded } from "./sync";

export async function startPushWorker(db: Dexie) {
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
  needSyncChanged.subscribe(()=>syncIfNeeded(db));
  if (typeof self !== "undefined") {
    self.addEventListener("online", ev => {
      // Trigger a sync when system comes online
      syncIfNeeded(db);
    });
    self.addEventListener('periodicsync', event => {
      // @ts-ignore
      if (event.tag == 'sync-push') {
        // @ts-ignore
        event.waitUntil(syncIfNeeded(db));
      }
    });
  }
}
