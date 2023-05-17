import { LiveQueryContext } from '..';
import { getFromTransactionCache } from '../../dbcore/cache-existing-values-middleware';
import { exceptions } from '../../errors';
import { cmp } from '../../functions/cmp';
import { deepClone, isArray, keys, setByKeyPath } from '../../functions/utils';
import DexiePromise, { PSD } from '../../helpers/promise';
import { RangeSet, rangesOverlap } from '../../helpers/rangeset';
import { CacheEntry, TblQueryCache } from '../../public/types/cache';
import { ObservabilitySet } from '../../public/types/db-events';
import {
  DBCore,
  DBCoreCountRequest,
  DBCoreCursor,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreIndex,
  DBCoreMutateRequest,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreTable,
  DBCoreTableSchema,
  DBCoreTransaction,
} from '../../public/types/dbcore';
import { Middleware } from '../../public/types/middleware';
import { extendObservabilitySet } from '../extend-observability-set';
import { obsSetsOverlap } from '../obs-sets-overlap';
import { applyOptimisticOps } from './apply-optimistic-ops';
import { cache } from './cache';
import { findCompatibleQuery } from './find-compatible-query';
import { isCachableContext } from './is-cachable';
import { subscribeToCacheEntry } from './subscribe-cachentry';

export const cacheMiddleware: Middleware<DBCore> = {
  stack: 'dbcore',
  level: 0,
  name: 'Cache',
  create: (core) => {
    const dbName = core.schema.name;

    return {
      ...core,
      transaction: (stores, mode, options) => {
        const idbtrans = core.transaction(
          stores,
          mode,
          options
        ) as IDBTransaction & {
          mutatedParts?: ObservabilitySet;
        };
        // Maintain TblQueryCache.ops array when transactions commit or abort
        const { txs } = PSD as LiveQueryContext;
        if (txs || mode === 'readwrite') {
          if (txs) txs.push(idbtrans);
          const ac = new AbortController();
          const { signal } = ac;
          const endTransaction = (wasCommitted: boolean) => () => {
            if (txs) {
              const idx = txs.indexOf(idbtrans);
              if (idx > -1) txs.splice(idx, 1);
            }
            ac.abort();
            if (mode === 'readwrite') {
              for (const storeName of stores) {
                const tblCache = cache[`idb://${dbName}/${storeName}`];
                const table = core.table(storeName);
                if (tblCache) {
                  // Pick optimistic ops that are part of this transaction
                  const ops = tblCache.optimisticOps.filter(
                    (op) => op.trans === idbtrans
                  );
                  if (ops.length > 0) {
                    // Remove them from the optimisticOps array
                    tblCache.optimisticOps = tblCache.optimisticOps.filter(
                      (op) => op.trans !== idbtrans
                    );
                    // Commit or abort the optimistic updates
                    for (const entries of Object.values(
                      tblCache.queries.query
                    )) {
                      for (const entry of entries) {
                        if (
                          entry.res && // if entry.promise but not entry.res, we're fine. Query will resume now and get the result.
                          idbtrans.mutatedParts &&
                          obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)
                        ) {
                          if (wasCommitted && !entry.dirty) {
                            const freezeResults = Object.isFrozen(entry.res);
                            const modRes = applyOptimisticOps(
                              entry.res as any,
                              entry.req,
                              ops,
                              table,
                              entry,
                              freezeResults
                            );
                            if (modRes !== entry.res) {
                              entry.res = modRes;
                              // Update promise
                              entry.promise = DexiePromise.resolve(modRes);
                              // No need to notify subscribers. They already have this value.
                              // We have just updated the value of the cache without having to
                              // requery the database - because we know the result for this
                              // query based on computing the operations and applying them
                              // to the previous result.
                            }
                          } else {
                            if (entry.dirty) {
                              // If the entry is dirty we need to get rid of it so that
                              // a new entry will be created when the query is run again.
                              entries.splice(entries.indexOf(entry), 1);
                            }
                            // If we're not committing, we need to notify subscribers that the
                            // optimistic updates are no longer valid.
                            entry.subscribers.forEach((requery) => requery());
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          };
          idbtrans.addEventListener('abort', endTransaction(false), {
            signal,
          });
          idbtrans.addEventListener('error', endTransaction(false), {
            signal,
          });
          idbtrans.addEventListener('complete', endTransaction(true), {
            signal,
          });
        }
        return idbtrans;
      },
      table(tableName: string) {
        const downTable = core.table(tableName);
        const primKey = downTable.schema.primaryKey;
        return {
          ...downTable,
          mutate(req) {
            if (
              primKey.outbound || // Non-inbound tables are harded to apply optimistic updates on because we can't know primary key of results
              PSD.trans.db._options.cache === 'disabled' // User has opted-out from caching
            ) {
              // Just forward the request to the core.
              return downTable.mutate(req);
            }
            // Find the TblQueryCache for this table:
            const tblCache = cache[`idb://${dbName}/${tableName}`];
            if (tblCache) return downTable.mutate(req);

            // Enque the operation
            tblCache.optimisticOps.push(req);
            const promise = downTable.mutate(req);
            // Signal subscribers that there are mutated parts
            signalSubscribers(tblCache, req.mutatedParts);
            promise.catch(()=> {
              // In case the operation failed, we need to remove it from the optimisticOps array.
              tblCache.optimisticOps.splice(
                tblCache.optimisticOps.indexOf(req),
                1
              );
              signalSubscribers(tblCache, req.mutatedParts); // Signal the rolling back of the operation.
            });
            return promise;
          },
          query(req: DBCoreQueryRequest): Promise<DBCoreQueryResponse> {
            if (!isCachableContext(PSD, downTable)) return downTable.query(req);
            const freezeResults =
              (PSD as LiveQueryContext).trans.db._options.cache === 'immutable';
            const { requery, signal } = PSD as LiveQueryContext;
            let [cacheEntry, exactMatch, tblCache, container] =
              findCompatibleQuery(dbName, tableName, 'query', req);
            if (cacheEntry && exactMatch) {
              cacheEntry.obsSet = req.obsSet; // So that optimistic result is monitored.
              // How? - because observability-middleware will track result where optimistic
              // mutations are applied and record it in the cacheEntry.
            } else {
              // --> TODO here: If not exact match, check if we have a superset to extract
              // the data from.

              // No cached result found. We need to query the database and cache the result.
              const promise = downTable.query(req).then((res) => {
                // Freeze or clone results
                const result = res.result;
                cacheEntry.res = result;
                if (freezeResults) {
                  // For performance reasons don't deep freeze.
                  // Only freeze the top-level array and its items.
                  // This is good enough to teach users that the result must be treated as immutable
                  // without enforcing it recursively on the entire result (which is not even possible
                  // for things like Date objects and typed arrays)
                  for (let i = 0, l = result.length; i < l; ++i) {
                    Object.freeze(result[i]);
                  }
                  Object.freeze(result);
                } else {
                  // If not frozen, we need to clone the result to avoid user mutating the cache
                  // When we do this, user's must feel conformable with the fact that the result
                  // can be mutated deeply - user is not expected to have any respect for immutability.
                  res.result = deepClone(result);
                }
                return res;
              });
              cacheEntry = {
                obsSet: req.obsSet,
                promise,
                subscribers: new Set(),
                type: 'query',
                req,
                dirty: false,
              };
              if (container) {
                container.push(cacheEntry);
              } else {
                container = [];
                if (!tblCache) {
                  tblCache = cache[`idb://${dbName}/${tableName}`] = {
                    queries: {
                      query: {},
                      count: {},
                    },
                    objs: new Map(),
                    optimisticOps: [],
                    unsignaledParts: {}
                  };
                }
                tblCache.queries[req.query.index.name || ''] = container;
              }
            }
            subscribeToCacheEntry(cacheEntry, container, requery, signal);
            return cacheEntry.promise.then((res: DBCoreQueryResponse) => {
              return {
                result: applyOptimisticOps(
                  res.result,
                  req,
                  tblCache?.optimisticOps,
                  downTable,
                  cacheEntry,
                  freezeResults
                ) as any[], // readonly any[]
              };
            });
          },
        };
      },
    };
  },
};

function signalSubscribers(tblCache: TblQueryCache, mutatedParts: ObservabilitySet) {
  extendObservabilitySet(tblCache.unsignaledParts, mutatedParts);
  if (!tblCache.signalTimer) {
    tblCache.signalTimer = setTimeout(() => {
      tblCache.signalTimer = null;
      signalSubscribersNow(tblCache);
    }, 0);
  }
}

function signalSubscribersNow(tblCache: TblQueryCache) {
  for (const entries of Object.values(tblCache.queries.query)) {
    for (const entry of entries) {
      if (entry.obsSet && obsSetsOverlap(entry.obsSet, tblCache.unsignaledParts)) {
        entry.subscribers.forEach((requery) => requery()); // try..catch not needed. subscriber is in live-query.ts
      }
    }
  }
  tblCache.unsignaledParts = {};
}
