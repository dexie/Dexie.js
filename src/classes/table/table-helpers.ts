import { DBCoreMutateResponse } from "../../public/types/dbcore";
import { Table } from "./table";


export function builtInDeletionTrigger (table: Table, keys: null | readonly any[], res: DBCoreMutateResponse): DBCoreMutateResponse | Promise<DBCoreMutateResponse> {
  // Delete related document updates. Otherwise, if a row with same ID is created
  // again, its document would not be empty.
  // Document providers will get notified on the main table's row deletion and destroy
  // document. Sync of this action is outside of the Y.js scope but will be handled
  // by the dexie cloud sync layer or equivalent sync layer.
  const { yProps } = table.schema;
  if (!yProps) return res;
  if (keys && res.numFailures > 0) keys = keys.filter((_, i) => !res.failures[i]);
  return Promise.all(yProps.map(({updatesTable}) => 
    keys
    ? table.db.table(updatesTable).where('k').anyOf(keys).delete()
    : table.db.table(updatesTable).clear()
  )).then(() => res);
}