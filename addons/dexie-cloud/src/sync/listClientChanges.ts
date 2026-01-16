import { PropModification, Table, UpdateSpec } from 'dexie';
import { getTableFromMutationTable } from '../helpers/getTableFromMutationTable';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { DBOperation, DBOperationsSet, DBUpdateOperation } from 'dexie-cloud-common';
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

      let muts: DBOperation[] = await query.toArray();

      muts = canonicalizeToUpdateOps(muts);

      muts = removeRedundantUpdateOps(muts);

      const rv = muts.map((mut) => ({
        table: tableName,
        mut,
      }));

      return rv;
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


function removeRedundantUpdateOps(muts: DBOperation[]) {
  const updateCoverage = new Map<string, Array<{ txid: string; updateSpec: UpdateSpec<any>; }>>();
  for (const mut of muts) {
    if (mut.type === 'update') {
      if (mut.keys.length !== 1 || mut.changeSpecs.length !== 1) {
        continue; // Don't optimize multi-key updates
      }
      const strKey = '' + mut.keys[0];
      const changeSpecs = mut.changeSpecs[0];
      if (Object.values(changeSpecs).some(v => typeof v === "object" && v && "@@propmod" in v)) {
        continue; // Cannot optimize if any PropModification is present
      }
      let keyCoverage = updateCoverage.get(strKey);
      if (keyCoverage) {
        keyCoverage.push({ txid: mut.txid!, updateSpec: changeSpecs });
      } else {
        updateCoverage.set(strKey, [{ txid: mut.txid!, updateSpec: changeSpecs }]);
      }
    }
  }
  muts = muts.filter(mut => {
    // Only apply optimization to update mutations that are single-key
    if (mut.type !== 'update') return true;
    if (mut.keys.length !== 1 || mut.changeSpecs.length !== 1) return true;
    
    // Check if this has PropModifications - if so, skip optimization
    const changeSpecs = mut.changeSpecs[0];
    if (Object.values(changeSpecs).some(v => typeof v === "object" && v && "@@propmod" in v)) {
      return true; // Cannot optimize if any PropModification is present
    }
    
    // Keep track of properties that aren't overlapped by later transactions
    const unoverlappedProps = new Set(Object.keys(mut.changeSpecs[0]));
    const strKey = '' + mut.keys[0];
    const keyCoverage = updateCoverage.get(strKey);
    if (!keyCoverage) return true; // No coverage info - cannot optimize

    for (let i = keyCoverage.length - 1; i >= 0; --i) {
      const { txid, updateSpec } = keyCoverage[i];
      if (txid === mut.txid) break; // Stop when reaching own txid


      // If all changes in updateSpec are covered by all props on all mut.changeSpecs then
      // txid is redundant and can be removed.
      for (const keyPath of Object.keys(updateSpec)) {
        unoverlappedProps.delete(keyPath);
      }
    }
    if (unoverlappedProps.size === 0) {
      // This operation is completely overlapped by later operations. It can be removed.
      return false;
    }
    return true;
  });
  return muts;
}

function canonicalizeToUpdateOps(muts: DBOperation[]) {
  muts = muts.map(mut => {
    if (mut.type === 'modify' && mut.criteria.index === null) {
      // The criteria is on primary key. Convert to an update operation instead.
      // It is simpler for the server to handle and also more efficient.
      const updateMut = {
        ...mut,
        criteria: undefined,
        changeSpec: undefined,
        type: 'update',
        keys: mut.keys,
        changeSpecs: [mut.changeSpec],
      };
      delete updateMut.criteria;
      delete updateMut.changeSpec;
      return updateMut as DBUpdateOperation;
    }

    return mut;
  });
  return muts;
}

