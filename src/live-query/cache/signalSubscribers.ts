import { CacheEntry, TblQueryCache } from '../../public/types/cache';
import { ObservabilitySet } from '../../public/types/db-events';
import { extendObservabilitySet } from '../extend-observability-set';
import { obsSetsOverlap } from '../obs-sets-overlap';
import { cache } from './cache';

let unsignaledParts: ObservabilitySet = {};
let isTaskEnqueued = false;

export function signalSubscribersLazily(part: ObservabilitySet) {
  extendObservabilitySet(unsignaledParts, part);
  if (!isTaskEnqueued) {
    isTaskEnqueued = true;
    queueMicrotask(() => {
      isTaskEnqueued = false;
      const parts = unsignaledParts;
      unsignaledParts = {};
      signalSubscribersNow(parts);
    });
  }
}

export function signalSubscribersNow(
  updatedParts: ObservabilitySet,
  deleteAffectedCacheEntries = false
) {
  const queriesToSignal = new Set<() => void>();
  for (const key in updatedParts) {
    const parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
    if (parts) {
      const [, dbName, tableName] = parts;
      const tblCache = cache[`idb://${dbName}/${tableName}`];
      if (tblCache)
        signalTableSubscribersNow(
          tblCache,
          updatedParts,
          queriesToSignal,
          deleteAffectedCacheEntries
        );
    }
  }
  // Now when affected cache entries are removed, signal collected subscribers to requery.
  queriesToSignal.forEach((requery) => requery());
}

function signalTableSubscribersNow(
  tblCache: TblQueryCache,
  updatedParts: ObservabilitySet,
  outQueriesToSignal: Set<() => void>,
  deleteAffectedCacheEntries: boolean
) {
  const updatedEntryLists: [string, CacheEntry[]][] =
    deleteAffectedCacheEntries && [];
  for (const [indexName, entries] of Object.entries(tblCache.queries.query)) {
    const filteredEntries: CacheEntry[] = deleteAffectedCacheEntries && [];
    for (const entry of entries) {
      if (entry.obsSet && obsSetsOverlap(updatedParts, entry.obsSet)) {
        // This query is affected by the mutation. Remove it from cache
        // and signal all subscribers to requery.
        entry.subscribers.forEach((requery) => outQueriesToSignal.add(requery));
      } else if (deleteAffectedCacheEntries) {
        filteredEntries.push(entry);
      }
    }
    // Collect cache entries to be updated
    if (deleteAffectedCacheEntries)
      updatedEntryLists.push([indexName, filteredEntries]);
  }
  if (deleteAffectedCacheEntries) {
    for (const [indexName, filteredEntries] of updatedEntryLists) {
      tblCache.queries.query[indexName] = filteredEntries;
    }
  }
}
