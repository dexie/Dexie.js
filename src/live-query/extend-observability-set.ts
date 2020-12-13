import { deepClone, keys } from "../functions/utils";
import { mergeRanges, RangeSet } from "../helpers/rangeset";
import { ObservabilitySet } from "../public/types/db-events";

export function extendObservabilitySet(
  target: ObservabilitySet,
  newSet: ObservabilitySet
): ObservabilitySet {
  keys(newSet).forEach(part => {
    const rangeSet = target[part] || (target[part] = new RangeSet());
    mergeRanges(rangeSet, newSet[part]);
  });
  return target;
}
