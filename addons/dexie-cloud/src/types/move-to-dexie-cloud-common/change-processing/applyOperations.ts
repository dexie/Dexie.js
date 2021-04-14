import { DBOperationsSet } from "../DBOperationsSet";
import { applyOperation } from "./applyOperation";
import { DBKeyMutationSet } from "./DBKeyMutationSet";

export function applyOperations(target: DBKeyMutationSet, ops: DBOperationsSet) {
  for (const {table, muts} of ops) {
    for (const mut of muts) {
      applyOperation(target, table, mut);
    }
  }
}