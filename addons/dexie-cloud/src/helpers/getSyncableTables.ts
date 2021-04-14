import { IndexableType, Table } from "dexie";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { EntityCommon } from "../db/entities/EntityCommon";

export function getSyncableTables(db: DexieCloudDB): Table<EntityCommon>[] {
  const { syncedTables } = db.cloud.options || {};
  return syncedTables
    ? db.tables.filter(tbl => syncedTables.includes(tbl.name))
    : db.tables.filter(tbl => tbl.schema.primKey.keyPath && !/^\$/.test(tbl.name));
}
