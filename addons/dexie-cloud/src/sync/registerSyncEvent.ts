import Dexie from "dexie";
import { DexieCloudDB } from "../db/DexieCloudDB";

const hasSW = "serviceWorker" in navigator;
let hasComplainedAboutSyncEvent = false;

export async function registerSyncEvent(db: DexieCloudDB) {
  if (hasSW && db.cloud.options?.usingServiceWorker) {
    try {
      // Send sync event to SW:
      const { sync } = await navigator.serviceWorker.ready;
      await sync.register(`dexie-cloud:${db.name}`);
      return;
    } catch (e) {
      if (!hasComplainedAboutSyncEvent) {
        console.debug(`Could not register sync event`, );
        hasComplainedAboutSyncEvent = true;
      }
    }
  }
}

export async function registerPeriodicSyncEvent(db: DexieCloudDB) {
  if (db.cloud.options?.usingServiceWorker) {
    if (!hasSW) {
      console.debug(`ServiceWorker not supported.`);
      return;
    }
    try {
      // Register periodicSync event to SW:
      // @ts-ignore
      const { periodicSync } = await navigator.serviceWorker.ready;
      if (periodicSync) {
        await periodicSync.register(`dexie-cloud:${db.name}`,
          db.cloud.options.periodicSync
        );
        console.debug(`Successfully registered periodicsync event for ${db.name}`);
      } else {
        console.debug(`periodicSync not supported.`);
      }
    } catch (e) {
      console.debug(`Could not register periodicSync for ${db.name}`, e);
    }
  }
}