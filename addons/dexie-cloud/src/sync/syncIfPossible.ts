import { IS_SERVICE_WORKER } from "../helpers/IS_SERVICE_WORKER";
import { performGuardedJob } from "./performGuardedJob";
import { DexieCloudDB } from '../db/DexieCloudDB';
import { isSyncing, sync, CURRENT_SYNC_WORKER, SyncOptions } from "./sync";

export async function syncIfPossible(db: DexieCloudDB, options?: SyncOptions) {
  if (isSyncing.has(db))
    return; // Still working.
  if (typeof navigator !== "undefined" && !navigator.onLine)
    return; // We're not online
  if (typeof document !== "undefined" && document.visibilityState !== "visible")
    return; // We're a window but not visible

  isSyncing.add(db);
  try {
    if (db.cloud.options?.usingServiceWorker) {
      if (IS_SERVICE_WORKER) {
        await sync(db, options);
      }
    } else {
      // We use a flow that is better suited for the case when multiple workers want to
      // do the same thing.
      await performGuardedJob(db, CURRENT_SYNC_WORKER, "$jobs", () => sync(db));
    }
    isSyncing.delete(db);
    await syncIfPossible(db, options);
  } catch (error) {
    isSyncing.delete(db);
    console.error(`Failed to sync client changes`, error);
    // I don't think we should setTimout or so here.
    // Unless server tells us to in some response.
    // Then we could follow that advice but not by waiting here but by registering
    // Something that triggers an event listened to in startPushWorker()
  }
}
