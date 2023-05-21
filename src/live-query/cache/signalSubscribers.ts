import { TblQueryCache } from '../../public/types/cache';
import { ObservabilitySet } from '../../public/types/db-events';
import { extendObservabilitySet } from '../extend-observability-set';
import { obsSetsOverlap } from '../obs-sets-overlap';


export function signalSubscribers(tblCache: TblQueryCache, mutatedParts: ObservabilitySet) {
  extendObservabilitySet(tblCache.unsignaledParts, mutatedParts);
  if (!tblCache.signalTimer) {
    tblCache.signalTimer = setTimeout(() => {
      tblCache.signalTimer = null;
      signalSubscribersNow(tblCache);
    }, 0);
  }
}
function signalSubscribersNow(tblCache: TblQueryCache) {
  const collectedSubscribers = new Set<() => void>(); // Collect all and then call to reduce risk of requerying same query twice.
  for (const entries of Object.values(tblCache.queries.query)) {
    for (const entry of entries) {
      if (entry.obsSet && obsSetsOverlap(entry.obsSet, tblCache.unsignaledParts)) {
        entry.subscribers.forEach((requery) => collectedSubscribers.add(requery));
      }
    }
  }
  tblCache.unsignaledParts = {};
  collectedSubscribers.forEach((requery) => requery()); // try..catch not needed. subscriber is in live-query.ts  
}
