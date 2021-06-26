import { DexieCloudDB } from "../db/DexieCloudDB";
import { registerSyncEvent } from "./registerSyncEvent";

export function triggerSync(db: DexieCloudDB) {
  if (db.cloud.usingServiceWorker) {
    registerSyncEvent(db);
  } else {
    db.localSyncEvent.next({});
  }
}