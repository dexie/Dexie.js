import { IndexableType, Table } from "dexie";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { EntityCommon } from "../db/entities/EntityCommon";

export function getSyncableTables(db: DexieCloudDB): Table<EntityCommon>[] {
  return Object.entries(db.cloud.schema || {})
    .filter(([, { markedForSync }]) => markedForSync)
    .map(([tbl]) => db.table(tbl));
}
