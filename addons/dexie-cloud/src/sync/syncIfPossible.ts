import { IS_SERVICE_WORKER } from '../helpers/IS_SERVICE_WORKER';
import { performGuardedJob } from './performGuardedJob';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { isSyncing, sync, CURRENT_SYNC_WORKER, SyncOptions } from './sync';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DexieCloudSchema } from '../DexieCloudSchema';

export async function syncIfPossible(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema,
  options?: SyncOptions
) {
  if (isSyncing.has(db)) {
    // Still working. Existing work will make sure to complete its job
    // and after that, check if new mutations have arrived, and if so complete
    // those as well. So if isSyncing.has(db) is true, we can rely that nothing at
    // all will be needed to perform at this time.
    // Exceptions: If onling sync throws an exception, it's caller will take care of
    // the retry procedure - we shouldn't do that also (would be redundant).
    return;
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    // We're not online.
    // If LocalSyncWorker is used, a retry will automatically happen when we become
    // online.
    return;
  }
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible')
    return; // We're a window but not visible

  isSyncing.add(db);
  try {
    if (db.cloud.options?.usingServiceWorker) {
      if (IS_SERVICE_WORKER) {
        await sync(db, cloudOptions, cloudSchema, options);
      }
    } else {
      // We use a flow that is better suited for the case when multiple workers want to
      // do the same thing.
      await performGuardedJob(db, CURRENT_SYNC_WORKER, '$jobs', () => sync(db, cloudOptions, cloudSchema));
    }
    isSyncing.delete(db);
    await syncIfPossible(db, cloudOptions, cloudSchema, options);
  } catch (error) {
    isSyncing.delete(db);
    console.error(`Failed to sync client changes`, error);
    throw error; // Make sure we rethrow error so that sync event is retried.
    // I don't think we should setTimout or so here.
    // Unless server tells us to in some response.
    // Then we could follow that advice but not by waiting here but by registering
    // Something that triggers an event listened to in startPushWorker()
  }
}
