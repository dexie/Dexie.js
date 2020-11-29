import { deepClone } from "../functions/utils";
import {
  DBCore,
  DBCoreAddRequest,
  DBCoreDeleteRequest,
  DBCorePutRequest,
  DBCoreTable,
  DBCoreTransaction,
} from "../public/types/dbcore";
import { Middleware } from "../public/types/middleware";

export function getExistingValues(
  cmp: (a: any, b: any) => number,
  table: DBCoreTable,
  req: DBCoreAddRequest | DBCorePutRequest | DBCoreDeleteRequest,
  effectiveKeys: any[]
) {
  return req.type === "add"
    ? Promise.resolve(new Array<any>(req.values.length))
    : Promise.resolve(
        getFromTransactionCache(cmp, effectiveKeys, req.trans["_cache"]) ||
          table.getMany({ trans: req.trans, keys: effectiveKeys })
      );
}

export function getFromTransactionCache(
  cmp: (a: any, b: any) => number,
  keys: any[],
  cache: { keys: any[]; values: any[] } | undefined | null
) {
  try {
    if (!cache) return null;
    if (cache.keys.length < keys.length) return null;
    const result: any[] = [];
    // Compare if the exact same order of keys was retrieved in same transaction:
    // Allow some cached keys to be omitted from provided set of keys
    // Use case: 1. getMany(keys) 2. update a subset of those 3. call put with the updated ones ==> middlewares should be able to find old values
    for (let i = 0, j = 0; i < cache.keys.length && j < keys.length; ++i) {
      if (cmp(cache.keys[i], keys[j]) !== 0) continue;
      result.push(cache.values[i]);
      ++j;
    }
    // If got all keys caller was looking for, return result.
    return result.length === keys.length ? result : null;
  } catch {
    return null;
  }
}

export const cacheExistingValuesMiddleware: Middleware<DBCore> = {
  stack: "dbcore",
  level: -1,
  create: (core) => {
    return {
      table: (tableName) => {
        const table = core.table(tableName);
        return {
          ...table,
          get: (req) => {
            return table.get(req).then((res) => {
              req.trans["_cache"] = {
                keys: [req.key],
                values: [deepClone(res)],
              };
              return res;
            });
          },
          getMany: (req) => {
            return table.getMany(req).then((res) => {
              req.trans["_cache"] =
                res.length < 15
                  ? {
                      keys: req.keys,
                      values: deepClone(res),
                    }
                  : null;
              return res;
            });
          },
          mutate: (req) => {
            // Invalidate cache on any mutate:
            req.trans["_cache"] = null;
            return table.mutate(req);
          },
        };
      },
    };
  },
};
