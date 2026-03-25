import { DexieCloudDB } from '../db/DexieCloudDB';
import { TXExpandos } from '../types/TXExpandos';
import { confirmLogout } from './interactWithUser';
import { UNAUTHORIZED_USER } from './UNAUTHORIZED_USER';
import { waitUntil } from './waitUntil';

export async function logout(db: DexieCloudDB) {
  const numUnsyncedChanges = await _logout(db);
  if (numUnsyncedChanges) {
    if (
      await confirmLogout(
        db.cloud.userInteraction,
        db.cloud.currentUserId,
        numUnsyncedChanges
      )
    ) {
      await _logout(db, { deleteUnsyncedData: true });
    } else {
      throw new Error(`User cancelled logout due to unsynced changes`);
    }
  }
}

export async function _logout(db: DexieCloudDB, { deleteUnsyncedData = false } = {}) {
  // Clear the database without emptying configuration options.
  const [numUnsynced, loggedOut] = await db.dx.transaction('rw', db.dx.tables, async (tx) => {
    // @ts-ignore
    const idbtrans: IDBTransaction & TXExpandos = tx.idbtrans;
    idbtrans.disableChangeTracking = true;
    idbtrans.disableAccessControl = true;
    const mutationTables = tx.storeNames.filter((tableName) =>
      tableName.endsWith('_mutations')
    );

    // Count unsynced changes
    const unsyncCounts = await Promise.all(
      mutationTables.map((mutationTable) => tx.table(mutationTable).count())
    );
    const sumUnSynced = unsyncCounts.reduce((a, b) => a + b, 0);

    if (sumUnSynced > 0 && !deleteUnsyncedData) {
      // Let caller ask user if they want to delete unsynced data.
      return [sumUnSynced, false];
    }
    
    // Either there are no unsynched changes, or caller provided flag deleteUnsynchedData = true.
    // Clear all tables except $jobs and $syncState (except the persisted sync state which is
    // also cleared because we're going to rebuild it using a fresh sync).
    db.$syncState.delete('syncState');
    for (const table of db.dx.tables) {
      if (table.name !== '$jobs' && table.name !== '$syncState') {
        table.clear();
      }
    }
    return [sumUnSynced, true];
  });

  if (loggedOut) {
    // Wait for currentUser observable to emit UNAUTHORIZED_USER
    await waitUntil(db.cloud.currentUser, (user) => user.userId === UNAUTHORIZED_USER.userId);
    // Then perform an initial sync
    await db.cloud.sync({purpose: 'pull', wait: true});
  }
  return numUnsynced;
}
