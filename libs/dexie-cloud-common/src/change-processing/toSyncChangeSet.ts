import { DBDeleteOperation, DBOperation, DBUpdateOperation, DBUpsertOperation } from "../DBOperation.js";
import { DBOperationsSet } from "../DBOperationsSet.js";
import { SyncChangeSet } from "../SyncChangeSet.js";
import { DBKeyMutationSet } from "./DBKeyMutationSet.js";

/** Convert a DBKeyMutationSet (which is an internal format capable of looking up changes per ID)
 * ...into a SyncChangeSet (which is more optimal for performing DB operations into DB SQL UPSERT, UPDATE, DELETE)
 * 
 * @param inSet 
 * @returns SyncChangeSet representing inSet
 */
export function toSyncChangeSet(inSet: DBKeyMutationSet): SyncChangeSet {
  // Convert data into a temporary map to collect mutations of same table and type
  const map: {
    [table: string]: { [opType: string]: { key: any, val?: any, mod?: any }[] };
  } = {};
  for (const [table, ops] of Object.entries(inSet)) {
    for (const [key, op] of Object.entries(ops)) {
      const mapEntry = map[table] || (map[table] = {});
      const ops = mapEntry[op.type] || (mapEntry[op.type] = []);
      ops.push({ key, ...op }); // DBKeyMutation doesn't contain key, so we need to bring it in.
    }
  }

  // Start computing the resulting format:
  const result: SyncChangeSet = {};

  for (const [table, ops] of Object.entries(map)) {
    const resultEntry: {
      upsert?: object[];
      update?: { [key: string]: { [keyPath: string]: any } };
      delete?: string[];
    } = {};
    
    for (const [optype, muts] of Object.entries(ops)) {
      switch (optype) {
        case "ups": {
          resultEntry.upsert = muts.map(mut => mut.val);
          break;
        }
        case "upd": {
          const updateMap: { [key: string]: { [keyPath: string]: any } } = {};
          for (const mut of muts) {
            updateMap[mut.key] = mut.mod;
          }
          resultEntry.update = updateMap;
          break;
        }
        case "del": {
          resultEntry.delete = muts.map(mut => mut.key);
          break;
        }
      }
    }
    
    result[table] = resultEntry;
  }

  return result;
}
