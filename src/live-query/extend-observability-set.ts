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
            targetTableSet[tableName] = {
              keys: targetPart.keys.concat(newPart.keys),
            };
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
