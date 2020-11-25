import { getEffectiveKeys } from "../../dbcore/get-effective-keys";
import { PSD } from "../../helpers/promise";
import { ObservabilitySet } from "../../public/types/db-events";
import {
  DBCore,
  DBCoreCountRequest,
  DBCoreGetManyRequest,
  DBCoreGetRequest,
  DBCoreOpenCursorRequest,
  DBCoreQueryRequest,
  DBCoreRangeType,
  DBCoreTable,
  DBCoreTransaction
} from "../../public/types/dbcore";
import { Middleware } from "../../public/types/middleware";
import { extendObservabilitySet } from "./extend-observability-set";


export const observabilityMiddleware: Middleware<DBCore> = {
  stack: "dbcore",
  level: 0,
  create: (core) => {
    const dbName = core.schema.name;
    const getKey = (req: DBCoreGetRequest) => [req.key];
    const getKeys = (req: DBCoreGetManyRequest) => req.keys;
    const getQueryKey = ({
      query: { index, range },
    }: DBCoreQueryRequest | DBCoreCountRequest | DBCoreOpenCursorRequest) => index.isPrimaryKey &&
    range.type === DBCoreRangeType.Equal && [range.lower];

    const readSubscribers: [
      Exclude<keyof DBCoreTable, "name" | "schema" | "mutate">,
      undefined | ((req: any) => any[])
    ][] = [
        ["get", getKey],
        ["getMany", getKeys],
        ["count", getQueryKey],
        ["query", getQueryKey],
        ["openCursor", getQueryKey],
      ];

    return {
      ...core,
      table: (tableName) => {
        const table = core.table(tableName);
        const tableClone: DBCoreTable = {
          ...table,
          mutate: (req) => {
            const keys = req.type !== "deleteRange" &&
              (req.type === "delete"
                ? req.keys
                : (req.keys = getEffectiveKeys(table.schema.primaryKey, req)));
            const trans = req.trans as DBCoreTransaction & {
              mutatedParts?: ObservabilitySet;
            };
            return table.mutate(req).then((res) => {
              // Add the mutated table and optionally keys to the mutatedTables set on the transaction.
              // Used by subscribers to txcommit event and for Collection.prototype.subscribe().
              const mutatedParts: ObservabilitySet = {
                [dbName]: {
                  [tableName]: keys && keys.every((k) => k != null) ? { keys } : true,
                },
              };
              if (!trans.mutatedParts)
                trans.mutatedParts = {};
              extendObservabilitySet(trans.mutatedParts, mutatedParts);
              return res;
            });
          },
        };
        readSubscribers.forEach(([method, getKeys]) => {
          tableClone[method] = function (req) {
            if (PSD.subscr) {
              // Current zone want's to track all queries so they can be subscribed to.
              // (The query is executed within a "liveQuery" zone)
              // Check whether the query applies to a certain set of keys:
              const keys = getKeys && getKeys(req);
              // Track what we should be observing:
              const observabilitySet: ObservabilitySet = {
                [dbName]: {
                  [tableName]: keys
                    ? // We're querying a single key, or a set of keys.

                    // In this case, don't subscribe to all changes in table - just those keys:
                    { keys, cmp: core.cmp }
                    : // The query is based on a secondary index, or is range based -

                    // Lets subscribe to all changes on the table
                    true,
                },
              };
              extendObservabilitySet(PSD.subscr, observabilitySet);
            }
            return table[method].apply(this, arguments);
          };
        });
        return tableClone;
      },
    };
  },
};
