import Dexie, {
  DBCore,
  Middleware,
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreMutateResponse,
  DBCoreTransaction,
  DBCoreTable,
} from "dexie";
import { DBOperation } from "../types/DBOperation";
import { TXExpandos } from "../types/TXExpandos";
import { guardedTable } from "./helpers/guardedTable";
import { randomString } from "./helpers/randomString";

export function createSyncMiddleware(): Middleware<DBCore> {
  return {
    stack: "dbcore",
    name: "SyncMiddleware",
    level: 1,
    create: (core) => {
      const ordinaryTables = core.schema.tables.filter(
        (t) => !/^\$/.test(t.name)
      );
      let mutTableMap: Map<string, DBCoreTable>;
      try {
        mutTableMap = new Map(
          ordinaryTables.map((tbl) => [
            tbl.name,
            core.table(`$${tbl.name}_mutations`),
          ])
        );
      } catch {
        throw new Dexie.SchemaError(
          `Version increment needed to allow dexie-cloud change tracking`
        );
      }

      return {
        ...core,
        transaction: (req) => {
          const tx = core.transaction(req) as DBCoreTransaction &
            IDBTransaction &
            TXExpandos;
          if (req.mode === "readwrite") {
            tx.txid = randomString(16);
          }
          return tx;
        },
        table: (tableName) => {
          if (/^\$/.test(tableName)) return core.table(tableName);
          const table = core.table(tableName);
          const { schema } = table;
          const mutsTable = mutTableMap.get(tableName)!;
          return guardedTable({
            ...table,
            mutate: (req) => {
              const trans = req.trans as DBCoreTransaction & TXExpandos;
              if (!trans.txid) return table.mutate(req); // Upgrade transactions not guarded by us.
              const { txid } = trans;
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
            const trans = req.trans as DBCoreTransaction & TXExpandos;
            const { txid } = trans;
            const { type } = req;

            return table.mutate(req).then((res) => {
              const keys = (type === "delete"
                ? req.keys!
                : res.results!
              ).filter((_, idx) => !res.failures[idx]);

              const mut: DBOperation =
                req.type === "delete"
                  ? {
                      type: "delete",
                      keys,
                      criteria: req.criteria,
                      txid,
                    }
                  : req.type === "add"
                  ? {
                      type: "add",
                      keys,
                      txid,
                    }
                  : req.changeSpec
                  ? {
                      type: "update",
                      keys,
                      txid,
                      criteria: req.criteria,
                      changeSpec: req.changeSpec,
                    }
                  : {
                      type: "upsert",
                      keys,
                      txid,
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
