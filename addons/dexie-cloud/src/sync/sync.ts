import { getMutationTable } from '../helpers/getMutationTable';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { listSyncifiedChanges } from './listSyncifiedChanges';
import { getTablesToSyncify } from './getTablesToSyncify';
import { listClientChanges } from './listClientChanges';
import { syncWithServer } from './syncWithServer';
import Dexie from 'dexie';
import { modifyLocalObjectsWithNewUserId } from './modifyLocalObjectsWithNewUserId';
import { bulkUpdate } from '../helpers/bulkUpdate';
import { throwIfCancelled } from '../helpers/CancelToken';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { BaseRevisionMapEntry } from '../db/entities/BaseRevisionMapEntry';
import { getTableFromMutationTable } from '../helpers/getTableFromMutationTable';
import { applyOperations, DBKeyMutationSet, DBOperationsSet, DexieCloudSchema, subtractChanges, toDBOperationSet } from 'dexie-cloud-common';

export const isSyncing = new WeakSet<DexieCloudDB>();
export const CURRENT_SYNC_WORKER = 'currentSyncWorker';

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

export interface SyncOptions {
  isInitialSync?: boolean;
  cancelToken?: { cancelled: boolean };
}

export async function sync(
  db: DexieCloudDB,
  options: DexieCloudOptions,
  schema: DexieCloudSchema,
  { isInitialSync, cancelToken }: SyncOptions = { isInitialSync: false }
) {
  if (!db.cloud.options?.databaseUrl)
    throw new Error(
      `Internal error: sync must not be called when no databaseUrl is configured`
    );
  const { databaseUrl } = options;
  const currentUser = await db.getCurrentUser(); // Keep same value across entire sync flow:
  const tablesToSync = currentUser.isLoggedIn ? getSyncableTables(db) : [];

  const mutationTables = tablesToSync.map((tbl) =>
    db.table(getMutationTable(tbl.name))
  );

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
  throwIfCancelled(cancelToken);
  const doSyncify = tablesToSyncify.length > 0;

  if (doSyncify) {
    await db.transaction('rw', tablesToSyncify, async (tx) => {
      tx['disableChangeTracking'] = true;
      tx['disableAccessControl'] = true; // TODO: Take care of this flag in access control middleware!
      await modifyLocalObjectsWithNewUserId(tablesToSyncify, currentUser);
    });
    throwIfCancelled(cancelToken);
  }
  //
  // List changes to sync
  //
  const [clientChangeSet, syncState, baseRevs] = await db.transaction(
    'r',
    db.tables,
    async () => {
      const syncState = await db.getPersistedSyncState();
      const baseRevs = await db.$baseRevs.toArray();
      let clientChanges = await listClientChanges(mutationTables, db);
      throwIfCancelled(cancelToken);
      if (doSyncify) {
        const syncificationInserts = await listSyncifiedChanges(
          tablesToSyncify,
          currentUser,
          schema!
        );
        throwIfCancelled(cancelToken);
        clientChanges = clientChanges.concat(syncificationInserts);
        return [clientChanges, syncState, baseRevs];
      }
      return [clientChanges, syncState, baseRevs];
    }
  );

  const latestRevisions = getLatestRevisionsPerTable(
    clientChangeSet,
    syncState?.latestRevisions
  );

  //
  // Push changes to server
  //
  throwIfCancelled(cancelToken);
  const res = await syncWithServer(
    clientChangeSet,
    syncState,
    baseRevs,
    db,
    databaseUrl,
    schema
  );

  //
  // Apply changes locally and clear old change entries:
  //
  await db.transaction('rw', db.tables, async (tx) => {
    tx['disableChangeTracking'] = true;
    tx['disableAccessControl'] = true; // TODO: Take care of this flag in access control middleware!

    // Update db.cloud.schema from server response.
    // Local schema MAY include a subset of tables, so do not force all tables into local schema.
    for (const tableName of Object.keys(schema)) {
      if (res.schema[tableName]) {
        // Write directly into configured schema. This code can only be executed alone.
        schema[tableName] = res.schema[tableName];
      }
    }
    await db.$syncState.put(schema, 'schema');

    // List mutations that happened during our exchange with the server:
    const addedClientChanges = await listClientChanges(mutationTables, db, {
      since: latestRevisions
    });

    //
    // Delete changes now as server has return success
    // (but keep changes that haven't reached server yet)
    //
    for (const mutTable of mutationTables) {
      const tableName = getTableFromMutationTable(mutTable.name);
      if (
        !addedClientChanges.some(
          (ch) => ch.table === tableName && ch.muts.length > 0
        )
      ) {
        // No added mutations for this table during the time we sent changes
        // to the server.
        // It is therefore safe to clear all changes (which is faster than
        // deleting a range)
        await Promise.all([
          mutTable.clear(),
          db.$baseRevs.where({ tableName }).delete()
        ]);
      } else if (latestRevisions[mutTable.name]) {
        const latestRev = latestRevisions[mutTable.name] || 0;
        //await mutTable.where('rev').belowOrEqual(latestRev).reverse().offset(1).delete();
        await Promise.all([
          mutTable.where('rev').belowOrEqual(latestRev).delete(),
          db.$baseRevs
            .where(':id')
            .between(
              [tableName, -Infinity],
              [tableName, latestRev + 1],
              true,
              true
            )
            .reverse()
            .offset(1) // Keep one entry (the one mapping muts that came during fetch --> previous server revision)
            .delete()
        ]);
      } else {
        // In this case, the mutation table only contains added items after sending empty changeset to server.
        // We should not clear out anything now.
      }
    }

    // Update latestRevisions object according to additional changes:
    getLatestRevisionsPerTable(addedClientChanges, latestRevisions);

    // Update/add new entries into baseRevs map.
    // * On tables without mutations since last serverRevision,
    //   this will update existing entry.
    // * On tables where mutations have been recorded since last
    //   serverRevision, this will create a new entry.
    // The purpose of this operation is to mark a start revision (per table)
    // so that all client-mutations that come after this, will be mapped to current
    // server revision.
    await db.$baseRevs.bulkPut(
      Object.keys(schema).map((tableName) => {
        const lastClientRevOnPreviousServerRev =
          latestRevisions[tableName] || 0;
        return {
          tableName,
          clientRev: lastClientRevOnPreviousServerRev + 1,
          serverRev: res.serverRevision
        };
      })
    );

    //
    // Update syncState
    //
    const syncState = await db.getPersistedSyncState();
    const newSyncState = syncState || {
      syncedTables: [],
      latestRevisions: {}
    };
    newSyncState.syncedTables = tablesToSync
      .map((tbl) => tbl.name)
      .concat(tablesToSyncify.map((tbl) => tbl.name));
    newSyncState.latestRevisions = latestRevisions;
    newSyncState.remoteDbId = res.dbId;
    newSyncState.initiallySynced = true;
    newSyncState.realms = res.realms;
    newSyncState.serverRevision = res.serverRevision;

    const filteredChanges = filterServerChangesThroughAddedClientChanges(
      res.changes,
      addedClientChanges
    );

    //
    // apply server changes
    //
    await applyServerChanges(filteredChanges, db);

    //
    // Update syncState
    //
    db.$syncState.put(newSyncState, 'syncState');
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
  for (const { table: tableName, muts } of changes) {
    const table = db.table(tableName);
    for (const mut of muts) {
      switch (mut.type) {
        case 'insert':
          await table.bulkAdd(mut.values, mut.keys);
          break;
        case 'upsert':
          await table.bulkPut(mut.values, mut.keys);
          break;
        case 'modify':
          if (mut.keys.length === 1) {
            await table.update(mut.keys[0], mut.changeSpec);
          } else {
            await table.where(':id').anyOf(mut.keys).modify(mut.changeSpec);
          }
          break;
        case 'update':
          await bulkUpdate(table, mut.keys, mut.changeSpecs);
          break;
        case 'delete':
          await table.bulkDelete(mut.keys);
          break;
      }
    }
  }
}

function filterServerChangesThroughAddedClientChanges(
  serverChanges: DBOperationsSet,
  addedClientChanges: DBOperationsSet
): DBOperationsSet {
  const changes: DBKeyMutationSet = {};
  applyOperations(changes, serverChanges);
  const localPostChanges: DBKeyMutationSet = {};
  applyOperations(localPostChanges, addedClientChanges);
  subtractChanges(changes, localPostChanges);
  return toDBOperationSet(changes);
}
