import { DexieCloudDB } from "../db/DexieCloudDB";
import { PersistedSyncState } from "../db/entities/PersistedSyncState";
import { UserLogin } from "../db/entities/UserLogin";
import { randomString } from "../helpers/randomString";
import { EntityCommon } from "../db/entities/EntityCommon";
import { Table } from "dexie";
import { DBInsertOperation, DBOperationsSet, DBUpsertOperation, DexieCloudSchema, isValidAtID, isValidSyncableID } from "dexie-cloud-common";

export async function listSyncifiedChanges(
  tablesToSyncify: Table<EntityCommon>[],
  currentUser: UserLogin,
  schema: DexieCloudSchema,
  alreadySyncedRealms?: string[]
): Promise<DBOperationsSet> {
  const txid = `upload-${randomString(8)}`
  if (currentUser.isLoggedIn) {
    if (tablesToSyncify.length > 0) {
      const ignoredRealms = new Set(alreadySyncedRealms || []);
      const upserts = await Promise.all(
        tablesToSyncify.map(async (table) => {
          const { extractKey } = table.core.schema.primaryKey;
          if (!extractKey) return { table: table.name, muts: [] }; // Outbound tables are not synced.

          const dexieCloudTableSchema = schema[table.name];
          const query = dexieCloudTableSchema?.generatedGlobalId
            ? table.filter(
                (item) => !ignoredRealms.has(item.realmId || "") && isValidSyncableID(extractKey(item))
              )
            : table.filter(
                (item) => !ignoredRealms.has(item.realmId || "") && isValidAtID(extractKey(item), dexieCloudTableSchema?.idPrefix)
              );
          const unsyncedObjects = await query.toArray();
          if (unsyncedObjects.length > 0) {
            const mut: DBUpsertOperation = {
              type: "upsert",
              values: unsyncedObjects,
              keys: unsyncedObjects.map(extractKey),
              userId: currentUser.userId,
              txid
            };
            return {
              table: table.name,
              muts: [mut],
            };
          } else {
            return {
              table: table.name,
              muts: []
            }
          }
        })
      );
      return upserts.filter(op => op.muts.length > 0);
    }
  }
  return [];
}
