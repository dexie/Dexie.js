import { DBOperationsSet } from "../DBOperationsSet.js";
import { applyOperation } from "./applyOperation.js";
import { DBKeyMutationSet } from "./DBKeyMutationSet.js";

export function applyOperations(target: DBKeyMutationSet, ops: DBOperationsSet) {
  for (const {table, muts} of ops) {
    for (const mut of muts) {
      applyOperation(target, table, mut);
    }
  }
}