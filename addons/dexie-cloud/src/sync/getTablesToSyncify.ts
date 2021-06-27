import { getSyncableTables } from "../helpers/getSyncableTables";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";

export function getTablesToSyncify(db: DexieCloudDB, syncState: PersistedSyncState | undefined) {
  const syncedTables = syncState?.syncedTables || [];
  const syncableTables = getSyncableTables(db);
  const tablesToSyncify = syncableTables.filter(
    (tbl) => !syncedTables.includes(tbl.name)
  );
  return tablesToSyncify;
}
