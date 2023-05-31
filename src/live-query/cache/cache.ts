import { CacheEntry, GlobalQueryCache, TblQueryCache } from "../../public/types/cache";
import { ObservabilitySet } from "../../public/types/db-events";
import { obsSetsOverlap } from "../obs-sets-overlap";

export const cache: GlobalQueryCache = {}

export function invalidateCachedQueries (updateParts: ObservabilitySet) {
  const queriesToSignal = new Set<() => void>();
  for (const key in updateParts) {
    const parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
    if (parts) {
      const [, dbName, tableName] = parts;
      const tblCache = cache[`idb://${dbName}/${tableName}`];
      if (tblCache) invalidateTableQueries(tblCache, updateParts, queriesToSignal);
    }
  }
  // Now when affected cache entries are removed, signal collected subscribers to requery.
  queriesToSignal.forEach((requery) => requery());
}

function invalidateTableQueries(tblCache: TblQueryCache, mutatedParts: ObservabilitySet, queriesToSignal: Set<() => void>) {
  const updatedEntryLists: [string, CacheEntry[]][] = [];
  for (const [indexName, entries] of Object.entries(tblCache.queries.query)) {
    const filteredEntries: CacheEntry[] = [];
    for (const entry of entries) {
      if (entry.obsSet && obsSetsOverlap(mutatedParts, entry.obsSet)) {
        // This query is affected by the mutation. Remove it from cache
        // and signal all subscribers to requery.
        entry.subscribers.forEach((requery) => queriesToSignal.add(requery));
      } else {
        filteredEntries.push(entry);
      }
    }
    // Collect cache entries to be updated
    updatedEntryLists.push([indexName, filteredEntries]);
  }
  for (const [indexName, newEntries] of updatedEntryLists) {
    tblCache.queries.query[indexName] = newEntries;
  }
}
