import { DexieCloudDB } from "../db/DexieCloudDB";
import { registerSyncEvent } from "./registerSyncEvent";

export function triggerSync(db: DexieCloudDB) {
  if (db.cloud.options?.usingServiceWorker) {
    registerSyncEvent(db);
  } else {
    db.localSyncEvent.next({});
  }
}