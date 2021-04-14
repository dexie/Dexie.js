import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { DBInsertOperation } from "../types/move-to-dexie-cloud-common/DBOperation";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
import { UserLogin } from "../db/entities/UserLogin";
import { randomString } from "../helpers/randomString";
import { EntityCommon } from "../db/entities/EntityCommon";
import { Table } from "dexie";

export async function listSyncifiedChanges(
  tablesToSyncify: Table<EntityCommon>[],
  currentUser: UserLogin
): Promise<DBOperationsSet> {
  if (currentUser.isLoggedIn) {
    if (tablesToSyncify.length > 0) {
      const inserts = await Promise.all(
        tablesToSyncify.map(async (table) => {
          const query = table.filter((item) => item.realmId === undefined);
          const unsyncedObjects = await query.toArray();
          const mut: DBInsertOperation = {
            type: "insert",
            values: unsyncedObjects,
            keys: table.core.schema.primaryKey.extractKey
              ? unsyncedObjects.map(table.core.schema.primaryKey.extractKey)
              : await query.primaryKeys(),
            userId: currentUser.userId,
          };
          return {
            table: table.name,
            muts: [mut],
          };
        })
      );
      return {
        inserts,
        syncifiedTables: tablesToSyncify,
      };
    }
  }
  return {
    inserts: [],
    syncifiedTables: [],
  };
}

