import { DexieCloudDB } from "../db/DexieCloudDB";
import { YTable } from "./YTable";

export function getUpdatesTable(db: DexieCloudDB, table: string, ydocProp: string): YTable | undefined {
  if (!db.dx._allTables[table]) return undefined;
  const utbl = db.table(table)?.schema.yProps?.find(p => p.prop === ydocProp)?.updatesTable;
  if (!utbl) {
    console.debug(`No updatesTable found for ${table}.${ydocProp}`);
    return undefined;
  }
  if (!db.dx._allTables[utbl]) return undefined;
  return db.table(utbl);
}
