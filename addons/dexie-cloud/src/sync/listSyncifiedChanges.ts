import { DBOperationsSet } from "../types/move-to-dexie-cloud-common/DBOperationsSet";
import { DBInsertOperation } from "../types/move-to-dexie-cloud-common/DBOperation";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
import { UserLogin } from "../db/entities/UserLogin";
import { randomString } from "../helpers/randomString";
import { EntityCommon } from "../db/entities/EntityCommon";
import { Table } from "dexie";
import {
  isValidAtID,
  isValidSyncableID,
} from "../types/move-to-dexie-cloud-common/validation/isValidSyncableID";
import { DexieCloudSchema } from "../DexieCloudSchema";

export async function listSyncifiedChanges(
  tablesToSyncify: Table<EntityCommon>[],
  currentUser: UserLogin,
  schema: DexieCloudSchema
): Promise<DBOperationsSet> {
  if (currentUser.isLoggedIn) {
    if (tablesToSyncify.length > 0) {
      const inserts = await Promise.all(
        tablesToSyncify.map(async (table) => {
          const { extractKey } = table.core.schema.primaryKey;
          if (!extractKey) return { table: table.name, muts: [] }; // Outbound tables are not synced.

          const dexieCloudTableSchema = schema[table.name];
          const query = dexieCloudTableSchema?.generatedGlobalId
            ? table.filter(
                (item) => isValidSyncableID(extractKey(item))
              )
            : table.filter(
                (item) => isValidAtID(extractKey(item), dexieCloudTableSchema?.idPrefix)
              );
          const unsyncedObjects = await query.toArray();
          const mut: DBInsertOperation = {
            type: "insert",
            values: unsyncedObjects,
            keys: unsyncedObjects.map(extractKey),
            userId: currentUser.userId,
          };
          return {
            table: table.name,
            muts: [mut],
          };
        })
      );
      return inserts;
    }
  }
  return [];
}
