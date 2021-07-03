import { DBDeleteOperation, DBOperation, DBUpdateOperation, DBUpsertOperation } from "../DBOperation.js";
import { DBOperationsSet } from "../DBOperationsSet.js";
import { randomString } from "../utils.js";
import { DBKeyMutation } from "./DBKeyMutation.js";
import { DBKeyMutationSet } from "./DBKeyMutationSet.js";

/** Convert a DBKeyMutationSet (which is an internal format capable of looking up changes per ID)
 * ...into a DBOperationsSet (which is more optimal for performing DB operations into DB (bulkAdd() etc))
 * 
 * @param inSet 
 * @returns DBOperationsSet representing inSet
 */
export function toDBOperationSet(inSet: DBKeyMutationSet): DBOperationsSet {
  // Fictive transaction:
  const txid = randomString(16);

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
  const result: DBOperationsSet = [];

  for (const [table, ops] of Object.entries(map)) {
    const resultEntry = {
      table,
      muts: [] as DBOperation[],
    };
    for (const [optype, muts] of Object.entries(ops)) {
      switch (optype) {
        case "ups": {
          const op: DBUpsertOperation = {
            type: "upsert",
            keys: muts.map(mut => mut.key),
            values: muts.map(mut => mut.val),
            txid
          };
          resultEntry.muts.push(op);
          break;
        }
        case "upd": {
          const op: DBUpdateOperation = {
            type: "update",
            keys: muts.map(mut => mut.key),
            changeSpecs: muts.map(mut => mut.mod),
            txid
          };
          resultEntry.muts.push(op);
          break;
        }
        case "del": {
          const op: DBDeleteOperation = {
            type: "delete",
            keys: muts.map(mut => mut.key),
            txid,
          }
          resultEntry.muts.push(op);
          break;
        }
      }
    }
    result.push(resultEntry);
  }

  return result;
}
