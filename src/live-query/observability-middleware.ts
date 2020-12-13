import { domDeps } from "../classes/dexie/dexie-dom-dependencies";
import { getFromTransactionCache } from "../dbcore/cache-existing-values-middleware";
import { cmp } from "../functions/cmp";
import { getMaxKey } from "../functions/quirks";
import { isArray } from "../functions/utils";
import { minKey } from "../globals/constants";
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
import { RangeBtreeNode } from "../public/types/rangeset";

// part in ObservabilitySet is a URL like path including dbName, tableName and index
//
//`idb://${dbName}/${tableName}/` // MUT: Updated property: record the key. SUB: If values requested, record keys.
//`idb://${dbName}/${tableName}/:dels` // MUT: put or delete without having oldVal: record FULL_RANGE here.
//`idb://${dbName}/${tableName}/${indexName | ''}`;
// MUT: add: value of new idx
//      put: record both oldIdx & newIdx (or should we only record idxes if they change?)
//           if not have old: record FULL_RANGE in :dels and record the newIdx here. (for count!)
//      del: value of old idx
//           if not have old: record FULL_RANGE in :dels.
// SUB:
//    count on secondary index:
//      ":dels" (FULL) + the index: queried range.
//    count on primary key:
//      "": queried range
//    primaryKeys on 2ndary index:
//      index: queried range + "" - all returned keys.
//    primaryKeys on primary key range:
//      "": queried range only.
//    query values on 2ndary index:
//      index: queried range + "" - all returned keys.
//    query values on primary key range with possible limit:
//      "": sub range: [from, lastKey] or just all returned keys.
//    query outbound values on secondary index range:
//      request keys also! and record them in "".
//    query outbound values on primaryKey range:
//      "" - queried range!
//    openCursor values on secondary index (inbound and outbound):
//      index: queried range + "" - all keys of accessed cursor.key or cursor.value.
//    openCursor values on primary key
//      "" - all keys of accessed cursor.key or cursor.value.

// Testing query values or values:
//db.friends.where('age').between(20, 30).toArray(); // SUB: {age: 20-30, "": 10, 11, 13}
//db.friends.where('age').between(20, 30).primaryKeys(); // SUB: {age: 20-30, "": 10, 11, 13}
//db.friends.delete(7); // MUT: {"": 7, ":dels": FULL} --> ingen update. 7 not in "".
//db.friends.delete(11); // MUT: {"": 11, ":dels": FULL} --> update because of match in "" (11).
//db.friends.add({ name: 'Foo', age: 19 }); //MUT: {"": 14, name: "Foo", age: 19} -->
//                                               age not in range, keys not in range --> no update.
//db.friends.add({ name: 'Foo2', age: 25 }); //MUT: {"": 15, name: "Foo2", age: 25} -->
//                                               age in range, keys not in range --> update!
//db.friends.update(14, { name: '_Foo' }); // MUT: {"": 14, name: "Foo","_Foo", age: 19} -->
//                                               age not in range, keys not in range --> no update.
//db.friends.update(15, { name: '_Foo2' }); // MUT: {"": 15, name: "Foo2","_Foo2", age: 25} -->
//                                               age in range, keys in range --> update!

// Testing count():
//db.friends.where('age').between(20, 30).count(); // SUB: {age: 20-30, ":dels": FULL}
//db.friends.delete(7); // MUT: {"": 7, ":dels": FULL} --> update! ":dels" match. (false positive but OK!)
//db.friends.delete(11); // MUT: {"": 11, ":dels": FULL} --> update! ":dels" match. Correct!
//db.friends.add({ name: 'Foo', age: 19 }); //MUT: {"": 14, name: "Foo", age: 19} -->
//                                               age not in range, no ":dels" --> no update (CORRECT!)
//db.friends.add({ name: 'Foo2', age: 25 }); //MUT: {"": 15, name: "Foo2", age: 25} -->
//                                               age in range, no ":dels" --> update! (CORRECT!)

export const FULL_RANGE = new RangeSet(minKey, getMaxKey(domDeps.IDBKeyRange));

export const observabilityMiddleware: Middleware<DBCore> = {
  stack: "dbcore",
  level: 0,
  create: (core) => {
    const dbName = core.schema.name;

    return {
      ...core,
      table: (tableName) => {
        const table = core.table(tableName);
        const { schema } = table;
        const { primaryKey } = schema;
        const { extractKey, outbound } = primaryKey;
        /*const extendTableObservation = (
          target: ObservabilitySet,
          index: string,
          ranges: RangeBtree
        ) => {
          const part = `idb://${dbName}/${tableName}/${index}`;
          const os: ObservabilitySet = {};
          os[part] = ranges;
          extendObservabilitySet(target, os);
          return target[part];
        };
        const addKeys = (target: ObservabilitySet, keys: any[]) => {
          extendTableObservation(target, "", new RangeSet().addKeys(keys));
        };*/

        const tableClone: DBCoreTable = {
          ...table,
          mutate: (req) => {
            const trans = req.trans as DBCoreTransaction & {
              mutatedParts?: ObservabilitySet;
            };
            const mutatedParts =
              trans.mutatedParts || (trans.mutatedParts = {});
            const getRangeSet = (indexName: string) => {
              const part = `idb://${dbName}/${tableName}/${indexName}`;
              return (mutatedParts[part] ||
                (mutatedParts[part] = new RangeSet())) as RangeSet;
            };
            const pkRangeSet = getRangeSet("");

            const { type } = req;
            let [keys, newObjs] =
              req.type === "deleteRange"
                ? [req.range] // keys will be an DBCoreKeyRange object - transformed later on to a [from,to]-style range.
                : req.type === "delete"
                ? [req.keys] // keys known already here. newObjs will be undefined.
                : req.values.length < 50
                ? [[], req.values] // keys = empty array - will be resolved in mutate().then(...).
                : []; // keys and newObjs will both be undefined - changeSpec will become true (changed for entire table)
            const oldCache = req.trans["_cache"];
            return table.mutate(req).then((res) => {
              // Add the mutated table and optionally keys to the mutatedTables set on the transaction.
              // Used by subscribers to txcommit event and for Collection.prototype.subscribe().
              if (isArray(keys)) {
                if (type !== "delete") keys = res.results;
                // individual keys (add put or delete)
                pkRangeSet.addKeys(keys);
                // Only get oldObjs if they have been cached recently
                // (This applies to Collection.modify() only, but also if updating/deleting hooks have subscribers)
                const oldObjs = getFromTransactionCache(keys, oldCache);

                // Supply detailed values per index for both old and new objects:
                if (!oldObjs && type !== "add") {
                  // delete or put and we don't know old values.
                  // Indicate this in the ":dels" part, for the sake of count() queries only!
                  getRangeSet(":dels").add(FULL_RANGE);
                } else {
                  trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                }
              } else if (keys) {
                // As we can't know deleted index ranges, mark index-based subscriptions must trigger.
                getRangeSet(":dels").add(FULL_RANGE);
                // deleteRange. keys is a DBCoreKeyRange objects. Transform it to [from,to]-style range.
                pkRangeSet.add({ from: keys.lower, to: keys.upper });
              } else {
                // Too many requests to record the details without slowing down write performance.
                // Let's just record a generic large range
                pkRangeSet.add(FULL_RANGE);
                getRangeSet(":dels").add(FULL_RANGE);
              }
              return res;
            });
          },
        };

        const getKey = (req: DBCoreGetRequest) => [
          primaryKey,
          new RangeSet(req.key),
        ];
        const getKeys = (req: DBCoreGetManyRequest) => [
          primaryKey,
          new RangeSet().addKeys(req.keys),
        ];
        const getRange = ({
          query: { index, range },
        }:
          | DBCoreQueryRequest
          | DBCoreCountRequest
          | DBCoreOpenCursorRequest) => [
          index,
          new RangeSet(range.lower, range.upper),
        ];

        const readSubscribers: [
          Exclude<keyof DBCoreTable, "name" | "schema" | "mutate">,
          (req: any) => [DBCoreIndex, RangeSet]
        ][] = [
          ["get", getKey as (req: any) => [DBCoreIndex, RangeSet]],
          ["getMany", getKeys as (req: any) => [DBCoreIndex, RangeSet]],
          ["count", getRange as (req: any) => [DBCoreIndex, RangeSet]],
          ["query", getRange as (req: any) => [DBCoreIndex, RangeSet]],
          ["openCursor", getRange as (req: any) => [DBCoreIndex, RangeSet]],
        ];

        readSubscribers.forEach(([method, getQueriedRanges]) => {
          tableClone[method] = function (
            req:
              | DBCoreGetRequest
              | DBCoreGetManyRequest
              | DBCoreQueryRequest
              | DBCoreCountRequest
              | DBCoreOpenCursorRequest
          ) {
            const { subscr } = PSD;
            if (subscr) {
              // Current zone want's to track all queries so they can be subscribed to.
              // (The query is executed within a "liveQuery" zone)
              // Check whether the query applies to a certain set of ranges:
              // Track what we should be observing:
              const getRangeSet = (indexName: string) => {
                const part = `idb://${dbName}/${tableName}/${indexName}`;
                return (subscr[part] ||
                  (subscr[part] = new RangeSet())) as RangeSet;
              };
              const pkRangeSet = getRangeSet("");
              const [queriedIndex, queriedRanges] = getQueriedRanges(req);
              // A generic rule here: queried ranges should always be subscribed to.
              getRangeSet(queriedIndex.name || "").add(queriedRanges);
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
                  getRangeSet(":dels").add(FULL_RANGE);
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
                      pkRangeSet.addKeys(
                        (req as DBCoreQueryRequest).values
                          ? (res as DBCoreQueryResponse).result.map(extractKey)
                          : (res as DBCoreQueryResponse).result
                      );
                    } else if (method === "openCursor") {
                      // Caller requests a cursor.
                      // For the same reason as when method==="query", we only need to observe
                      // those keys whose values are possibly used or rendered - which could
                      // only happen on keys where they get the cursor's key, primaryKey or value.
                      const cursor: DBCoreCursor | null = res;
                      return (
                        cursor &&
                        Object.create(cursor, {
                          key: {
                            get() {
                              pkRangeSet.addKey(cursor.primaryKey);
                              return cursor.key;
                            },
                          },
                          primaryKey: {
                            get() {
                              const pkey = cursor.primaryKey;
                              pkRangeSet.addKey(pkey);
                              return pkey;
                            },
                          },
                          value: {
                            get() {
                              pkRangeSet.addKey(cursor.primaryKey);
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
  oldObjs: any[] | undefined,
  newObjs: any[] | undefined
) {
  function addAffectedIndex(ix: DBCoreIndex) {
    const rangeSet = getRangeSet(ix.name || "");
    function extractKey(obj: any) {
      return obj != null ? ix.extractKey(obj) : null;
    }
    (oldObjs || newObjs).forEach((_, i) => {
      const oldKey = oldObjs && extractKey(oldObjs[i]);
      const newKey = newObjs && extractKey(newObjs[i]);
      if (cmp(oldKey, newKey) !== 0) {
        oldKey && rangeSet.addKey(oldKey);
        newKey && rangeSet.addKey(newKey);
      }
    });
  }
  schema.indexes.forEach(addAffectedIndex);
}
