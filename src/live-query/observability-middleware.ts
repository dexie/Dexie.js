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
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreQueryResponse,
  DBCoreTable,
  DBCoreTableSchema,
  DBCoreTransaction,
} from "../public/types/dbcore";
import { Middleware } from "../public/types/middleware";
import { RangeBtree } from "../public/types/rangeset";
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
        const {
          primaryKey: { extractKey, outbound },
        } = schema;
        const extendTableObservation = (
          target: ObservabilitySet,
          tableChanges: ObservabilitySet[string][string]
        ) =>
          extendObservabilitySet(target, {
            [dbName]: { [tableName]: tableChanges },
          });

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

        const getKey = (req: DBCoreGetRequest) =>
          ({ keys: new RangeSet(req.key) } as ObservabilitySet[string][string]);
        const getKeys = (req: DBCoreGetManyRequest) =>
          ({
            keys: new RangeSet().addKeys(req.keys),
          } as ObservabilitySet[string][string]);
        const getRange = ({
          query: { index, range },
        }: DBCoreQueryRequest | DBCoreCountRequest | DBCoreOpenCursorRequest) =>
          (index.isPrimaryKey
            ? { keys: new RangeSet(range.lower, range.upper) }
            : {
                indexes: {
                  [index.name]: new RangeSet(range.lower, range.upper),
                },
              }) as ObservabilitySet[string][string];

        const readSubscribers: [
          Exclude<keyof DBCoreTable, "name" | "schema" | "mutate">,
          (req: any) => ObservabilitySet[string][string]
        ][] = [
          ["get", getKey],
          ["getMany", getKeys],
          ["count", getRange],
          ["query", getRange],
          ["openCursor", getRange],
        ];

        readSubscribers.forEach(([method, getObservedRanges]) => {
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

              const observedRanges = getObservedRanges(req) as Exclude<
                ObservabilitySet[string][string],
                true // Exclude true from the type since neither getKey(), getKeys() nor getRange() returns that!
              >;
              extendTableObservation(subscr, observedRanges);

              return table[method].apply(this, arguments).then((res) => {
                if (
                  (req as DBCoreQueryRequest | DBCoreOpenCursorRequest)
                    .values && // Caller want's values, not just keys
                  !observedRanges.keys // only indexes were tracked. Keys must always be tracked too!
                ) {
                  if (method === "query") {
                    extendTableObservation(
                      subscr,
                      outbound
                        ? true // If outbound, we can't use extractKey to map what keys to observe
                        : {
                            keys: new RangeSet().addKeys(
                              (res as DBCoreQueryResponse).result.map(
                                extractKey
                              )
                            ),
                          }
                    );
                  } else if (method === "openCursor") {
                    const cursor: DBCoreCursor | null = res;
                    return (
                      cursor &&
                      Object.create(cursor, {
                        value: {
                          get: () => {
                            //subscr.
                            extendTableObservation(subscr, {
                              keys: new RangeSet(cursor.key),
                            });
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
  schema.indexes.forEach((ix) => {
    function extractKey(val: any) {
      return val != null ? ix.extractKey(val) : null;
    }
    if (ix.isPrimaryKey) return;
    (oldObjs || newObjs).forEach((_, i) => {
      const oldObj = oldObjs && oldObjs[i];
      const oldKey = extractKey(oldObj);
      const newKey = newObjs && extractKey(newObjs[i]);
      const resultSet = result[ix.name] || (result[ix.name] = new RangeSet());
      if (oldKey != null) {
        resultSet.addKey(oldKey);
        if (newKey != null && cmp(oldKey, newKey) !== 0) {
          resultSet.addKey(newKey);
        }
      } else if (newKey != null) {
        resultSet.addKey(newKey);
      }
    });
  });
  return result;
}
