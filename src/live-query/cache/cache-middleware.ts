import { LiveQueryContext } from '..';
import type { Transaction } from '../../classes/transaction';
import { getEffectiveKeys } from '../../dbcore/get-effective-keys';
import { deepClone, delArrayItem, setByKeyPath } from '../../functions/utils';
import DexiePromise, { PSD } from '../../helpers/promise';
import { ObservabilitySet } from '../../public/types/db-events';
import {
  DBCore, DBCoreMutateRequest, DBCoreMutateResponse, DBCoreQueryRequest,
  DBCoreQueryResponse
} from '../../public/types/dbcore';
import { Middleware } from '../../public/types/middleware';
import { obsSetsOverlap } from '../obs-sets-overlap';
import { adjustOptimisticFromFailures } from './adjust-optimistic-request-from-failures';
import { applyOptimisticOps } from './apply-optimistic-ops';
import { cache } from './cache';
import { findCompatibleQuery } from './find-compatible-query';
import { isCachableContext } from './is-cachable-context';
import { isCachableRequest } from './is-cachable-request';
import { signalSubscribersLazily } from './signalSubscribers';
import { subscribeToCacheEntry } from './subscribe-cachentry';

export const cacheMiddleware: Middleware<DBCore> = {
  stack: 'dbcore',
  level: 0,
  name: 'Cache',
  create: (core) => {
    const dbName = core.schema.name;
    const coreMW: DBCore = {
      ...core,
      transaction: (stores, mode, options) => {
        const idbtrans = core.transaction(
          stores,
          mode,
          options
        ) as IDBTransaction & {
          mutatedParts?: ObservabilitySet;
          _explicit?: boolean;
        };
        // Maintain TblQueryCache.ops array when transactions commit or abort
        if (mode === 'readwrite') {
          const ac = new AbortController();
          const { signal } = ac;
          const endTransaction = (wasCommitted: boolean) => () => {
            ac.abort();
            if (mode === 'readwrite') {
              // Collect which subscribers to notify:
              const affectedSubscribers = new Set<()=>void>();

              // Go through all tables in transaction and check if they have any optimistic updates
              for (const storeName of stores) {
                const tblCache = cache[`idb://${dbName}/${storeName}`];
                if (tblCache) {
                  const table = core.table(storeName);
                  // Pick optimistic ops that are part of this transaction
                  const ops = tblCache.optimisticOps.filter(
                    (op) => op.trans === idbtrans
                  );
                  // Transaction was marked as _explicit in enterTransactionScope(), transaction-helpers.ts.
                  if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                    // Invalidate all queries that overlap with the mutated parts and signal their subscribers
                    for (const entries of Object.values(
                      tblCache.queries.query
                    )) {
                      for (const entry of entries.slice()) {
                        if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                          delArrayItem(entries, entry); // Remove the entry from the cache so it can be refreshed
                          entry.subscribers.forEach((requery) => affectedSubscribers.add(requery));
                        }
                      }
                    }
                  } else if (ops.length > 0) {
                    // Remove them from the optimisticOps array
                    tblCache.optimisticOps = tblCache.optimisticOps.filter(
                      (op) => op.trans !== idbtrans
                    );
                    // Commit or abort the optimistic updates
                    for (const entries of Object.values(
                      tblCache.queries.query
                    )) {
                      for (const entry of entries.slice()) {
                        if (
                          entry.res != null && // if entry.promise but not entry.res, we're fine. Query will resume now and get the result.
                          idbtrans.mutatedParts/* &&
                          obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)*/
                        ) {
                          if (wasCommitted && !entry.dirty) {
                            const freezeResults = Object.isFrozen(entry.res);
                            const modRes = applyOptimisticOps(
                              entry.res as any[],
                              entry.req,
                              ops,
                              table,
                              entry,
                              freezeResults
                            );
                            if (entry.dirty) {
                              // Found out at this point that the entry is dirty - not to rely on!
                              delArrayItem(entries, entry);
                              entry.subscribers.forEach((requery) => affectedSubscribers.add(requery));
                            } else if (modRes !== entry.res) {
                              entry.res = modRes;
                              // Update promise
                              entry.promise = DexiePromise.resolve({result: modRes} satisfies DBCoreQueryResponse);
                              
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
                              delArrayItem(entries, entry);
                            }
                            // If we're not committing, we need to notify subscribers that the
                            // optimistic updates are no longer valid.
                            entry.subscribers.forEach((requery) => affectedSubscribers.add(requery));
                          }
                        }
                      }
                    }
                  }
                }
              }
              affectedSubscribers.forEach((requery) => requery());
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
        const tableMW = {
          ...downTable,
          mutate(req: DBCoreMutateRequest): Promise<DBCoreMutateResponse> {
            const trans = PSD.trans as Transaction;
            if (
              primKey.outbound || // Non-inbound tables are harded to apply optimistic updates on because we can't know primary key of results
              trans.db._options.cache === 'disabled' || // User has opted-out from caching
              trans.explicit || // It's an explicit write transaction being made. Don't affect cache until transaction commits.
              trans.idbtrans.mode !== 'readwrite' // We only handle 'readwrite' in our transaction override. 'versionchange' transactions don't use cache (from populate or upgraders).
            ) {
              // Just forward the request to the core.
              return downTable.mutate(req);
            }
            // Find the TblQueryCache for this table:
            const tblCache = cache[`idb://${dbName}/${tableName}`];
            if (!tblCache) return downTable.mutate(req);

            const promise = downTable.mutate(req);
            if ((req.type === 'add' || req.type === 'put') && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(key => key == null))) {
              // There are some autoIncremented keys not set yet. Need to wait for completion before we can reliably enqueue the operation.
              // (or there are too many objects so we lazy out to avoid performance bottleneck for large bulk inserts)
              promise.then((res) => { // We need to extract result keys and generate cloned values with the keys set (so that applyOptimisticOps can work)
                // But we have a problem! The req.mutatedParts is still not complete so we have to actively add the keys to the unsignaledParts set manually.
                const reqWithResolvedKeys = {
                  ...req,
                  values: req.values.map((value, i) => {
                    if (res.failures[i]) return value; // No need to rewrite a failing value
                    const valueWithKey = primKey.keyPath?.includes('.')
                      ? deepClone(value)
                      : {
                        ...value,
                      };
                    setByKeyPath(valueWithKey, primKey.keyPath, res.results![i]);
                    return valueWithKey;
                  })
                };
                const adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                tblCache.optimisticOps.push(adjustedReq);
                // Signal subscribers after the observability middleware has complemented req.mutatedParts with the new keys.
                // We must queue the task so that we get the req.mutatedParts updated by observability middleware first.
                // If we refactor the dependency between observability middleware and this middleware we might not need to queue the task.
                queueMicrotask(()=>req.mutatedParts && signalSubscribersLazily(req.mutatedParts)); // Reason for double laziness: in user awaits put and then does another put, signal once.
              });
            } else {
              // Enque the operation immediately
              tblCache.optimisticOps.push(req);
              // Signal subscribers that there are mutated parts
              req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
              promise.then((res) => {
                if (res.numFailures > 0) {
                  // In case the operation failed, we need to remove it from the optimisticOps array.
                  delArrayItem(tblCache.optimisticOps, req);
                  const adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                  if (adjustedReq) {
                    tblCache.optimisticOps.push(adjustedReq);
                  }
                  req.mutatedParts && signalSubscribersLazily(req.mutatedParts); // Signal the rolling back of the operation.
                }
              });
              promise.catch(()=> {
                // In case the operation failed, we need to remove it from the optimisticOps array.
                delArrayItem(tblCache.optimisticOps, req);
                req.mutatedParts && signalSubscribersLazily(req.mutatedParts); // Signal the rolling back of the operation.
              });
            }
            return promise;
          },
          query(req: DBCoreQueryRequest): Promise<DBCoreQueryResponse> {
            if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req)) return downTable.query(req);
            const freezeResults =
              (PSD as LiveQueryContext).trans?.db._options.cache === 'immutable';
            const { requery, signal } = PSD as LiveQueryContext;
            let [cacheEntry, exactMatch, tblCache, container] =
              findCompatibleQuery(dbName, tableName, 'query', req);
            if (cacheEntry && exactMatch) {
              cacheEntry.obsSet = req.obsSet!; // So that optimistic result is monitored.
              // How? - because observability-middleware will track result where optimistic
              // mutations are applied and record it in the cacheEntry.
              // TODO: CHANGE THIS! The difference is resultKeys only.
              // Wanted behavior:
              //  * cacheEntry obsSet should represent the obsSet without optimistic updates (so it can be checked when merging ops in tx commit)
              //  * cacheEntry optimisticObsSet should represent the obsSet with current optimistic updates. It should be updated when adding an op
              //    by adding the primary keys of the put/add/delete operation to the set.
              //  * observability-middleware should stop recording req.obsSet when a cache entry exact match is found because it won't be used anyway.
              // I'm thinking of merging observability-middleware with cache-middleware into one single middleware because the dependencies are too
              // tight between them.
            } else {
              // --> TODO here: If not exact match, check if we have a superset to extract
              // the data from.

              // No cached result found. We need to query the database and cache the result.
              const promise = downTable.query(req).then((res) => {
                // Freeze or clone results
                const result = res.result;
                if (cacheEntry) cacheEntry.res = result;
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
              }).catch(error => {
                // In case the query operation failed, we need to remove it from the cache
                // so that subsequent calls does not get the same error but re-evaluate
                // the query.
                if (container && cacheEntry) delArrayItem(container, cacheEntry);
                return Promise.reject(error);
              });
              cacheEntry = {
                obsSet: req.obsSet!,
                promise,
                subscribers: new Set(),
                type: 'query',
                req,
                dirty: false,
              };
              if (container) {
                container.push(cacheEntry);
              } else {
                container = [cacheEntry];
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
                tblCache.queries.query[req.query.index.name || ''] = container;
              }
            }
            subscribeToCacheEntry(cacheEntry, container!, requery, signal);
            return cacheEntry.promise.then((res: DBCoreQueryResponse) => {
              return {
                result: applyOptimisticOps(
                  res.result,
                  req,
                  tblCache?.optimisticOps,
                  downTable,
                  cacheEntry!,
                  freezeResults
                ) as any[], // readonly any[]
              };
            });
          },
        };
        return tableMW;
      },
    };
    return coreMW;
  },
};


