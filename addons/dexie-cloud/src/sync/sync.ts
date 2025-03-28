import { getMutationTable } from '../helpers/getMutationTable';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { listSyncifiedChanges } from './listSyncifiedChanges';
import { getTablesToSyncify } from './getTablesToSyncify';
import { listClientChanges } from './listClientChanges';
import { syncWithServer } from './syncWithServer';
import { modifyLocalObjectsWithNewUserId } from './modifyLocalObjectsWithNewUserId';
import { throwIfCancelled } from '../helpers/CancelToken';
import { DexieCloudOptions } from '../DexieCloudOptions';
import { BaseRevisionMapEntry } from '../db/entities/BaseRevisionMapEntry';
import { getTableFromMutationTable } from '../helpers/getTableFromMutationTable';
import {
  applyOperations,
  DBKeyMutationSet,
  DBOperationsSet,
  DexieCloudSchema,
  randomString,
  subtractChanges,
  SyncResponse,
  toDBOperationSet,
} from 'dexie-cloud-common';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { isOnline } from './isOnline';
import { updateBaseRevs } from './updateBaseRevs';
import { getLatestRevisionsPerTable } from './getLatestRevisionsPerTable';
import { applyServerChanges } from './applyServerChanges';
import { checkSyncRateLimitDelay } from './ratelimit';
import { listYClientMessagesAndStateVector } from '../yjs/listYClientMessagesAndStateVector';
import { applyYServerMessages } from '../yjs/applyYMessages';
import { updateYSyncStates } from '../yjs/updateYSyncStates';
import { downloadYDocsFromServer } from '../yjs/downloadYDocsFromServer';
import { UpdateSpec } from 'dexie';

export const CURRENT_SYNC_WORKER = 'currentSyncWorker';

export interface SyncOptions {
  isInitialSync?: boolean;
  cancelToken?: { cancelled: boolean };
  justCheckIfNeeded?: boolean;
  retryImmediatelyOnFetchError?: boolean;
  purpose?: 'pull' | 'push';
}

export function sync(
  db: DexieCloudDB,
  options: DexieCloudOptions,
  schema: DexieCloudSchema,
  syncOptions?: SyncOptions
): Promise<boolean> {
  return _sync(db, options, schema, syncOptions)
    .then((result) => {
      if (!syncOptions?.justCheckIfNeeded) { // && syncOptions?.purpose !== 'push') {
        db.syncStateChangedEvent.next({
          phase: 'in-sync',
        });
      }
      return result;
    })
    .catch(async (error: any) => {
      if (syncOptions?.justCheckIfNeeded) return Promise.reject(error); // Just rethrow.
      console.debug('Error from _sync', {
        isOnline,
        syncOptions,
        error,
      });
      if (
        isOnline &&
        syncOptions?.retryImmediatelyOnFetchError &&
        error?.name === 'TypeError' &&
        /fetch/.test(error?.message)
      ) {
        db.syncStateChangedEvent.next({
          phase: 'error',
          error,
        });
        // Retry again in 500 ms but if it fails again, don't retry.
        await new Promise((resolve) => setTimeout(resolve, 500));
        return await sync(db, options, schema, {
          ...syncOptions,
          retryImmediatelyOnFetchError: false,
        });
      }
      // Make sure that no matter whether sync() explodes or not,
      // always update the timestamp. Also store the error.
      await db.$syncState.update('syncState', {
        timestamp: new Date(),
        error: '' + error,
      });
      db.syncStateChangedEvent.next({
        phase: isOnline ? 'error' : 'offline',
        error: new Error('' + error?.message || error),
      });
      return Promise.reject(error);
    });
}

async function _sync(
  db: DexieCloudDB,
  options: DexieCloudOptions,
  schema: DexieCloudSchema,
  { isInitialSync, cancelToken, justCheckIfNeeded, purpose }: SyncOptions = {
    isInitialSync: false,
  }
): Promise<boolean> {
  if (!justCheckIfNeeded) {
    console.debug('SYNC STARTED', { isInitialSync, purpose });
  }
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
  const readyForSyncification = currentUser.isLoggedIn;
  const tablesToSyncify = readyForSyncification
    ? getTablesToSyncify(db, persistedSyncState)
    : [];
  throwIfCancelled(cancelToken);
  const doSyncify = tablesToSyncify.length > 0;

  if (doSyncify) {
    if (justCheckIfNeeded) return true;
    //console.debug('sync doSyncify is true');
    await db.transaction('rw', tablesToSyncify, async (tx) => {
      // @ts-ignore
      tx.idbtrans.disableChangeTracking = true;
      // @ts-ignore
      tx.idbtrans.disableAccessControl = true; // TODO: Take care of this flag in access control middleware!
      await modifyLocalObjectsWithNewUserId(
        tablesToSyncify,
        currentUser,
        persistedSyncState?.realms
      );
    });
    throwIfCancelled(cancelToken);
  }
  //
  // List changes to sync
  //
  const [clientChangeSet, syncState, baseRevs, {yMessages, lastUpdateIds}] = await db.transaction(
    'r',
    db.tables,
    async () => {
      const syncState = await db.getPersistedSyncState();
      const baseRevs = await db.$baseRevs.toArray();
      let clientChanges = await listClientChanges(mutationTables, db);
      const yResults = await listYClientMessagesAndStateVector(db, tablesToSync);
      throwIfCancelled(cancelToken);
      if (doSyncify) {
        const alreadySyncedRealms = [
          ...(persistedSyncState?.realms || []),
          ...(persistedSyncState?.inviteRealms || []),
        ];
        const syncificationInserts = await listSyncifiedChanges(
          tablesToSyncify,
          currentUser,
          schema!,
          alreadySyncedRealms
        );
        throwIfCancelled(cancelToken);
        clientChanges = clientChanges.concat(syncificationInserts);
        return [clientChanges, syncState, baseRevs, yResults];
      }
      return [clientChanges, syncState, baseRevs, yResults];
    }
  );

  const pushSyncIsNeeded = clientChangeSet.some((set) =>
    set.muts.some((mut) => mut.keys.length > 0)
  ) || yMessages.some(m => m.type === 'u-c');
  if (justCheckIfNeeded) {
    console.debug('Sync is needed:', pushSyncIsNeeded);
    return pushSyncIsNeeded;
  }
  if (purpose === 'push' && !pushSyncIsNeeded) {
    // The purpose of this request was to push changes
    return false;
  }

  const latestRevisions = getLatestRevisionsPerTable(
    clientChangeSet,
    syncState?.latestRevisions
  );

  const clientIdentity = syncState?.clientIdentity || randomString(16);

  //
  // Push changes to server
  //
  throwIfCancelled(cancelToken);
  const res = await syncWithServer(
    clientChangeSet,
    yMessages,
    syncState,
    baseRevs,
    db,
    databaseUrl,
    schema,
    clientIdentity,
    currentUser
  );
  console.debug('Sync response', res);

  //
  // Apply changes locally and clear old change entries:
  //
  const {done, newSyncState} = await db.transaction('rw', db.tables, async (tx) => {
    // @ts-ignore
    tx.idbtrans.disableChangeTracking = true;
    // @ts-ignore
    tx.idbtrans.disableAccessControl = true; // TODO: Take care of this flag in access control middleware!

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
      since: latestRevisions,
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
          db.$baseRevs.where({ tableName }).delete(),
        ]);
      } else if (latestRevisions[tableName]) {
        const latestRev = latestRevisions[tableName] || 0;
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
            .delete(),
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
    await updateBaseRevs(db, schema, latestRevisions, res.serverRevision);

    const syncState = await db.getPersistedSyncState();

    //
    // Delete objects from removed realms
    //
    await deleteObjectsFromRemovedRealms(db, res, syncState);

    //
    // Update syncState
    //
    const newSyncState: PersistedSyncState = syncState || {
      syncedTables: [],
      latestRevisions: {},
      realms: [],
      inviteRealms: [],
      clientIdentity,
    };
    if (readyForSyncification) {
      newSyncState.syncedTables = tablesToSync
        .map((tbl) => tbl.name)
        .concat(tablesToSyncify.map((tbl) => tbl.name));
    }
    newSyncState.latestRevisions = latestRevisions;
    newSyncState.remoteDbId = res.dbId;
    newSyncState.initiallySynced = true;
    newSyncState.realms = res.realms;
    newSyncState.inviteRealms = res.inviteRealms;
    newSyncState.serverRevision = res.serverRevision;
    newSyncState.yServerRevision = res.serverRevision;
    newSyncState.timestamp = new Date();
    delete newSyncState.error;

    const filteredChanges = filterServerChangesThroughAddedClientChanges(
      res.changes,
      addedClientChanges
    );

    //
    // apply server changes
    //
    await applyServerChanges(filteredChanges, db);

    if (res.yMessages) {
      //
      // apply yMessages
      //
      const {receivedUntils, resyncNeeded, yServerRevision} = await applyYServerMessages(res.yMessages, db);
      if (yServerRevision) {
        newSyncState.yServerRevision = yServerRevision;
      }

      //
      // update Y SyncStates
      //
      await updateYSyncStates(lastUpdateIds, receivedUntils, db);

      if (resyncNeeded) {
        newSyncState.yDownloadedRealms = {}; // Will trigger a full download of Y-documents below...
      }
    }

    //
    // Update regular syncState
    //
    db.$syncState.put(newSyncState, 'syncState');

    return {
      done: addedClientChanges.length === 0,
      newSyncState
    };
  });
  if (!done) {
    console.debug('MORE SYNC NEEDED. Go for it again!');
    await checkSyncRateLimitDelay(db);
    return await _sync(db, options, schema, { isInitialSync, cancelToken });
  }
  const usingYProps = Object.values(schema).some(tbl => tbl.yProps?.length);
  const serverSupportsYprops = !!res.yMessages;
  if (usingYProps && serverSupportsYprops) {
    try {
      await downloadYDocsFromServer(db, databaseUrl, newSyncState);
    } catch (error) {
      console.error('Failed to download Yjs documents from server', error);
    }
  }
  console.debug('SYNC DONE', { isInitialSync });
  db.syncCompleteEvent.next();
  return false; // Not needed anymore
}

async function deleteObjectsFromRemovedRealms(
  db: DexieCloudDB,
  res: SyncResponse,
  syncState: PersistedSyncState | undefined
) {
  const deletedRealms = new Set<string>();
  const rejectedRealms = new Set<string>();
  const previousRealmSet = syncState ? syncState.realms : [];
  const previousInviteRealmSet = syncState ? syncState.inviteRealms : [];
  const updatedRealmSet = new Set(res.realms);
  const updatedTotalRealmSet = new Set(res.realms.concat(res.inviteRealms));
  for (const realmId of previousRealmSet) {
    if (!updatedRealmSet.has(realmId)) {
      rejectedRealms.add(realmId);
      if (!updatedTotalRealmSet.has(realmId)) {
        deletedRealms.add(realmId);
      }
    }
  }
  for (const realmId of previousInviteRealmSet.concat(previousRealmSet)) {
    if (!updatedTotalRealmSet.has(realmId)) {
      deletedRealms.add(realmId);
    }
  }
  if (deletedRealms.size > 0 || rejectedRealms.size > 0) {
    const tables = getSyncableTables(db);
    for (const table of tables) {
      let realmsToDelete = ['realms', 'members', 'roles'].includes(table.name)
        ? deletedRealms // These tables should spare rejected ones.
        : rejectedRealms; // All other tables shoudl delete rejected+deleted ones
      if (realmsToDelete.size === 0) continue;
      if (
        table.schema.indexes.some(
          (idx) =>
            idx.keyPath === 'realmId' ||
            (Array.isArray(idx.keyPath) && idx.keyPath[0] === 'realmId')
        )
      ) {
        // There's an index to use:
        //console.debug(`REMOVAL: deleting all ${table.name} where realmId anyOf `, JSON.stringify([...realmsToDelete]));
        await table
          .where('realmId')
          .anyOf([...realmsToDelete])
          .delete();
      } else {
        // No index to use:
        //console.debug(`REMOVAL: deleting all ${table.name} where realmId is any of `, JSON.stringify([...realmsToDelete]), realmsToDelete.size);
        await table
          .filter((obj) => !!obj?.realmId && realmsToDelete.has(obj.realmId))
          .delete();
      }
    }
  }
  if (rejectedRealms.size > 0 && syncState?.yDownloadedRealms) {
    // Remove rejected/deleted realms from yDownloadedRealms because of the following use case:
    // 1. User becomes added to the realm
    // 2. User syncs and all documents of the realm is downloaded (downloadYDocsFromServer.ts)
    // 3. User leaves the realm and all docs are deleted locally (built-in-trigger of deleting their rows in this file)
    // 4. User is yet again added to the realm. At this point, we must make sure the docs are not considered already downloaded.
    const updateSpec: UpdateSpec<PersistedSyncState> = {};
    for (const realmId of rejectedRealms) {
      delete syncState.yDownloadedRealms[realmId];
    } 
  }
}

export function filterServerChangesThroughAddedClientChanges(
  serverChanges: DBOperationsSet<string>,
  addedClientChanges: DBOperationsSet
): DBOperationsSet<string> {
  const changes: DBKeyMutationSet = {};
  applyOperations(changes, serverChanges);
  const localPostChanges: DBKeyMutationSet = {};
  applyOperations(localPostChanges, addedClientChanges);
  subtractChanges(changes, localPostChanges);
  return toDBOperationSet(changes);
}
