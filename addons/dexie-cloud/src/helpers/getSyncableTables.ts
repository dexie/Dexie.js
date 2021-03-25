import { DexieCloudDB } from "../db/DexieCloudDB";

export function getSyncableTables(db: DexieCloudDB) {
  return Object.keys(db.cloud.schema).filter(tableName => db.cloud.schema[tableName].sync);
}
