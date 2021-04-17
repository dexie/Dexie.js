import Dexie from "dexie";
import { DexieCloudDB } from "./db/DexieCloudDB";
import dexieCloud from "./dexie-cloud-client";
import { syncIfPossible } from "./sync/syncIfPossible";
import { SyncEvent } from "./types/SWSyncEvent";

// In case the SW lives for a while, let it reuse already opened connections:
const managedDBs = new Map<string, DexieCloudDB>();

function getDbNameFromTag(tag: string) {
  return tag.startsWith("dexie-cloud:") && tag.split(":")[1];
}

async function syncDB(dbName: string) {
  let db = managedDBs.get(dbName);

  if (!db) {
    console.debug('Dexie Cloud SW: Creating new Dexie instance for', dbName);
    const dexie = new Dexie(dbName, { addons: [dexieCloud] });
    db = DexieCloudDB(dexie);
    dexie.on("versionchange", stopManagingDB);
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
  }
}

self.addEventListener("sync", (event: SyncEvent) => {
  console.debug('SW "sync" Event', event.tag);
  const dbName = getDbNameFromTag(event.tag);
  if (dbName) {
    event.waitUntil(syncDB(dbName));
  }
});

self.addEventListener("periodicsync", (event: SyncEvent) => {
  console.debug('SW "periodicsync" Event', event.tag);
  const dbName = getDbNameFromTag(event.tag);
  if (dbName) {
    event.waitUntil(syncDB(dbName));
  }
});
