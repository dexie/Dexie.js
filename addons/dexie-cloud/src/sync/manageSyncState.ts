// TODO: REMOVE THIS! NOT NEEDED! WE DONT NEED TO GO THE LONG WAY AND MIDDLE-STORE STUFF IN CHANGE TABLES!
import { DexieCloudDB } from "../db/DexieCloudDB";
import { getSyncableTables } from "../helpers/getSyncableTables";

export async function manageSyncState(db: DexieCloudDB) {
  const syncState = await db.getPersistedSyncState();
  if (!syncState) {
    await db.$syncState.add(
      {
        syncedTables: [],
      },
      "syncState"
    );
    await manageSyncState(db);
    return;
  }

  const tablesToSync = getSyncableTables(db);
  if (
    db.cloud.currentUser.value.isLoggedIn &&
    tablesToSync.some((tbl) => !syncState.syncedTables.includes(tbl.name))
  ) {
    // There are tables that are in need of getting their values into their changes tables

  }
}
