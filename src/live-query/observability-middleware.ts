import { LiveQueryContext } from ".";
import { getFromTransactionCache } from "../dbcore/cache-existing-values-middleware";
import { getEffectiveKeys } from "../dbcore/get-effective-keys";
import { exceptions } from "../errors";
import { cmp } from "../functions/cmp";
import { isArray, keys } from "../functions/utils";
import { PSD } from "../helpers/promise";
import { RangeSet } from "../helpers/rangeset";
import { ObservabilitySet } from "../public/types/db-events";
import {
  DBCore,
  DBCoreCountRequest,
  DBCoreCursor,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreIndex,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreTable,
  DBCoreTableSchema,
  DBCoreTransaction,
} from "../public/types/dbcore";
import { Middleware } from "../public/types/middleware";
import { isCachableContext } from "./cache/is-cachable-context";
import { isCachableRequest } from "./cache/is-cachable-request";
import { extendObservabilitySet } from "./extend-observability-set";

export const observabilityMiddleware: Middleware<DBCore> = {
  stack: "dbcore",
  level: 0,
  name: "Observability",
  create: (core) => {
    const dbName = core.schema.name;
    const FULL_RANGE = new RangeSet(core.MIN_KEY, core.MAX_KEY);

    return {
      ...core,
      transaction: (stores, mode, options) => {
        if (PSD.subscr && mode !== 'readonly') {
          throw new exceptions.ReadOnly(`Readwrite transaction in liveQuery context. Querier source: ${(PSD as LiveQueryContext).querier}`);
        }
        return core.transaction(stores, mode, options);
      },
      table: (tableName) => {
        const table = core.table(tableName);
        const { schema } = table;
        const { primaryKey, indexes } = schema;
        const { extractKey, outbound } = primaryKey;
        const indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(
          (index) => index.compound && (index.keyPath as string[]).includes(primaryKey.keyPath as string)
        );
        const tableClone: DBCoreTable = {
          ...table,
          mutate: (req) => {
            const trans = req.trans as DBCoreTransaction & {
              mutatedParts?: ObservabilitySet;
            };
            const mutatedParts = req.mutatedParts || (req.mutatedParts = {});
            const getRangeSet = (indexName: string) => {
              const part = `idb://${dbName}/${tableName}/${indexName}`;
              return (mutatedParts[part] ||
                (mutatedParts[part] = new RangeSet())) as RangeSet;
            };
            const pkRangeSet = getRangeSet("");
            const delsRangeSet = getRangeSet(":dels");

            const { type } = req;
            let [keys, newObjs] =
              req.type === "deleteRange"
                ? [req.range] // keys will be an DBCoreKeyRange object - transformed later on to a [from,to]-style range.
                : req.type === "delete"
                ? [req.keys] // keys known already here. newObjs will be undefined.
                : req.values.length < 50
                ? [getEffectiveKeys(primaryKey, req).filter(id => id), req.values] // keys except autoIncremented - they will be added later on.
                : []; // keys and newObjs will both be undefined - changeSpec will become true (changed for entire table)

            const oldCache = req.trans["_cache"];

            // Add the mutated table and optionally keys to the mutatedTables set on the transaction.
            // Used by subscribers to txcommit event and for Collection.prototype.subscribe().
            if (isArray(keys)) {
              // keys is an array - delete, add or put of less than 50 rows.
              // Individual keys (add put or delete)
              pkRangeSet.addKeys(keys);
              // Only get oldObjs if they have been cached recently
              // (This applies to Collection.modify() only, but also if updating/deleting hooks have subscribers)
              const oldObjs = type === 'delete' || keys.length === newObjs.length ? getFromTransactionCache(keys, oldCache) : null;

              // Supply detailed values per index for both old and new objects:
              if (!oldObjs) {
                // add, delete or put and we don't know old values.
                // Indicate this in the ":dels" part, for the sake of count() and primaryKeys() queries only!
                delsRangeSet.addKeys(keys);
              }
              if (oldObjs || newObjs) {
                // No matter if knowning oldObjs or not, track the indices if it's a put, add or delete.
                trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
              }
            } else if (keys) {
              // keys is a DBCoreKeyRange object. Transform it to [from,to]-style range.
              // As we can't know deleted index ranges, mark index-based subscriptions must trigger.
              // (above/below-style ranges are not supported in RangeSet.ts, so we must replace open ends
              // with core.MIN_KEY and core.MAX_KEY respectively. This is what solves issue #2067!
              const range = {
                from: keys.lower ?? core.MIN_KEY,
                to: keys.upper ?? core.MAX_KEY
              };
              delsRangeSet.add(range);
              // deleteRange. keys is a DBCoreKeyRange objects. Transform it to [from,to]-style range.
              pkRangeSet.add(range);
            } else {
              // Too many requests to record the details without slowing down write performance.
              // Let's just record a generic large range on primary key, the virtual :dels index and
              // all secondary indices:
              pkRangeSet.add(FULL_RANGE);
              delsRangeSet.add(FULL_RANGE);
              schema.indexes.forEach(idx => getRangeSet(idx.name).add(FULL_RANGE));
            }

            return table.mutate(req).then((res) => {
              // Merge the mutated parts from the request into the transaction's mutatedParts
              // now when the request went fine.
              if (keys && (req.type === 'add' || req.type === 'put')) {
                // Less than 50 requests (keys truthy) (otherwise we've added full range anyway)
                // autoincrement means we might not have got all keys until now
                pkRangeSet.addKeys(res.results);
                if (indexesWithAutoIncPK) {
                  // Dexie Issue 1946:
                  // If an auto-incremented primary key is part of a compound index,
                  // we need to compute the resulting value of that index after inserting
                  // the rows.
                  indexesWithAutoIncPK.forEach(idx => {
                    // Extract values of this compound index where primary key is not yet set:
                    const idxVals = req.values.map(v => idx.extractKey(v));
                    // Find the position of the primary key in the index:
                    const pkPos = (idx.keyPath as string[]).findIndex(prop => prop === primaryKey.keyPath);
                    // Update idxVals with the resulting primary keys to complete the index value:
                    for (let i = 0, len = res.results!.length; i < len; ++i) {
                      idxVals[i][pkPos] = res.results![i];
                    }
                    // Add the updated index to the rangeset:
                    getRangeSet(idx.name).addKeys(idxVals);
                  });
                }
              }
              trans.mutatedParts = extendObservabilitySet (
                trans.mutatedParts || {},
                mutatedParts
              );
              return res;
            });
          },
        };

        const getRange: (req: any) => [DBCoreIndex, RangeSet] = ({
          query: { index, range },
        }:
          | DBCoreQueryRequest
          | DBCoreCountRequest
          | DBCoreOpenCursorRequest) => [
          index,
          new RangeSet(range.lower ?? core.MIN_KEY, range.upper ?? core.MAX_KEY),
        ];

        const readSubscribers: {[method in
          Exclude<keyof DBCoreTable, "name" | "schema" | "mutate">]: 
          (req: any) => [DBCoreIndex, RangeSet]
        } = {
          get: (req) => [primaryKey, new RangeSet(req.key)],
          getMany: (req) => [primaryKey, new RangeSet().addKeys(req.keys)],
          count: getRange,
          query: getRange,
          openCursor: getRange,
        }

        keys(readSubscribers).forEach((method: 'get' | 'getMany' | 'count' | 'query' | 'openCursor') => {
          tableClone[method] = function (
            req:
              | DBCoreGetRequest
              | DBCoreGetManyRequest
              | DBCoreQueryRequest
              | DBCoreCountRequest
              | DBCoreOpenCursorRequest
          ) {
            const { subscr } = PSD as LiveQueryContext;
            const isLiveQuery = !!subscr;
            let cachable = isCachableContext(PSD as LiveQueryContext, table) && isCachableRequest(method, req);
            const obsSet = cachable
              ? req.obsSet = {} // Implicit read transaction - track changes for this query only for the request's duration
              : subscr; // Explicit read transaction - track changes across entire live query

            if (isLiveQuery) {
              // Current zone want's to track all queries so they can be subscribed to.
              // (The query is executed within a "liveQuery" zone)
              // Check whether the query applies to a certain set of ranges:
              // Track what we should be observing:
              const getRangeSet = (indexName: string) => {
                const part = `idb://${dbName}/${tableName}/${indexName}`;
                return (obsSet[part] ||
                  (obsSet[part] = new RangeSet())) as RangeSet;
              };
              const pkRangeSet = getRangeSet("");
              const delsRangeSet = getRangeSet(":dels");
              const [queriedIndex, queriedRanges] = readSubscribers[method](req);
              // A generic rule here: queried ranges should always be subscribed to.
              if (method === 'query' && queriedIndex.isPrimaryKey && !(req as DBCoreQueryRequest).values) {
                // A pure primay-key based Collection where only .primaryKeys() is requested. Don't wakeup on other changes than added or deleted primary keys within queried range.
                delsRangeSet.add(queriedRanges);
              } else {
                getRangeSet(queriedIndex.name || "").add(queriedRanges);
              }
              if (!queriedIndex.isPrimaryKey) {
                // Only count(), query() and openCursor() operates on secondary indices.
                // Since put(), delete() and deleteRange() mutations may happen without knowing oldObjs,
                // the mutate() method will be missing what secondary indices that are being deleted from
                // the subscribed range. We are working around this issue by recording all the resulting
                // primary keys from the queries. This only works for those kinds of queries where we can
                // derive the primary key from the result.
                // In this block we are accomplishing this using various strategies depending on the properties
                // of the query result.

                if (method === "count") {
                  // We've got a problem! Delete and put mutations happen without known the oldObjs.
                  // Those mutation could change the count.
                  // Solution: Dedicated ":dels" url represends a subscription to all mutations without oldObjs
                  // (specially triggered in the mutators put(), delete() and deleteRange() when they don't know oldObject)
                  delsRangeSet.add(FULL_RANGE);
                } else {
                  // openCursor() or query()

                  // Prepare a keysPromise in case the we're doing an IDBIndex.getAll() on a store with outbound keys.
                  const keysPromise =
                    method === "query" &&
                    outbound &&
                    (req as DBCoreQueryRequest).values &&
                    table.query({
                      ...(req as DBCoreQueryRequest),
                      values: false,
                    });

                  return table[method].apply(this, arguments).then((res) => {
                    if (method === "query") {
                      if (outbound && (req as DBCoreQueryRequest).values) {
                        // If keys are outbound, we can't use extractKey to map what keys to observe.
                        // We've queried an index (like 'dateTime') on an outbound table
                        // and retrieve a list of objects
                        // from who we cannot know their primary keys.
                        // "Luckily" though, we've prepared the keysPromise to assist us in exact this condition.
                        return keysPromise.then(
                          ({ result: resultingKeys }: DBCoreQueryResponse) => {
                            pkRangeSet.addKeys(resultingKeys);
                            return res;
                          }
                        );
                      }
                      // query() inbound values, keys or outbound keys. Secondary indexes only since
                      // for primary keys we would only add results within the already registered range.
                      const pKeys = (req as DBCoreQueryRequest).values
                        ? (res as DBCoreQueryResponse).result.map(extractKey)
                        : (res as DBCoreQueryResponse).result;
                      if ((req as DBCoreQueryRequest).values) {
                        // Subscribe to any mutation made on the returned keys,
                        // so that we detect both deletions and updated properties.
                        pkRangeSet.addKeys(pKeys);
                      } else {
                        // Subscribe only to mutations on the returned keys
                        // in case the mutator was unable to know oldObjs.
                        // If it has oldObj, the mutator won't put anything in ":dels" because
                        // it can more fine-grained put the exact removed and added index value in the correct
                        // index range that we subscribe to in the queried range sets.
                        // We don't load values so a change on a property outside our index will not
                        // require us to re-execute the query.
                        delsRangeSet.addKeys(pKeys);
                      }
                    } else if (method === "openCursor") {
                      // Caller requests a cursor.
                      // For the same reason as when method==="query", we only need to observe
                      // those keys whose values are possibly used or rendered - which could
                      // only happen on keys where they get the cursor's key, primaryKey or value.
                      const cursor: DBCoreCursor | null = res;
                      const wantValues = (req as DBCoreOpenCursorRequest).values;
                      return (
                        cursor &&
                        Object.create(cursor, {
                          key: {
                            get() {
                              delsRangeSet.addKey(cursor.primaryKey);
                              return cursor.key;
                            },
                          },
                          primaryKey: {
                            get() {
                              const pkey = cursor.primaryKey;
                              delsRangeSet.addKey(pkey);
                              return pkey;
                            },
                          },
                          value: {
                            get() {
                              wantValues && pkRangeSet.addKey(cursor.primaryKey);
                              return cursor.value;
                            },
                          },
                        })
                      );
                    }
                    return res;
                  });
                }
              }
            }
            return table[method].apply(this, arguments);
          };
        });
        return tableClone;
      },
    };
  },
};

function trackAffectedIndexes(
  getRangeSet: (index: string) => RangeSet,
  schema: DBCoreTableSchema,
  oldObjs: readonly any[] | undefined,
  newObjs: readonly any[] | undefined
) {
  function addAffectedIndex(ix: DBCoreIndex) {
    const rangeSet = getRangeSet(ix.name || "");
    function extractKey(obj: any) {
      return obj != null ? ix.extractKey(obj) : null;
    }
    const addKeyOrKeys = (key: any) => ix.multiEntry && isArray(key)
      // multiEntry and the old property was an array - add each array entry to the rangeSet:
      ? key.forEach(key => rangeSet.addKey(key))
      // Not multiEntry or the old property was not an array - add each array entry to the rangeSet:
      : rangeSet.addKey(key);

    (oldObjs || newObjs).forEach((_, i) => {
      const oldKey = oldObjs && extractKey(oldObjs[i]);
      const newKey = newObjs && extractKey(newObjs[i]);
      if (cmp(oldKey, newKey) !== 0) {
        // The index has changed. Add both old and new value of the index.
        if (oldKey != null) addKeyOrKeys(oldKey); // If oldKey is invalid key, addKey() will be a noop.
        if (newKey != null) addKeyOrKeys(newKey); // If newKey is invalid key, addKey() will be a noop.
      }
    });
  }
  schema.indexes.forEach(addAffectedIndex);
}
