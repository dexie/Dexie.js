import { rangesOverlap } from '../helpers/rangeset';
import { ObservabilitySet } from '../public/types/db-events';

export function obsSetsOverlap(os1: ObservabilitySet, os2: ObservabilitySet) {
  return Object.keys(os1).some(
    (key) => os2[key] && rangesOverlap(os2[key], os1[key])
  );
}
