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
import { guardedTable } from "../middleware-helpers/guardedTable";
import { randomString } from "../helpers/randomString";
import { UserLogin } from "../types/UserLogin";
import { BehaviorSubject } from "rxjs";
import { outstandingTransactions } from "./outstandingTransaction";

export interface MutationTrackingMiddlewareArgs {
  currentUserObservable: BehaviorSubject<UserLogin>;
}

/** Tracks all mutations in the same transaction as the mutations -
 * so it is guaranteed that no mutation goes untracked - and if transaction
 * aborts, the mutations won't be tracked.
 *
 * The sync job will use the tracked mutations as the source of truth when pushing
 * changes to server and cleanup the tracked mutations once the server has
 * ackowledged that it got them.
 */
export function createMutationTrackingMiddleware({
  currentUserObservable,
}: MutationTrackingMiddlewareArgs): Middleware<DBCore> {
  return {
    stack: "dbcore",
    name: "MutationTrackingMiddleware",
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
            // Give each transaction a globally unique id.
            tx.txid = randomString(16);
            // Introduce the concept of current user that lasts through the entire transaction.
            // This is important because the tracked mutations must be connected to the user.
            tx.currentUser = currentUserObservable.value;
            outstandingTransactions.value.add(tx);
            outstandingTransactions.next(outstandingTransactions.value);
            const removeTransaction = () => {
              tx.removeEventListener("complete", removeTransaction);
              tx.removeEventListener("error", removeTransaction);
              tx.removeEventListener("abort", removeTransaction);
              outstandingTransactions.value.delete(tx);
              outstandingTransactions.next(outstandingTransactions.value);
            };
            tx.addEventListener("complete", removeTransaction);
            tx.addEventListener("error", removeTransaction);
            tx.addEventListener("abort", removeTransaction);
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
            const {
              txid,
              currentUser: { userId },
            } = trans;
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
                      userId,
                    }
                  : req.type === "add"
                  ? {
                      type: "insert",
                      keys,
                      txid,
                      userId,
                    }
                  : req.changeSpec
                  ? {
                      type: "update",
                      keys,
                      txid,
                      criteria: req.criteria,
                      changeSpec: req.changeSpec,
                      userId,
                    }
                  : {
                      type: "upsert",
                      keys,
                      txid,
                      userId,
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
