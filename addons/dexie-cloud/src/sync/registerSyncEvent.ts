import Dexie from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';

//const hasSW = 'serviceWorker' in navigator;
let hasComplainedAboutSyncEvent = false;

export async function registerSyncEvent(db: DexieCloudDB) {
  try {
    // Send sync event to SW:
    const sw = await navigator.serviceWorker.ready;
    if (sw.sync) {
      await sw.sync.register(`dexie-cloud:${db.name}`);
    } else if (sw.active) {
      // Fallback to postMessage (Firefox, Safari):
      sw.active.postMessage({
        type: 'dexie-cloud-sync',
        dbName: db.name
      });
    } else {
      console.error(`Dexie Cloud: There's no active service worker. Can this ever happen??`);
    }
    return;
  } catch (e) {
    if (!hasComplainedAboutSyncEvent) {
      console.debug(`Dexie Cloud: Could not register sync event`, e);
      hasComplainedAboutSyncEvent = true;
    }
  }
}

export async function registerPeriodicSyncEvent(db: DexieCloudDB) {
  try {
    // Register periodicSync event to SW:
    // @ts-ignore
    const { periodicSync } = await navigator.serviceWorker.ready;
    if (periodicSync) {
      try {
        await periodicSync.register(
          `dexie-cloud:${db.name}`,
          db.cloud.options?.periodicSync
        );
        console.debug(
          `Dexie Cloud: Successfully registered periodicsync event for ${db.name}`
        );
      } catch (e) {
        console.debug(`Dexie Cloud: Failed to register periodic sync. Your PWA must be installed to allow background sync.`, e);
      }
    } else {
      console.debug(`Dexie Cloud: periodicSync not supported.`);
    }
  } catch (e) {
    console.debug(
      `Dexie Cloud: Could not register periodicSync for ${db.name}`,
      e
    );
  }
}
