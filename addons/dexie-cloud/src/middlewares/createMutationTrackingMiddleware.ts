import Dexie, {
  DBCore,
  Middleware,
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreMutateResponse,
  DBCoreTransaction,
  DBCoreTable,
  DBCoreRangeType,
} from "dexie";
import { DBOperation } from "../types/move-to-dexie-cloud-common/DBOperation";
import { TXExpandos } from "../types/TXExpandos";
import { guardedTable } from "../middleware-helpers/guardedTable";
import { randomString } from "../helpers/randomString";
import { UserLogin } from "../db/entities/UserLogin";
import { BehaviorSubject } from "rxjs";
import { outstandingTransactions } from "./outstandingTransaction";
import { throwVersionIncrementNeeded } from "../helpers/throwVersionIncrementNeeded";
import { DexieCloudOptions } from "../DexieCloudOptions";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { registerSyncEvent } from "../sync/registerSyncEvent";

export interface MutationTrackingMiddlewareArgs {
  currentUserObservable: BehaviorSubject<UserLogin>;
  db: DexieCloudDB;
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
  db,
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
        throwVersionIncrementNeeded();
      }

      return {
        ...core,
        transaction: (tables, mode) => {
          const tx = core.transaction(tables, mode) as DBCoreTransaction &
            IDBTransaction &
            TXExpandos;

          if (mode === "readwrite") {
            // Give each transaction a globally unique id.
            tx.txid = randomString(16);
            // Introduce the concept of current user that lasts through the entire transaction.
            // This is important because the tracked mutations must be connected to the user.
            tx.currentUser = currentUserObservable.value;
            outstandingTransactions.value.add(tx);
            outstandingTransactions.next(outstandingTransactions.value);
            const removeTransaction = () => {
              tx.removeEventListener("complete", txComplete);
              tx.removeEventListener("error", removeTransaction);
              tx.removeEventListener("abort", removeTransaction);
              outstandingTransactions.value.delete(tx);
              outstandingTransactions.next(outstandingTransactions.value);
            };
            const txComplete = () => {
              if (tx.mutationsAdded && db.cloud.options?.databaseUrl) {
                if (db.cloud.options?.usingServiceWorker) {
                  registerSyncEvent(db);
                } else {
                  db.localSyncEvent.next({});
                }
              }
              removeTransaction();
            }
            tx.addEventListener("complete", txComplete);
            tx.addEventListener("error", removeTransaction);
            tx.addEventListener("abort", removeTransaction);

            // Copy "disableChangeTracking" flag from Dexie transaction to DBCore transaction:
            if (Dexie.currentTransaction["disableChangeTracking"]) {
              tx.disableChangeTracking = true;
            }
          }
          return tx;
        },
        table: (tableName) => {
          const table = core.table(tableName);
          if (/^\$/.test(tableName)) {
            if (tableName.endsWith('_mutations')) {
              // In case application code adds items to ..._mutations tables,
              // make sure to set the mutationsAdded flag on transaction.
              // This is also done in mutateAndLog() as that function talks to a
              // lower level DBCore and wouldn't be catched by this code.
              return {
                ...table,
                mutate: req => {
                  if (req.type === "add" || req.type === "put") {
                    (req.trans as DBCoreTransaction & TXExpandos).mutationsAdded = true;
                  }
                  return table.mutate(req);
                }
              }
            } else {
              return table;
            }
          }
          const { schema } = table;
          const mutsTable = mutTableMap.get(tableName)!;
          return guardedTable({
            ...table,
            mutate: (req) => {
              const trans = req.trans as DBCoreTransaction & TXExpandos;
              if (!trans.txid) return table.mutate(req); // Upgrade transactions not guarded by us.
              if (trans.disableChangeTracking) return table.mutate(req);
              if (!trans.currentUser?.isLoggedIn) {
                // Unauthorized user should not log mutations.
                // Instead, after login all local data should be logged at once.
                return table.mutate(req);
              }

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
            trans.mutationsAdded = true;
            const {
              txid,
              currentUser: { userId },
            } = trans;
            const { type } = req;

            return table.mutate(req).then((res) => {
              const {numFailures: hasFailures, failures} = res;
              let keys = (type === "delete"
                ? req.keys!
                : res.results!
              );
              let values = 'values' in req ? req.values : [];
              let changeSpecs = 'changeSpecs' in req ? req.changeSpecs! : [];
              if (hasFailures) {
                keys = keys.filter((_, idx) => !failures[idx]);
                values = values.filter((_, idx) => !failures[idx]);
                changeSpecs = changeSpecs.filter((_, idx) => !failures[idx]);
              }
              const ts = Date.now();

              const mut: DBOperation =
                req.type === "delete"
                  ? {
                      type: "delete",
                      ts,
                      keys,
                      criteria: req.criteria,
                      txid,
                      userId,
                    }
                  : req.type === "add"
                  ? {
                      type: "insert",
                      ts,
                      keys,
                      txid,
                      userId,
                      values,
                    }
                  : req.criteria && req.changeSpec
                  ? {
                      // Common changeSpec for all keys
                      type: "modify",
                      ts,
                      keys,
                      criteria: req.criteria,
                      changeSpec: req.changeSpec,
                      txid,
                      userId,
                    }
                  : req.changeSpecs
                  ? {
                      // One changeSpec per key
                      type: "update",
                      ts,
                      keys,
                      changeSpecs,
                      txid,
                      userId,
                    }
                  : {
                      type: "upsert",
                      ts,
                      keys,
                      values,
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
