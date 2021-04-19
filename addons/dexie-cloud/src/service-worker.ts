import Dexie from 'dexie';
import { DexieCloudDB } from './db/DexieCloudDB';
import dexieCloud from './dexie-cloud-client';
import { syncIfPossible } from './sync/syncIfPossible';
import { SWMessageEvent } from './types/SWMessageEvent';
import { SyncEvent } from './types/SWSyncEvent';

// In case the SW lives for a while, let it reuse already opened connections:
const managedDBs = new Map<string, DexieCloudDB>();

function getDbNameFromTag(tag: string) {
  return tag.startsWith('dexie-cloud:') && tag.split(':')[1];
}

async function syncDB(dbName: string) {
  let db = managedDBs.get(dbName);

  if (!db) {
    console.debug('Dexie Cloud SW: Creating new Dexie instance for', dbName);
    const dexie = new Dexie(dbName, { addons: [dexieCloud] });
    db = DexieCloudDB(dexie);
    dexie.on('versionchange', stopManagingDB);
    managedDBs.set(dbName, db);
  }

  function stopManagingDB() {
    db!.dx.on.versionchange.unsubscribe(stopManagingDB);
    managedDBs.delete(db!.name);
    db!.dx.close();
    return false;
  }

  try {
    console.debug('Dexie Cloud SW: Syncing');
    await syncIfPossible(db);
    console.debug('Dexie Cloud SW: Done Syncing');
  } catch (e) {
    console.error(`Dexie Cloud SW Error`, e);
    // Error occured. Stop managing this DB until we wake up again by a sync event,
    // which will open a new Dexie and start trying to sync it.
    stopManagingDB();
    if (e.name !== Dexie.errnames.NoSuchDatabase) {
      // Unless the error was that DB doesn't exist, rethrow to trigger sync retry.
      throw e; // Throw e to make syncEvent.waitUntil() receive a rejected promis, so it will retry.
    }
  }
}

self.addEventListener('sync', (event: SyncEvent) => {
  console.debug('SW "sync" Event', event.tag);
  const dbName = getDbNameFromTag(event.tag);
  if (dbName) {
    event.waitUntil(syncDB(dbName));
  }
});

self.addEventListener('periodicsync', (event: SyncEvent) => {
  console.debug('SW "periodicsync" Event', event.tag);
  const dbName = getDbNameFromTag(event.tag);
  if (dbName) {
    event.waitUntil(syncDB(dbName));
  }
});

self.addEventListener('message', (event: SWMessageEvent) => {
  console.debug('SW "message" Event', event.data);
  if (event.data.type === 'dexie-cloud-sync') {
    const { dbName } = event.data;
    // Mimic background sync behavior - retry in X minutes on failure.
    // But lesser timeout and more number of times.
    const syncAndRetry = (num = 1) => {
      return syncDB(dbName).catch(async (e) => {
        if (num === 5) throw e;
        await sleep(120_000); // 2 minutes
        syncAndRetry (num + 1);
      });
    };
    if ('waitUntil' in event) {
      event.waitUntil(syncAndRetry());
    } else {
      syncAndRetry();
    }
  }
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
