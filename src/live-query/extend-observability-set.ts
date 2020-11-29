import { deepClone, keys } from "../functions/utils";
import { ObservabilitySet } from "../public/types/db-events";

export function extendObservabilitySet(
  target: ObservabilitySet,
  newSet: ObservabilitySet
): ObservabilitySet {
  keys(newSet).forEach((dbName) => {
    const targetTableSet = target[dbName];
    const newTableSet = newSet[dbName];
    if (targetTableSet) {
      // merge os1[dbName] with os2[dbName]
      keys(newTableSet).forEach((tableName) => {
        const targetPart = targetTableSet[tableName];
        const newPart = newTableSet[tableName];
        if (targetPart && targetPart !== true && targetPart.keys) {
          if (newPart === true) {
            targetTableSet[tableName] = true;
          } else if (newPart.keys) {
            const newTargetPart = (targetTableSet[tableName] = {
              keys: (targetPart.keys || []).concat(newPart.keys),
            } as typeof targetPart);
            const targetIndexes = targetPart.indexes;
            const newIndexes = newPart.indexes;
            if (targetIndexes && newIndexes) {
              newTargetPart.indexes =
                targetIndexes === true || newIndexes === true
                  ? true // true means any index of any range
                  : concatIndexes(targetIndexes, newIndexes);
            }
          }
        } else {
          targetTableSet[tableName] = deepClone(newPart);
        }
      });
    } else {
      target[dbName] = deepClone(newTableSet);
    }
  });
  return target;
}

function concatIndexes(
  targetIndexes: {
    [index: string]: Array<[any] | [any, any]>;
  },
  newIndexes: {
    [index: string]: Array<[any] | [any, any]>;
  }
) {
  let result: { [index: string]: Array<[any] | [any, any]> } = deepClone(
    targetIndexes
  );
  for (const newIndex of keys(newIndexes)) {
    const concatinated = (targetIndexes[newIndex] || []).concat(
      newIndexes[newIndex]
    );
    if (concatinated.length > 499) return true; // Don't be too detailed. Mark as being a change in broader level.
    result[newIndex] = concatinated;
  }
  return result;
}
