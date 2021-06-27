import Dexie from "dexie";
import { DexieCloudDB } from "./db/DexieCloudDB";

export function verifySchema(db: DexieCloudDB) {
  for (const table of db.tables) {
    if (db.cloud.schema?.[table.name]?.markedForSync) {
      if (table.schema.primKey.auto) {
        throw new Dexie.SchemaError(
          `Table ${table.name} is both autoIncremented and synced. ` +
            `Use db.cloud.configure({unsyncedTables: [${JSON.stringify(
              table.name
            )}]}) to blacklist it from sync`
        );
      }
      if (!table.schema.primKey.keyPath) {
        throw new Dexie.SchemaError(
          `Table ${table.name} cannot be both synced and outbound. ` +
            `Use db.cloud.configure({unsyncedTables: [${JSON.stringify(
              table.name
            )}]}) to blacklist it from sync`
        );
      }
    }
  }
}
