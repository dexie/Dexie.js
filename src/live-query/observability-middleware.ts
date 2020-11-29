import { getFromTransactionCache } from "../dbcore/cache-existing-values-middleware";
import { getEffectiveKeys } from "../dbcore/get-effective-keys";
import { isArray } from "../functions/utils";
import { PSD } from "../helpers/promise";
import { ObservabilitySet } from "../public/types/db-events";
import {
  DBCore,
  DBCoreCountRequest,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
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
    const {cmp} = core;
    const getKey = (req: DBCoreGetRequest) =>
      ({ keys: [[req.key]] } as ObservabilitySet[string][string]);
    const getKeys = (req: DBCoreGetManyRequest) =>
      ({
        keys: req.keys.map((key) => [key]),
      } as ObservabilitySet[string][string]);
    const getRange = ({
      query: { index, range },
    }: DBCoreQueryRequest | DBCoreCountRequest | DBCoreOpenCursorRequest) =>
      (index.isPrimaryKey
        ? { keys: [[range.lower, range.upper]] }
        : {
            indexes: { [index.name]: [[range.lower, range.upper]] },
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

    return {
      ...core,
      table: (tableName) => {
        const table = core.table(tableName);
        const tableClone: DBCoreTable = {
          ...table,
          mutate: (req) => {
            const { type } = req;
            let [keys, newObjs] =
              req.type === "deleteRange"
                ? [req.range]
                : req.type === "delete"
                ? [req.keys]
                : req.values.length < 50
                ? [[], req.values]
                : [];
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
                  keys: keys.map((key) => [key]),
                };
                const oldObjs = getFromTransactionCache(
                  cmp,
                  keys,
                  oldCache
                );

                // Supply detailed values per index for both old and new objects:
                changeSpec.indexes = oldObjs || type === "add"
                  ? getAffectedIndexes(cmp, table.schema, oldObjs, newObjs)
                  : true; // Mark that index subscriptions must trigger - we can't know if ranges are affected
              } else if (keys) {
                // deleteRange. record the key range
                changeSpec = {
                  keys: [[keys.lower, keys.upper]],
                  indexes: true // As we can't know deleted index ranges, mark index-based subscriptions must trigger.
                };
              }
              if (!trans.mutatedParts) trans.mutatedParts = {};
              extendObservabilitySet(trans.mutatedParts, {
                [dbName]: { [tableName]: changeSpec },
              });
              return res;
            });
          },
        };
        readSubscribers.forEach(([method, getObservedRanges]) => {
          tableClone[method] = function (req) {
            if (PSD.subscr) {
              // Current zone want's to track all queries so they can be subscribed to.
              // (The query is executed within a "liveQuery" zone)
              // Check whether the query applies to a certain set of ranges:
              // Track what we should be observing:
              const observedRanges = getObservedRanges(req);
              if (typeof observedRanges === 'object') {
                observedRanges.cmp = cmp;
              }
              extendObservabilitySet(PSD.subscr, {
                [dbName]: { [tableName]: observedRanges },
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
  cmp: (a: any, b: any) => number,
  schema: DBCoreTableSchema,
  oldObjs: any[] | undefined,
  newObjs: any[] | undefined
) {
  const result: { [indexName: string]: Array<[any] | [any, any]> } = {};
  schema.indexes.forEach((ix) => {
    function extractKey(val: any) {
      const key = val != null ? ix.extractKey(val) : null;
      if (key == null) return null;
      try {
        cmp(key, 0);
        return key;
      } catch {
        return null;
      }
    }
    if (ix.isPrimaryKey) return;
    (oldObjs || newObjs).forEach((_, i) => {
      const oldObj = oldObjs && oldObjs[i];
      const oldKey = extractKey(oldObj);
      const newKey = newObjs && extractKey(newObjs[i]);
      const resultArray = result[ix.name] || (result[ix.name] = []);
      if (oldKey != null) {
        resultArray.push([oldKey]);
        if (newKey != null && cmp(oldKey, newKey) !== 0) {
          resultArray.push([newKey]);
        }
      } else if (newKey != null) {
        resultArray.push([newKey]);
      }
    });
  });
  return result;
}
