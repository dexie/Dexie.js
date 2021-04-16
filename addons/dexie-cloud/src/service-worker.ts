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
    await syncIfPossible(db);
  } catch (e) {
    console.error(`Dexie Cloud SW Error`, e);
    // Error occured. Stop managing this DB until we wake up again by a sync event,
    // which will open a new Dexie and start trying to sync it.
    stopManagingDB();
  }
}

self.addEventListener("sync", (event: SyncEvent) => {
  const dbName = getDbNameFromTag(event.tag);
  if (dbName) {
    event.waitUntil(syncDB(dbName));
  }
});

self.addEventListener("periodicsync", (event: SyncEvent) => {
  const dbName = getDbNameFromTag(event.tag);
  if (dbName) {
    event.waitUntil(syncDB(dbName));
  }
});

/*


const subscription = observable.subscribe(async dbs => {
  // Open connection (which will start syncWorker for each db)
  for (const dbName of dbs) {
    const db = new Dexie(dbName, {addons: [dexieCloud]});
    const stopManagingDB = async () => {
      db.on('versionchange').unsubscribe(onVersionChange);
      managedDBs.delete(dbName);
      await dexieCloudGlobalDB.swManagedDBs.delete(dbName);
    }
    const onVersionChange = (event: IDBVersionChangeEvent) => {
      if (event.newVersion) {
        // Upgrade - reopen our connection
        db.close();
        db.open().catch(stopManagingDB);
      } else {
        // Deleted - close our connection and delete name from DexieCloud global DB.
        stopManagingDB();
      }
      return false;
    };
    if (!managedDBs.has(dbName)) {
      managedDBs.set(dbName, DexieCloudDB(db));
      db.on('versionchange', onVersionChange);
      await db.open().catch(stopManagingDB);
    }
  }
  // Close connection for those DBs that should not be managed by SW anymore:
  for (const dbName of [].slice.call(managedDBs.keys())) { // not yet using downlevel iterators (TS)
    if (!dbs.includes(dbName)) {
      managedDBs.get(dbName)!.close();
      managedDBs.delete(dbName);
    }
  }
});

*/
