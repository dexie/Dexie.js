import { domDeps } from '../classes/dexie/dexie-dom-dependencies';
import { cmp } from '../functions/cmp';
import { deepClone, keys } from "../functions/utils";
import { ObservabilitySet } from "../public/types/db-events";
import { SimpleRange } from '../public/types/simple-range';
import { isSubRange, rangesOverlap } from './ranges-overlap';

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
          } else {
            const keys = concatRanges(targetPart.keys, newPart.keys);
            debugger;
            targetTableSet[tableName] = keys ? {
              ...targetPart,
              keys,
              indexes: concatIndexes(targetPart.indexes, newPart.indexes)
            } : true;
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

function concatRanges(
  target: SimpleRange[] | undefined,
  newRanges: SimpleRange[] | undefined
) {
  if (!target) return newRanges;
  if (!newRanges) return target;
  const filteredNewRanges = newRanges.filter(newRange => !target.some(r2 => isSubRange(newRange, r2)));
  const concatenated = target.concat(filteredNewRanges);
  return concatenated.length > 499 ?
    // Stop recording too much - could slow down further comparisions. Will just result in totally non-dangerous "false positives" leading to re-launching queries.
    null :
    concatenated;
}

function concatIndexes(
  targetIndexes: true | {
    [index: string]: SimpleRange[];
  },
  newIndexes: true | {
    [index: string]: SimpleRange[];
  }
) {
  if (targetIndexes === true || newIndexes === true) return true;
  if (!newIndexes) return targetIndexes;
  if (!targetIndexes) return newIndexes;
  let result: { [index: string]: SimpleRange[] } = deepClone(
    targetIndexes
  );
  for (const newIndex of keys(newIndexes)) {
    const concatinated = concatRanges(targetIndexes[newIndex], newIndexes[newIndex]);
    if (!concatinated) return true; // Don't be too detailed. Mark as being a change in broader level.
    result[newIndex] = concatinated;
  }
  return result;
}
