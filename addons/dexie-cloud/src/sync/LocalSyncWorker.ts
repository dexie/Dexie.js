import { Subscription } from 'rxjs';
import { syncIfPossible } from './syncIfPossible';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { MINUTES } from '../helpers/date-constants';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DexieCloudSchema } from 'dexie-cloud-common';

export function LocalSyncWorker(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema
) {
  let syncNeededSubscription: Subscription | null = null;
  let onlineHandler: ((event: Event) => void) | null = null;
  let visibilityHandler: ((event: Event) => void) | null = null;
  //let syncHandler: ((event: Event) => void) | null = null;
  //let periodicSyncHandler: ((event: Event) => void) | null = null;
  let cancelToken = { cancelled: false };

  function syncAndRetry(retryNum = 1) {
    syncIfPossible(db, cloudOptions, cloudSchema, { cancelToken }).catch(
      (e) => {
        if (cancelToken.cancelled) {
          stop();
        } else if (retryNum < 3) {
          // Mimic service worker sync event: retry 3 times
          // * first retry after 5 minutes
          // * second retry 15 minutes later
          setTimeout(
            () => syncAndRetry(retryNum + 1),
            [0, 5, 15][retryNum] * MINUTES
          );
        }
      }
    );
  }

  const start = () => {
    // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
    // This initial subscribe will also trigger an sync also now.
    console.error("Starting LocalSyncWorker", db.localSyncEvent["id"])
    syncNeededSubscription = db.localSyncEvent.subscribe(() => {
      try {syncAndRetry();} catch(err) {console.error("Whathe f....")}
    });
    //setTimeout(()=>db.localSyncEvent.next({}), 5000);

    onlineHandler = () => {
      // Trigger a sync when system comes online
      syncAndRetry();
    };

    visibilityHandler = () => {
      // Trigger a sync when tab becomes visible
      if (document.visibilityState === 'visible') {
        //syncAndRetry();
      }
    };

    // If browser or worker:
    if (typeof self !== 'undefined') {
      // Sync whenever client goes online:
      self.addEventListener('online', onlineHandler);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  };

  const stop = () => {
    console.error("Stopping LocalSyncWorker")
    cancelToken.cancelled = true;
    if (typeof self !== 'undefined') {
      if (onlineHandler) {
        self.removeEventListener('online', onlineHandler);
      }
    }
    if (typeof document !== 'undefined') {
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler!);
      }
    }
    if (syncNeededSubscription) syncNeededSubscription.unsubscribe();
  };

  return {
    start,
    stop
  };
}
