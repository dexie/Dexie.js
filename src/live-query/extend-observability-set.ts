import { deepClone, keys } from "../functions/utils";
import { mergeRanges, RangeSet } from "../helpers/rangeset";
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
        if (targetPart && targetPart !== true) {
          if (newPart === true) {
            targetTableSet[tableName] = true;
          } else {
            if (!targetPart.keys) targetPart.keys = new RangeSet();
            mergeRanges(targetPart.keys, newPart.keys);
            if (targetPart.indexes === true || newPart.indexes === true) {
              targetPart.indexes = true;
            } else if (newPart.indexes) {
              if (!targetPart.indexes) targetPart.indexes = {};
              for (const newIndex of keys(newPart.indexes)) {
                if (!targetPart.indexes[newIndex])
                  targetPart.indexes[newIndex] = new RangeSet();
                mergeRanges(
                  targetPart.indexes[newIndex],
                  newPart.indexes[newIndex]
                );
              }
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
