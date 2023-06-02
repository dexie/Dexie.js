import { cloneSimpleObjectTree, deepClone, keys, objectIsEmpty } from "../functions/utils";
import { mergeRanges, RangeSet } from "../helpers/rangeset";
import { ObservabilitySet } from "../public/types/db-events";

export function extendObservabilitySet(
  target: ObservabilitySet,
  newSet: ObservabilitySet
): ObservabilitySet {
  keys(newSet).forEach(part => {
    if (target[part]) mergeRanges(target[part], newSet[part]);
    else target[part] = cloneSimpleObjectTree(newSet[part]); // Somewhat faster
  });
  return target;
}
