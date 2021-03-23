import { SyncableDB } from "../SyncableDB";

export function getSyncableTables(db: SyncableDB) {
  return Object.keys(db.cloud.schema).filter(tableName => db.cloud.schema[tableName].sync);
}
