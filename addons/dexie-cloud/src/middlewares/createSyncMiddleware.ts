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
import { startSyncingClientChanges } from "../sync/old_startSyncingClientChanges";
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
            tx.mutReqs = {};
            req.tables.forEach(tableName => tx.mutReqs[tableName] = {
              muts: [],
              firstRev: 0
            });
            tx.addEventListener(
              "complete",
              function (this: IDBTransaction & TXExpandos) {
                startSyncingClientChanges(this, req.tables, mutTableMap, core, ordinaryTables);
              }
            );
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
            const { txid, mutReqs } = trans;
            const { type } = req;
            if (req.type !== "delete") req.values = Dexie.deepClone(req.values);

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
                    .then(res => {
                      // Successful mutation - record the mutation request with resolved keys in trans.mutReqs:
                      const txMem = mutReqs[tableName];
                      txMem.muts.push({
                        ...req,
                        keys, // Make sure generated keys result are contained.
                      });
                      if (!txMem.firstRev) txMem.firstRev = res.lastResult; // So we can query earlier non-synced revs
                      // Return original response
                      return res;
                    })
                : res;
            });
          }
        },
      };
    },
  };
}
