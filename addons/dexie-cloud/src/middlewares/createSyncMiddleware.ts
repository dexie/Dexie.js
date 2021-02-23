import {
  DBCore,
  Middleware,
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreMutateResponse,
} from "dexie";
import { guardedTable } from "./helpers/guardedTable";

export function createSyncMiddleware(): Middleware<DBCore> {
  return {
    stack: "dbcore",
    name: "syncMiddleware",
    level: 1,
    create: (core) => {
      return {
        ...core,
        table: (tableName) => {
          if (/^\$/.test(tableName)) return core.table(tableName);
          const table = core.table(tableName);
          const { schema } = table;
          const mutsTable = core.table(`$${tableName}_mutations`); // Try-catch and throw nicer error?
          return guardedTable({
            ...table,
            mutate: (req) => {
              return req.type === "deleteRange"
                ? table
                    // Query the actual keys (needed for server sending correct rollback to us)
                    .query({
                      query: { range: req.range, index: schema.primaryKey },
                      trans: req.trans,
                      values: false,
                    })
                    // Do a delete request instead, but keep the criteria info for the server to execute
                    .then((res) => {
                      return mutateAndLog({
                        type: "delete",
                        keys: res.result,
                        trans: req.trans,
                        criteria: { index: null, range: req.range },
                      });
                    })
                : mutateAndLog(req);
            },
          });

          function mutateAndLog(
            req: DBCoreDeleteRequest | DBCoreAddRequest | DBCorePutRequest
          ): Promise<DBCoreMutateResponse> {
            const txid = req.trans["txid"];
            const { type, trans } = req;

            return table.mutate(req).then((res) => {
              const keys = (type === "delete"
                ? req.keys!
                : res.results!
              ).filter((_, idx) => !res.failures[idx]);

              const mut =
                req.type === "delete"
                  ? {
                      type,
                      keys,
                      criteria: req.criteria,
                      txid,
                    }
                  : req.type === "add"
                  ? {
                      type,
                      keys,
                      txid,
                    }
                  : {
                      type,
                      keys,
                      txid,
                      criteria: req.criteria,
                      changeSpec: req.changeSpec,
                    };
              return keys.length > 0
                ? mutsTable
                    .mutate({ type: "add", trans, values: [mut] }) // Log entry
                    .then(() => res) // Return original response
                : res;
            });
          }
        },
      };
    },
  };
}
