import { IS_SERVICE_WORKER } from '../helpers/IS_SERVICE_WORKER';
import { performGuardedJob } from './performGuardedJob';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { sync, CURRENT_SYNC_WORKER, SyncOptions } from './sync';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { assert, DexieCloudSchema } from 'dexie-cloud-common';
import { checkSyncRateLimitDelay } from './ratelimit';

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
  const ongoing = ongoingSyncs.get(db);
  if (ongoing) {
    if (ongoing.pull || options?.purpose === 'push') {
      console.debug('syncIfPossible(): returning the ongoing sync promise.');
      return ongoing.promise;
    } else {
      // Ongoing sync may never do anything in case there are no outstanding changes
      // to sync (because its purpose was "push" not "pull")
      // Now, however, we are asked to do a sync with the purpose of "pull"
      // We want to optimize here. We must wait for the ongoing to complete
      // and then, if the ongoing sync never resulted in a sync request,
      // we must redo the sync.

      // To inspect what is happening in the ongoing request, let's subscribe
      // to db.cloud.syncState and look for if it is doing any "pulling" phase:
      let hasPullTakenPlace = false;
      const subscription = db.cloud.syncState.subscribe((syncState) => {
        if (syncState.phase === 'pulling') {
          hasPullTakenPlace = true;
        }
      });
      // Ok, so now we are watching. At the same time, wait for the ongoing to complete
      // and when it has completed, check if we're all set or if we need to redo
      // the call:
      return (
        ongoing.promise
          // This is a finally block but we are still running tests on
          // browsers that don't support it, so need to do it like this:
          .then(() => {
            subscription.unsubscribe();
          })
          .catch((error) => {
            subscription.unsubscribe();
            return Promise.reject(error);
          })
          .then(() => {
            if (!hasPullTakenPlace) {
              // No pull took place in the ongoing sync but the caller had "pull" as
              // an explicit purpose of this call - so we need to redo the call!
              return syncIfPossible(db, cloudOptions, cloudSchema, options);
            }
          })
      );
    }
  }

  const promise = _syncIfPossible();
  ongoingSyncs.set(db, { promise, pull: options?.purpose !== 'push' });
  return promise;

  async function _syncIfPossible() {
    try {
      // Check if should delay sync due to ratelimit:
      await checkSyncRateLimitDelay(db);      
      await performGuardedJob(db, CURRENT_SYNC_WORKER, () =>
        sync(db, cloudOptions, cloudSchema, options)
      );
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
