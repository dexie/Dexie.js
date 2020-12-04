import { deepClone } from "../functions/utils";
import { DBCore } from "../public/types/dbcore";
import { Middleware } from "../public/types/middleware";
import Promise from "../helpers/promise";
import { cmp } from '../functions/cmp';

export function getFromTransactionCache(
  keys: any[],
  cache: { keys: any[]; values: any[] } | undefined | null,
  clone?: boolean
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
      result.push(clone ? deepClone(cache.values[i]) : cache.values[i]);
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
          getMany: (req) => {
            if (!req.cache) {
              return table.getMany(req);
            }
            const cachedResult = getFromTransactionCache(
              req.keys,
              req.trans["_cache"],
              req.cache === "clone"
            );
            if (cachedResult) {
              return Promise.resolve(cachedResult);
            }
            return table.getMany(req).then((res) => {
              req.trans["_cache"] = {
                keys: req.keys,
                values: req.cache === "clone" ? deepClone(res) : res,
              };
              return res;
            });
          },
          mutate: (req) => {
            // Invalidate cache on any mutate except "add" which can't change existing values:
            if (req.type !== "add") req.trans["_cache"] = null;
            return table.mutate(req);
          },
        };
      },
    };
  },
};
