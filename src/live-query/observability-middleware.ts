import { getFromTransactionCache } from "../dbcore/cache-existing-values-middleware";
import { cmp } from "../functions/cmp";
import { isArray } from "../functions/utils";
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
  DBCoreKeyRange,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreTable,
  DBCoreTableSchema,
  DBCoreTransaction,
} from "../public/types/dbcore";
import { Middleware } from "../public/types/middleware";
import { extendObservabilitySet } from "./extend-observability-set";

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
        const extendTableObservation = (
          target: ObservabilitySet,
          tableChanges: ObservabilitySet[string][string]
        ) => {
          extendObservabilitySet(target, {
            [dbName]: { [tableName]: tableChanges },
          });
          return target[dbName][tableName];
        };

        const tableClone: DBCoreTable = {
          ...table,
          mutate: (req) => {
            const { type } = req;
            let [keys, newObjs] =
              req.type === "deleteRange"
                ? [req.range] // keys will be an DBCoreKeyRange object - transformed later on to a [from,to]-style range.
                : req.type === "delete"
                ? [req.keys] // keys known already here. newObjs will be undefined.
                : req.values.length < 50
                ? [[], req.values] // keys = empty array - will be resolved in mutate().then(...).
                : []; // keys and newObjs will both be undefined - changeSpec will become true (changed for entire table)
            const trans = req.trans as DBCoreTransaction & {
              mutatedParts?: ObservabilitySet;
            };
            const oldCache = req.trans["_cache"];
            return table.mutate(req).then((res) => {
              // Add the mutated table and optionally keys to the mutatedTables set on the transaction.
              // Used by subscribers to txcommit event and for Collection.prototype.subscribe().
              let changeSpec: true | ObservabilitySet[string][string] = true;
              if (isArray(keys)) {
                if (type !== "delete") keys = res.results;
                // individual keys (add put or delete)
                changeSpec = {
                  keys: new RangeSet().addKeys(keys),
                };
                // Only get oldObjs if they have been cached recently
                // (This applies to Collection.modify() only, but also if updating/deleting hooks have subscribers)
                const oldObjs = getFromTransactionCache(keys, oldCache);

                // Supply detailed values per index for both old and new objects:
                changeSpec.indexes =
                  oldObjs || type === "add"
                    ? getAffectedIndexes(schema, oldObjs, newObjs)
                    : true; // Mark that index subscriptions must trigger - we can't know if ranges are affected
              } else if (keys) {
                // deleteRange. keys is a DBCoreKeyRange objects. Transform it to [from,to]-style range.
                changeSpec = {
                  keys: new RangeSet(keys.lower, keys.upper),
                  indexes: true, // As we can't know deleted index ranges, mark index-based subscriptions must trigger.
                };
              }
              if (!trans.mutatedParts) trans.mutatedParts = {};
              extendTableObservation(trans.mutatedParts, changeSpec);
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
              const [queriedIndex, queriedRanges] = getQueriedRanges(req);
              const observationPart = extendTableObservation(subscr, {
                keys: new RangeSet(),
                indexes: {
                  [queriedIndex.name || ""]: queriedRanges,
                },
              }) as
                | true
                | {
                    keys: RangeSet;
                    indexes: true | { [indexName: string]: RangeSet };
                  };
              if (observationPart !== true) {
                // Still idea to track changes ...
                // If observationPart would have been true, another query has been put making it impossible
                // to track detailed changes.
                if (method === "get" || method === "getMany") {
                  // If getting specific keys, we should not only record the observed rangeset
                  // but also the observed "keys" for the same reason as we record the results
                  // of "query" and "openCursor" - in case a property of a retrieved object is
                  // changed without the primary key being changed, we must wake up and re-
                  // launch the query.
                  observationPart.keys.add(queriedRanges);
                } else {
                  return table[method].apply(this, arguments).then((res) => {
                    if (
                      (req as DBCoreQueryRequest | DBCoreOpenCursorRequest)
                        .values // Caller want's values, not just keys
                    ) {
                      if (method === "query") {
                        if (outbound) {
                          // If keys are outbound, we can't use extractKey to map what keys to observe.
                          // On the other hand, if the query was put on the keys was based on keys query,
                          // we can reuse that since it will cover the entire range of possible keys
                          if (queriedIndex.isPrimaryKey) {
                            observationPart.keys.add(queriedRanges);
                          } else {
                            // We've queried an index (like 'dateTime') on an outbound table
                            // and retrieve a list of objects
                            // from who we cannot know their primary keys.
                            // There's no way to detect whether a mutation like
                            // db.myOutboundTable.update(id, {name: "Foo"}) would affect us since
                            // the "dateTime" index wouldn't be notified.
                            // So we really need to mark this
                            // entire table 'true' which means any mutation on it will re-launch our
                            // query.
                            extendTableObservation(subscr, true);
                          }
                        } else {
                          // We have inbound keys which makes it possible to know the primary keys
                          // of all returned items.
                          // Even though we're already observing the queried index- or key-range,
                          // we must also get notified when something mutates that could affect
                          // what would be returned in the results.
                          // That's why we are observing each individual key of the result.
                          // Use case:
                          //  Query: db.friends.where('age').between(20, 30)
                          //  Mutation: db.friends.update(id, {fooProp: "Foo"});
                          // Age index doesn't change but the query has to be re-launched to get
                          // the new version of the objects with the changed property on one of them.
                          observationPart.keys.addKeys(
                            (res as DBCoreQueryResponse).result.map(extractKey)
                          );
                        }
                      } else if (method === "openCursor") {
                        // Caller requests a cursor.
                        // For the same reason as when method==="query", we only need to observe
                        // those keys whose values are possibly used or rendered - which could
                        // only happen on keys where they get the cursor's value.
                        // For example if they put a query anyOf(), equalsIgnoreCase() etc,
                        // that may use a cursor to be fulfilled, the cursor will not access
                        // the value getter on every record the cursor lands on - only the ones
                        // that match the algorithm-based query.
                        const cursor: DBCoreCursor | null = res;
                        return (
                          cursor &&
                          Object.create(cursor, {
                            value: {
                              get: () => {
                                observationPart.keys.addKey(cursor.key);
                                return cursor.value;
                              },
                            },
                          })
                        );
                      }
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

function getAffectedIndexes(
  schema: DBCoreTableSchema,
  oldObjs: any[] | undefined,
  newObjs: any[] | undefined
) {
  const result: { [indexName: string]: RangeSet } = {};
  function addAffectedIndex(ix: DBCoreIndex) {
    function extractKey(obj: any) {
      return obj != null ? ix.extractKey(obj) : null;
    }
    const ixName = ix.name || "";
    (oldObjs || newObjs).forEach((_, i) => {
      const oldKey = oldObjs && extractKey(oldObjs[i]);
      const newKey = newObjs && extractKey(newObjs[i]);
      const resultSet = result[ixName] || (result[ixName] = new RangeSet());
      if (cmp(oldKey, newKey) !== 0) {
        oldKey && resultSet.addKey(oldKey);
        newKey && resultSet.addKey(newKey);
      }
    });
  }
  addAffectedIndex(schema.primaryKey);
  schema.indexes.forEach(addAffectedIndex);
  return result;
}
