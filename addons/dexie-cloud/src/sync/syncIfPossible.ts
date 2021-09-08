import { IS_SERVICE_WORKER } from '../helpers/IS_SERVICE_WORKER';
import { performGuardedJob } from './performGuardedJob';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { sync, CURRENT_SYNC_WORKER, SyncOptions } from './sync';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DexieCloudSchema } from 'dexie-cloud-common';

const ongoingSyncs = new WeakMap<
  DexieCloudDB,
  { promise: Promise<void>; pull: boolean }
>();

export function syncIfPossible(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema,
  options?: SyncOptions
) {
  let ongoing = ongoingSyncs.get(db);
  if (ongoing) {
    if (ongoing.pull || options?.purpose === 'push') {
      console.debug('syncIfPossible(): returning the ongoing sync promise.');
      return ongoing.promise;
    } else {
      return ongoing.promise.then(() =>
        syncIfPossible(db, cloudOptions, cloudSchema, options)
      );
    }
  }
  const promise = _syncIfPossible();
  ongoingSyncs.set(db, { promise, pull: options?.purpose !== 'push' });
  return promise;

  async function _syncIfPossible() {
    try {
      if (db.cloud.usingServiceWorker) {
        if (IS_SERVICE_WORKER) {
          await sync(db, cloudOptions, cloudSchema, options);
        }
      } else {
        // We use a flow that is better suited for the case when multiple workers want to
        // do the same thing.
        await performGuardedJob(db, CURRENT_SYNC_WORKER, '$jobs', () =>
          sync(db, cloudOptions, cloudSchema, options)
        );
      }
      ongoingSyncs.delete(db);
      console.debug('Done sync');
    } catch (error) {
      ongoingSyncs.delete(db);
      console.error(`Failed to sync client changes`, error);
      throw error; // Make sure we rethrow error so that sync event is retried.
      // I don't think we should setTimout or so here.
      // Unless server tells us to in some response.
      // Then we could follow that advice but not by waiting here but by registering
      // Something that triggers an event listened to in startPushWorker()
    }
  }
}
