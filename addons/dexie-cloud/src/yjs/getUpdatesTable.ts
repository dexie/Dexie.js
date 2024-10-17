import { DexieCloudDB } from "../db/DexieCloudDB";
import { YTable } from "./YTable";

export function getUpdatesTable(db: DexieCloudDB, table: string, ydocProp: string): YTable {
  const utbl = db.table(table)?.schema.yProps?.find(p => p.prop === ydocProp)?.updatesTable;
  if (!utbl) throw new Error(`No updatesTable found for ${table}.${ydocProp}`);
  return db.table(utbl);
}
