import { CacheEntry, GlobalQueryCache, TblQueryCache } from "../../public/types/cache";
import { ObservabilitySet } from "../../public/types/db-events";
import { obsSetsOverlap } from "../obs-sets-overlap";

export const cache: GlobalQueryCache = {}

export function invalidateCachedObservabilitySets (updateParts: ObservabilitySet) {
  for (const key in updateParts) {
    const parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
    if (parts) {
      const [, dbName, tableName] = parts;
      const tblCache = cache[`idb://${dbName}/${tableName}`];
      if (tblCache) invalidateQueries(tblCache, updateParts);
    }
  }
}

function invalidateQueries(tblCache: TblQueryCache, mutatedParts: ObservabilitySet) {
  const collectedSubscribers = new Set<() => void>();
  const thingsToRemove:[string, Set<CacheEntry>][] = [];
  for (const [indexName, entries] of Object.entries(tblCache.queries.query)) {
    const entriesToRemove = new Set<CacheEntry>();
    for (const entry of entries) {
      if (entry.obsSet && obsSetsOverlap(mutatedParts, entry.obsSet)) {
        entriesToRemove.add(entry);
        entry.subscribers.forEach((requery) => collectedSubscribers.add(requery));
      }
    }
    thingsToRemove.push([indexName, entriesToRemove]);
  }
  for (const [indexName, entriesToRemove] of thingsToRemove) {
    tblCache.queries.query[indexName] =
      tblCache.queries.query[indexName].filter(entry => !entriesToRemove.has(entry));
  }
  collectedSubscribers.forEach((requery) => requery());
}
