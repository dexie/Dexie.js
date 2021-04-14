import Dexie, { liveQuery } from "dexie";
import { DexieCloudDB } from "./db/DexieCloudDB";
import { dexieCloudGlobalDB } from "./dexieCloudGlobalDB";
import dexieCloud from "./dexie-cloud-client";

const managedDBs = new Map<string, DexieCloudDB>();

const observable = liveQuery(()=>dexieCloudGlobalDB.swManagedDBs.toCollection().primaryKeys());

const subscription = observable.subscribe(async dbs => {
  // Open connection (which will start syncWorker for each db)
  for (const dbName of dbs) {
    const db = new Dexie(dbName, {addons: [dexieCloud]});
    const onVersionChange = async (event: IDBVersionChangeEvent) => {
      if (event.newVersion) {
        // Upgrade - reopen our connection
        db.close();
        await db.open();
      } else {
        // Deleted - close our connection and delete name from DexieCloud global DB.
        db.on.versionchange.unsubscribe(onVersionChange);
        managedDBs.delete(dbName);
        await dexieCloudGlobalDB.swManagedDBs.delete(dbName);
      }
      return false;
    };
    if (!managedDBs.has(dbName)) {
      managedDBs.set(dbName, DexieCloudDB(db));
      db.on('versionchange', onVersionChange);
      await db.open().catch(Dexie.NoSuchDatabaseError, async () => {
        db.on('versionchange').unsubscribe(onVersionChange);
        managedDBs.delete(dbName);
        await dexieCloudGlobalDB.swManagedDBs.delete(dbName);
      });
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

