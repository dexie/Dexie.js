import Dexie from 'dexie';
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
  let localSyncEventSubscription: Subscription | null = null;
  //let syncHandler: ((event: Event) => void) | null = null;
  //let periodicSyncHandler: ((event: Event) => void) | null = null;
  let cancelToken = { cancelled: false };

  let retryHandle: any = null;
  let retryPurpose: 'pull' | 'push' | null = null; // "pull" is superset of "push"

  function syncAndRetry(purpose: 'pull' | 'push', retryNum = 1) {
    // Use setTimeout() to get onto a clean stack and
    // break free from possible active transaction:
    setTimeout(() => {
      if (retryHandle) clearTimeout(retryHandle);
      const combPurpose = retryPurpose === 'pull' ? 'pull' : purpose;
      retryHandle = null;
      retryPurpose = null;
      syncIfPossible(db, cloudOptions, cloudSchema, {
        cancelToken,
        retryImmediatelyOnFetchError: true, // workaround for "net::ERR_NETWORK_CHANGED" in chrome.
        purpose: combPurpose,
      }).catch((e) => {
        console.error('error in syncIfPossible()', e);
        if (cancelToken.cancelled) {
          stop();
        } else if (retryNum < 3) {

          // Mimic service worker sync event: retry 3 times
          // * first retry after 5 minutes
          // * second retry 15 minutes later
          const combinedPurpose = retryPurpose && retryPurpose === 'pull' ? 'pull' : purpose;

          const handle = setTimeout(
            () => syncAndRetry(combinedPurpose, retryNum + 1),
            [0, 5, 15][retryNum] * MINUTES
          );

          // Cancel the previous retryHandle if it exists to avoid scheduling loads of retries.
          if (retryHandle) clearTimeout(retryHandle);
          retryHandle = handle;
          retryPurpose = combinedPurpose;
        }
      });
    }, 0);
  }

  const start = () => {
    // Sync eagerly whenever a change has happened (+ initially when there's no syncState yet)
    // This initial subscribe will also trigger an sync also now.
    console.debug('Starting LocalSyncWorker', db.localSyncEvent['id']);
    localSyncEventSubscription = db.localSyncEvent.subscribe(({ purpose }) => {
      try {
        syncAndRetry(purpose || 'pull');
      } catch (err) {
        console.error('What-the....', err);
      }
    });
    //setTimeout(()=>db.localSyncEvent.next({}), 5000);
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
