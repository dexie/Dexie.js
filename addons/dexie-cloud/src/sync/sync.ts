import { getMutationTable } from "../helpers/getMutationTable";
import { getSyncableTables } from "../helpers/getSyncableTables";
import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { listSyncifiedChanges } from "./listSyncifiedChanges";
import { getTablesToSyncify } from "./getTablesToSyncify";
import { listClientChanges } from "./listClientChanges";
import { syncWithServer } from "./syncWithServer";
import Dexie from "dexie";
import { modifyLocalObjectsWithNewUserId } from "./modifyLocalObjectsWithNewUserId";
import { DBKeyMutationSet } from "../types/move-to-dexie-cloud-common/change-processing/DBKeyMutationSet";
import { applyOperations } from "../types/move-to-dexie-cloud-common/change-processing/applyOperations";
import { subtractChanges } from "../types/move-to-dexie-cloud-common/change-processing/subtractChanges";
import { toDBOperationSet } from "../types/move-to-dexie-cloud-common/change-processing/toDBOperationSet";
import { bulkUpdate } from "../helpers/bulkUpdate";

export const isSyncing = new WeakSet<DexieCloudDB>();
export const CURRENT_SYNC_WORKER = "currentSyncWorker";

/*
  TODO:
    1. V: Rätta flödet och gör det persistent mellan transaktioner
    2. Sync-requestet ska autenticera sig med nuvarande användare.
       MEN:
        Vissa medskickade operationer kan vara gjorda av annan användare.
        Därför: Om några av client-changes är andra användare, så måste de användarnas
        tokens följa med som extra parameter till fetch-requestet.
        Servern skall då validera och genomföra dessa operationer baserat på alternativt token.
        Kanske kan vi skita i det flödet just nu och hindra att det uppstår istället.
        Hur? Jo, genom:
          1. Användare är ANONYMOUS
          2. Data laddas ned.
          3. Data modifieras.
          4. Användare loggar in.
          5. Sync: Några inledande requests är ANONYMOUS men autenticeras som användaren.

    X: Se till att vi förhandlar initialt sync state eller uppdaterat sync state (tabell aliases etc)

    Y: Använd Bison hjälpare för streamad BISON?

*/

export async function sync(
  db: DexieCloudDB,
  { isInitialSync } = { isInitialSync: false }
) {
  if (!db.cloud.options?.databaseUrl)
    throw new Error(
      `Internal error: sync must not be called when no databaseUrl is configured`
    );
  const { options, schema } = db.cloud;
  const { databaseUrl } = options;
  const currentUser = db.cloud.currentUser.value; // Keep same value across entire sync flow:
  const mutationTables = currentUser.isLoggedIn
    ? getSyncableTables(db).map((tbl) => db.table(getMutationTable(tbl.name)))
    : [];

  // If this is not the initial sync,
  // go through tables that were previously not synced but should now be according to
  // logged in state and the sync table whitelist in db.cloud.options.
  //
  // Prepare for syncification by modifying locally unauthorized objects:
  //
  const persistedSyncState = await db.getPersistedSyncState();
  const tablesToSyncify =
    !isInitialSync && currentUser.isLoggedIn
      ? getTablesToSyncify(db, persistedSyncState)
      : [];
  const doSyncify = tablesToSyncify.length > 0;

  if (doSyncify) {
    await db.transaction("rw", tablesToSyncify, async (tx) => {
      tx["disableChangeTracking"] = true;
      tx["disableAccessControl"] = true; // TODO: Take care of this flag in access control middleware!
      await modifyLocalObjectsWithNewUserId(tablesToSyncify, currentUser);
    });
  }
  //
  // List changes to sync
  //
  const [clientChangeSet, syncState] = await db.transaction(
    "r",
    db.tables,
    async () => {
      const syncState = await db.getPersistedSyncState();
      let clientChanges = await listClientChanges(mutationTables, db);
      if (doSyncify) {
        const syncificationInserts = await listSyncifiedChanges(
          tablesToSyncify,
          currentUser
        );
        clientChanges = clientChanges.concat(syncificationInserts);
        return [clientChanges, syncState];
      }
      return [clientChanges, syncState];
    }
  );

  let latestRevisions = getLatestRevisionsPerTable(clientChangeSet);

  //
  // Push changes to server
  //
  const res = await syncWithServer(
    clientChangeSet,
    syncState,
    db,
    databaseUrl,
    schema
  );

  //
  // Apply changes locally and clear old change entries:
  //
  await db.transaction("rw", db.tables, async (tx) => {
    tx["disableChangeTracking"] = true;
    tx["disableAccessControl"] = true; // TODO: Take care of this flag in access control middleware!

    // List mutations that happened during our exchange with the server:
    const addedClientChanges = await listClientChanges(mutationTables, db, { since: latestRevisions });

    //
    // Delete changes now as server has return success
    // (but keep changes that haven't reached server yet)
    //
    for (const table of mutationTables) {
      if (!addedClientChanges.some(ch => ch.table === table.name && ch.muts.length > 0)) {
        // No added mutations for this table during the time we sent changes
        // to the server.
        // It is therefore safe to clear all changes (which is faster than
        // deleting a range)
        await table.clear();
      } else if (latestRevisions[table.name]) {
        await table
          .where("rev")
          .belowOrEqual(latestRevisions[table.name])
          .delete();
      } else {
        // In this case, the mutation table only contains added items after sending empty changeset to server.
        // We should not clear out anything now.
      }
      // Update latestRevisions object according to additional changes:
      getLatestRevisionsPerTable(addedClientChanges, latestRevisions);
    }

    //
    // Update syncState
    //
    const syncState = await db.getPersistedSyncState();
    const newSyncState = syncState || {
      syncedTables: [],
      initiallySynced: true,
    };
    if (doSyncify) {
      newSyncState.syncedTables = getSyncableTables(db).map((tbl) => tbl.name);
    }
    newSyncState.initiallySynced = true;
    newSyncState.realms = res.realms;
    newSyncState.remoteDbId = res.dbId;
    newSyncState.serverRevision = res.serverRevision;

    const baseRevisions = syncState?.baseRevisions ?? {};
    for (const table of getSyncableTables(db)) {
      const revEntry = baseRevisions[table.name];
      const clientRev = latestRevisions[table.name] || 0;
      if (revEntry) {
        revEntry.clientRev = clientRev;
        revEntry.prevServerRev = revEntry.newServerRev;
        revEntry.newServerRev = res.serverRevision;
      } else {
        baseRevisions[table.name] = {
          prevServerRev: null,
          clientRev,
          newServerRev: res.serverRevision,
        };
      }
    }

    const filteredChanges = filterServerChangesThroughAddedClientChanges(res.changes, addedClientChanges);

    //
    // apply server changes
    //
    await applyServerChanges(filteredChanges, db);

    //
    // Update syncState
    //
    db.$syncState.put(newSyncState, "syncState");
  });
}

function getLatestRevisionsPerTable(
  clientChangeSet: DBOperationsSet,
  lastRevisions = {} as { [table: string]: number }
) {
  for (const { table, muts } of clientChangeSet) {
    const lastRev = muts.length > 0 ? muts[muts.length - 1].rev! : 0;
    lastRevisions[table] = lastRev;
  }
  return lastRevisions;
}

export async function applyServerChanges(
  changes: DBOperationsSet,
  db: DexieCloudDB
) {
  for (const {table: tableName, muts} of changes) {
    const table = db.table(tableName);
    for (const mut of muts) {
      switch (mut.type) {
        case "insert":
          await table.bulkAdd(mut.values, mut.keys);
          break;
        case "upsert":
          await table.bulkPut(mut.values, mut.keys);
          break;
        case "modify":
          if (mut.keys.length === 1) {
            // Would've been nice with a bulkUpdate method...
            await table.update(mut.keys[0], mut.changeSpec);
          } else {
            await table.where(":id").anyOf(mut.keys).modify(mut.changeSpec);
          }
          break;
        case "update":
          await bulkUpdate(table, mut.keys, mut.changeSpecs);
          break;
        case "delete":
          await table.bulkDelete(mut.keys);
          break;
      }
    }
  }
}

//export function 

function filterServerChangesThroughAddedClientChanges(serverChanges: DBOperationsSet, addedClientChanges: DBOperationsSet): DBOperationsSet {
  const changes: DBKeyMutationSet = {};
  applyOperations(changes, serverChanges);
  const localPostChanges: DBKeyMutationSet = {};
  applyOperations(localPostChanges, addedClientChanges);
  subtractChanges(changes, localPostChanges);
  return toDBOperationSet(changes);
}
