import { liveQuery } from 'dexie';
import { DBOperationsSet } from 'dexie-cloud-common';
import { from, of } from 'rxjs';
import { filter, finalize, switchMap, tap } from 'rxjs/operators';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { getMutationTable } from '../helpers/getMutationTable';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { ChangesFromServerMessage } from '../WSObservable';
import { isSyncNeeded } from './isSyncNeeded';
import { listClientChanges } from './listClientChanges';
import {
  applyServerChanges,
  filterServerChangesThroughAddedClientChanges,
} from './sync';

export function syncServerToClientOnly(
  db: DexieCloudDB,
  { baseRev, newRev, changes }: ChangesFromServerMessage
) {
  return db.cloud.syncState.pipe(
    filter((syncNeeded) => syncNeeded.phase === 'in-sync'), // wait till any existing sync operation is done
    switchMap(() => db.cloud.persistedSyncState),
    filter((syncState) => '' + syncState?.serverRevision === baseRev), // Only proceed if we are on the same server revision as WS expected us to be
    switchMap(() => {
      let cancelled = false;
      function testcancel() {
        if (cancelled) throw new Error('observable cancelled');
      }
      return from(
        // TODO: Reuse the new applyServerResponse() function here instead. Maybe extend the WS
        db.transaction('rw', db.dx.tables, async (tx) => {
          testcancel();
          // @ts-ignore
          tx.idbtrans.disableChangeTracking = true;
          // @ts-ignore
          tx.idbtrans.disableAccessControl = true;
          // Verify again in ACID tx that we're on same server revision.
          const syncState = await db.getPersistedSyncState();
          testcancel();
          if (syncState?.serverRevision !== baseRev) return;
          // Get clientChanges
          const currentUser = await db.getCurrentUser();
          testcancel();
          let clientChanges: DBOperationsSet = [];
          if (currentUser.isLoggedIn) {
            const mutationTables = getSyncableTables(db).map((tbl) =>
              db.table(getMutationTable(tbl.name))
            );
            clientChanges = await listClientChanges(mutationTables, db);
            testcancel();
          }
          const filteredChanges = filterServerChangesThroughAddedClientChanges(
            changes,
            clientChanges
          );

          //
          // apply server changes
          //
          await applyServerChanges(filteredChanges, db);
          testcancel();

          //
          // Update syncState
          //
          await db.$syncState.update('syncState', {
            serverRevision: newRev,
          } as Partial<PersistedSyncState>);
          testcancel();
        })
      ).pipe(finalize(() => (cancelled = true))); // Tested: https://jsitor.com/o3yjrpnlX
    })
  );
}
