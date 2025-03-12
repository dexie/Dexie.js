import { Subscription } from 'rxjs';
import { syncIfPossible } from './syncIfPossible';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { SECONDS } from '../helpers/date-constants';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { DexieCloudSchema } from 'dexie-cloud-common';

export function LocalSyncWorker(
  db: DexieCloudDB,
  cloudOptions: DexieCloudOptions,
  cloudSchema: DexieCloudSchema
) {
  let localSyncEventSubscription: Subscription | null = null;
  let cancelToken = { cancelled: false };
  let nextRetryTime = 0;
  let syncStartTime = 0;

  function syncAndRetry(retryNum = 1) {
    // Use setTimeout() to get onto a clean stack and
    // break free from possible active transaction:
    setTimeout(() => {
      const purpose = pullSignalled ? 'pull' : 'push';
      syncStartTime = Date.now();
      syncIfPossible(db, cloudOptions, cloudSchema, {
        cancelToken,
        retryImmediatelyOnFetchError: true, // workaround for "net::ERR_NETWORK_CHANGED" in chrome.
        purpose,
      }).then(()=>{
        if (cancelToken.cancelled) {
          stop();
        } else {
          if (pullSignalled || pushSignalled) {
            // If we have signalled for more sync, do it now.
            pullSignalled = false;
            pushSignalled = false;
            return syncAndRetry();
          }
        }
        ongoingSync = false;
        nextRetryTime = 0;
        syncStartTime = 0;
      }).catch((error: unknown) => {
        console.error('error in syncIfPossible()', error);
        if (cancelToken.cancelled) {
          stop();
          ongoingSync = false;
          nextRetryTime = 0;
          syncStartTime = 0;
        } else if (retryNum < 5) {
          // Mimic service worker sync event but a bit more eager: retry 4 times
          // * first retry after 20 seconds
          // * second retry 40 seconds later
          // * third retry 5 minutes later
          // * last retry 15 minutes later
          const retryIn = [0, 20, 40, 300, 900][retryNum] * SECONDS
          nextRetryTime = Date.now() + retryIn;
          syncStartTime = 0;
          setTimeout(
            () => syncAndRetry(retryNum + 1),
            retryIn
          );
        } else {
          ongoingSync = false;
          nextRetryTime = 0;
          syncStartTime = 0;
        }
      });
    }, 0);
  }

  let pullSignalled = false;
  let pushSignalled = false;
  let ongoingSync = false;
  const consumer = (purpose: 'pull' | 'push') =>{
    if (cancelToken.cancelled) return;
    if (purpose === 'pull') {
      pullSignalled = true;
    }
    if (purpose === 'push') {
      pushSignalled = true;
    }
    if (ongoingSync) {
      if (nextRetryTime) {
        console.debug(`Sync is paused until ${new Date(nextRetryTime).toISOString()} due to error in last sync attempt`);
      } else if (syncStartTime > 0 && Date.now() - syncStartTime > 20 * SECONDS) {
        console.debug(`An existing sync operation is taking more than 20 seconds. Will resync when done.`)
      }
      return;
    }
    ongoingSync = true;
    syncAndRetry();
  };

  const start = () => {
    // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
    // This initial subscribe will also trigger an sync also now.
    console.debug('Starting LocalSyncWorker', db.localSyncEvent['id']);
    localSyncEventSubscription = db.localSyncEvent.subscribe(({ purpose }) => {
      consumer(purpose || 'pull');
    });
  };

  const stop = () => {
    console.debug('Stopping LocalSyncWorker');
    cancelToken.cancelled = true;
    if (localSyncEventSubscription) localSyncEventSubscription.unsubscribe();
  };

  return {
    start,
    stop,
  };
}
