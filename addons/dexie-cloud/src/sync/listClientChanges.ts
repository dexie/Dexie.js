import { Table } from "dexie";
import { getTableFromMutationTable } from "../helpers/getTableFromMutationTable";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { DBOperation, DBOperationsSet } from "dexie-cloud-common";

export async function listClientChanges(
  mutationTables: Table[],
  db: DexieCloudDB,
  { since = {} as {[table: string]: number}, limit = Infinity } = {}): Promise<DBOperationsSet> {
  const allMutsOnTables = await Promise.all(
    mutationTables.map(async (mutationTable) => {
      const tableName = getTableFromMutationTable(mutationTable.name);
      const lastRevision = since[tableName];

      let query = lastRevision
        ? mutationTable.where("rev").above(lastRevision)
        : mutationTable;

      if (limit < Infinity) query = query.limit(limit);
      
      const muts: DBOperation[] = await query.toArray();

      //const objTable = db.table(tableName);
      /*for (const mut of muts) {
        if (mut.type === "insert" || mut.type === "upsert") {
          mut.values = await objTable.bulkGet(mut.keys);
        }
      }*/
      return {
        table: tableName,
        muts,
      };
    })
  );

  // Filter out those tables that doesn't have any mutations:
  return allMutsOnTables.filter(({ muts }) => muts.length > 0);
}
