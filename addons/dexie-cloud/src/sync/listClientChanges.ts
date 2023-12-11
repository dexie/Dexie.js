import { Table } from 'dexie';
import { getTableFromMutationTable } from '../helpers/getTableFromMutationTable';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DBOperation, DBOperationsSet } from 'dexie-cloud-common';
import { flatten } from '../helpers/flatten';

export async function listClientChanges(
  mutationTables: Table[],
  db: DexieCloudDB,
  { since = {} as { [table: string]: number }, limit = Infinity } = {}
): Promise<DBOperationsSet> {
  const allMutsOnTables = await Promise.all(
    mutationTables.map(async (mutationTable) => {
      const tableName = getTableFromMutationTable(mutationTable.name);
      const lastRevision = since[tableName];

      let query = lastRevision
        ? mutationTable.where('rev').above(lastRevision)
        : mutationTable;

      if (limit < Infinity) query = query.limit(limit);

      const muts: DBOperation[] = await query.toArray();

      //const objTable = db.table(tableName);
      /*for (const mut of muts) {
        if (mut.type === "insert" || mut.type === "upsert") {
          mut.values = await objTable.bulkGet(mut.keys);
        }
      }*/
      return muts.map((mut) => ({
        table: tableName,
        mut,
      }));
    })
  );

  // Sort by time to get a true order of the operations (between tables)
  const sorted = flatten(allMutsOnTables).sort((a, b) => a.mut.txid === b.mut.txid
    ? a.mut.opNo! - b.mut.opNo! // Within same transaction, sort by opNo
    : a.mut.ts! - b.mut.ts! // Different transactions - sort by timestamp when mutation resolved
  );
  const result: DBOperationsSet = [];
  let currentEntry: {
    table: string;
    muts: DBOperation[];
  } | null = null;
  let currentTxid: string | null = null;
  for (const { table, mut } of sorted) {
    if (
      currentEntry &&
      currentEntry.table === table &&
      currentTxid === mut.txid
    ) {
      currentEntry.muts.push(mut);
    } else {
      currentEntry = {
        table,
        muts: [mut],
      };
      currentTxid = mut.txid!;
      result.push(currentEntry);
    }
  }

  // Filter out those tables that doesn't have any mutations:
  return result;
}
