import { UpdateSpec } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { DEXIE_CLOUD_SYNCER_ID } from '../sync/DEXIE_CLOUD_SYNCER_ID';
import { YDexieCloudSyncState } from './YDexieCloudSyncState';

export async function updateYSyncStates(
  lastUpdateIdsBeforeSync: { [yTable: string]: number },
  receivedUntilsAfterSync: { [yTable: string]: number },
  db: DexieCloudDB
) {
  // We want to update unsentFrom for each yTable to the value specified in first argument
  //  because we got those values before we synced with server and here we are back from server
  //  that has successfully received all those messages - no matter if the last update was a client or server update,
  //  we can safely store unsentFrom to a value of the last update + 1 here.
  // We also want to update receivedUntil for each yTable to the value specified in the second argument,
  //  because that contains the highest resulted id of each update from server after storing it.
  // We could do these two tasks separately, but that would require two update calls on the same YSyncState, so
  // to optimize the dexie calls, we merge these two maps into a single one so we can do a single update request
  // per yTable.
  const mergedSpec: {
    [yTable: string]: { unsentFrom?: number; receivedUntil?: number };
  } = {};
  for (const [yTable, lastUpdateId] of Object.entries(
    lastUpdateIdsBeforeSync
  )) {
    mergedSpec[yTable] ??= {};
    mergedSpec[yTable].unsentFrom = lastUpdateId + 1;
  }
  for (const [yTable, lastUpdateId] of Object.entries(
    receivedUntilsAfterSync
  )) {
    mergedSpec[yTable] ??= {};
    mergedSpec[yTable].receivedUntil = lastUpdateId;
  }

  // Now go through all yTables and update their YSyncStates:
  const allYTables = Object.values(db.dx._dbSchema)
    .filter((tblSchema) => tblSchema.yProps)
    .map((tblSchema) => tblSchema.yProps!.map((yProp) => yProp.updatesTable))
    .flat();
  for (const yTable of allYTables) {
    const mergedEntry = mergedSpec[yTable];
    const unsentFrom = mergedEntry?.unsentFrom ?? 1;
    const receivedUntil =
      mergedEntry?.receivedUntil ?? // If not received anything on this table, pick the current last update id
      // from local because we are in the same parent transaction (in sync.ts) that
      // applied all updates from the server
      ((
        await db
          .table(yTable)
          .where('i')
          .between(1, Infinity) // Because i might be string DEXIE_CLOUD_SYNCER_ID if not a number.
          .reverse()
          .limit(1)
          .primaryKeys()
      )[0] as number) ??
      0;
    // We're already in a transaction, but for the sake of
    // code readability and correctness, let's launch an atomic sub transaction:
    await db.transaction('rw', yTable, async () => {
      const state: YDexieCloudSyncState | undefined = await db
        .table(yTable)
        .get(DEXIE_CLOUD_SYNCER_ID);
      if (!state) {
        await db.table<YDexieCloudSyncState>(yTable).add({
          i: DEXIE_CLOUD_SYNCER_ID,
          unsentFrom,
          receivedUntil
        });
      } else {
        state.unsentFrom = Math.max(unsentFrom, state.unsentFrom || 1);
        state.receivedUntil = Math.max(receivedUntil, state.receivedUntil || 0);
        await db.table(yTable).put(state);
      }
    });
  }
}
