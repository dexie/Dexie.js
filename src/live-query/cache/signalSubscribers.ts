import { CacheEntry, TblQueryCache } from '../../public/types/cache';
import { ObservabilitySet } from '../../public/types/db-events';
import { extendObservabilitySet } from '../extend-observability-set';
import { obsSetsOverlap } from '../obs-sets-overlap';
import { cache } from './cache';

let unsignaledParts: ObservabilitySet = {};
let isTaskEnqueued = false;

export function signalSubscribersLazily(part: ObservabilitySet, optimistic = false) {
  extendObservabilitySet(unsignaledParts, part);
  if (!isTaskEnqueued) {
    isTaskEnqueued = true;
    setTimeout(() => {
      isTaskEnqueued = false;
      const parts = unsignaledParts;
      unsignaledParts = {};
      signalSubscribersNow(parts, false);
    }, 0);
  }
}

export function signalSubscribersNow(
  updatedParts: ObservabilitySet,
  deleteAffectedCacheEntries = false
) {
  const queriesToSignal = new Set<() => void>();
  if (updatedParts.all) {
    // Signal all subscribers to requery.
    for (const tblCache of Object.values(cache)) {
      collectTableSubscribers(
        tblCache,
        updatedParts,
        queriesToSignal,
        deleteAffectedCacheEntries
      );
    }
  } else {
    for (const key in updatedParts) {
      const parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
      if (parts) {
        const [, dbName, tableName] = parts;
        const tblCache = cache[`idb://${dbName}/${tableName}`];
        if (tblCache)
          collectTableSubscribers(
            tblCache,
            updatedParts,
            queriesToSignal,
            deleteAffectedCacheEntries
          );
      }
    }
  }
  // Now when affected cache entries are removed, signal collected subscribers to requery.
  queriesToSignal.forEach((requery) => requery());
}

function collectTableSubscribers(
  tblCache: TblQueryCache,
  updatedParts: ObservabilitySet,
  outQueriesToSignal: Set<() => void>,
  deleteAffectedCacheEntries: boolean
) {
  const updatedEntryLists: [string, CacheEntry[]][] = [];
  for (const [indexName, entries] of Object.entries(tblCache.queries.query)) {
    const filteredEntries: CacheEntry[] = [];
    for (const entry of entries) {
      if (obsSetsOverlap(updatedParts, entry.obsSet)) {
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
