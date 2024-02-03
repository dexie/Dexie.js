import { rangesOverlap } from '../helpers/rangeset';
import { ObservabilitySet } from '../public/types/db-events';

export function obsSetsOverlap(os1: ObservabilitySet, os2: ObservabilitySet) {
  return os1.all || os2.all || Object.keys(os1).some(
    (key) => os2[key] && rangesOverlap(os2[key], os1[key])
  );
}
