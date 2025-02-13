import {
  DBCore,
  DBCoreAddRequest,
  DBCoreDeleteRequest,
  DBCoreMutateResponse,
  DBCorePutRequest,
  DBCoreTable,
  DBCoreTransaction,
  Middleware,
  RangeSet,
} from 'dexie';
import { DBOperation, DBUpdateOperation } from 'dexie-cloud-common';
import { BehaviorSubject } from 'rxjs';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { UserLogin } from '../db/entities/UserLogin';
import { getMutationTable } from '../helpers/getMutationTable';
import { randomString } from '../helpers/randomString';
import { throwVersionIncrementNeeded } from '../helpers/throwVersionIncrementNeeded';
import { guardedTable } from '../middleware-helpers/guardedTable';
import { registerSyncEvent } from '../sync/registerSyncEvent';
import { TXExpandos } from '../types/TXExpandos';
import { outstandingTransactions } from './outstandingTransaction';
import { isEagerSyncDisabled } from '../isEagerSyncDisabled';
import { triggerSync } from '../sync/triggerSync';

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
    stack: 'dbcore',
    name: 'MutationTrackingMiddleware',
    level: 1,
    create: (core) => {
      const allTableNames = new Set(core.schema.tables.map((t) => t.name));
      const ordinaryTables = core.schema.tables.filter(
        (t) => !/^\$/.test(t.name)
      );
      const mutTableMap = new Map<string, DBCoreTable>();
      for (const tbl of ordinaryTables) {
        const mutationTableName = `$${tbl.name}_mutations`;
        if (allTableNames.has(mutationTableName)) {
          mutTableMap.set(tbl.name, core.table(mutationTableName));
        }
      }

      return {
        ...core,
        transaction: (tables, mode) => {
          let tx: DBCoreTransaction & IDBTransaction & TXExpandos;
          if (mode === 'readwrite') {
            const mutationTables = tables
              .filter((tbl) => db.cloud.schema?.[tbl]?.markedForSync)
              .map((tbl) => getMutationTable(tbl));
            tx = core.transaction(
              [...tables, ...mutationTables],
              mode
            ) as DBCoreTransaction & IDBTransaction & TXExpandos;
          } else {
            tx = core.transaction(tables, mode) as DBCoreTransaction &
              IDBTransaction &
              TXExpandos;
          }

          if (mode === 'readwrite') {
            // Give each transaction a globally unique id.
            tx.txid = randomString(16);
            tx.opCount = 0;
            // Introduce the concept of current user that lasts through the entire transaction.
            // This is important because the tracked mutations must be connected to the user.
            tx.currentUser = currentUserObservable.value;
            outstandingTransactions.value.add(tx);
            outstandingTransactions.next(outstandingTransactions.value);
            const removeTransaction = () => {
              tx.removeEventListener('complete', txComplete);
              tx.removeEventListener('error', removeTransaction);
              tx.removeEventListener('abort', removeTransaction);
              outstandingTransactions.value.delete(tx);
              outstandingTransactions.next(outstandingTransactions.value);
            };
            const txComplete = () => {
              if (tx.mutationsAdded && !isEagerSyncDisabled(db)) {
                triggerSync(db, 'push');
              }
              removeTransaction();
            };
            tx.addEventListener('complete', txComplete);
            tx.addEventListener('error', removeTransaction);
            tx.addEventListener('abort', removeTransaction);
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
                mutate: (req) => {
                  if (req.type === 'add' || req.type === 'put') {
                    (
                      req.trans as DBCoreTransaction & TXExpandos
                    ).mutationsAdded = true;
                  }
                  return table.mutate(req);
                },
              };
            } else if (tableName === '$logins') {
              return {
                ...table,
                mutate: (req) => {
                  //console.debug('Mutating $logins table', req);
                  return table
                    .mutate(req)
                    .then((res) => {
                      //console.debug('Mutating $logins');
                      (
                        req.trans as DBCoreTransaction & TXExpandos
                      ).mutationsAdded = true;
                      //console.debug('$logins mutated');
                      return res;
                    })
                    .catch((err) => {
                      console.debug('Failed mutation $logins', err);
                      return Promise.reject(err);
                    });
                },
              };
            } else {
              return table;
            }
          }
          const { schema } = table;
          const mutsTable = mutTableMap.get(tableName)!;
          if (!mutsTable) {
            // We cannot track mutations on this table because there is no mutations table for it.
            // This might happen in upgraders that executes before cloud schema is applied.
            return table; 
          }
          return guardedTable({
            ...table,
            mutate: (req) => {
              const trans = req.trans as DBCoreTransaction & TXExpandos;
              if (!trans.txid) return table.mutate(req); // Upgrade transactions not guarded by us.
              if (trans.disableChangeTracking) return table.mutate(req);
              if (!db.cloud.schema?.[tableName]?.markedForSync)
                return table.mutate(req);
              if (!trans.currentUser?.isLoggedIn) {
                // Unauthorized user should not log mutations.
                // Instead, after login all local data should be logged at once.
                return table.mutate(req);
              }

              return req.type === 'deleteRange'
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
                        type: 'delete',
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
            const unsyncedProps =
              db.cloud.options?.unsyncedProperties?.[tableName];
            const {
              txid,
              currentUser: { userId },
            } = trans;
            const { type } = req;
            const opNo = ++trans.opCount;

            function stripChangeSpec(changeSpec: { [keyPath: string]: any }) {
              if (!unsyncedProps) return changeSpec;
              let rv = changeSpec;
              for (const keyPath of Object.keys(changeSpec)) {
                if (
                  unsyncedProps.some(
                    (p) => keyPath === p || keyPath.startsWith(p + '.')
                  )
                ) {
                  if (rv === changeSpec) rv = { ...changeSpec }; // clone on demand
                  delete rv[keyPath];
                }
              }
              return rv;
            }

            return table.mutate(req).then((res) => {
              const { numFailures: hasFailures, failures } = res;
              let keys = type === 'delete' ? req.keys! : res.results!;
              let values = 'values' in req ? req.values : [];
              let changeSpec = 'changeSpec' in req ? req.changeSpec : undefined;
              let updates = 'updates' in req ? req.updates : undefined;

              if (hasFailures) {
                keys = keys.filter((_, idx) => !failures[idx]);
                values = values.filter((_, idx) => !failures[idx]);
              }
              if (unsyncedProps) {
                // Filter out unsynced properties
                values = values.map((value) => {
                  const newValue = { ...value };
                  for (const prop of unsyncedProps) {
                    delete newValue[prop];
                  }
                  return newValue;
                });
                if (changeSpec) {
                  // modify operation with criteria and changeSpec.
                  // We must strip out unsynced properties from changeSpec.
                  // We deal with criteria later.
                  changeSpec = stripChangeSpec(changeSpec);
                  if (Object.keys(changeSpec).length === 0) {
                    // Nothing to change on server
                    return res;
                  }
                }
                if (updates) {
                  let strippedChangeSpecs =
                    updates.changeSpecs.map(stripChangeSpec);
                  let newUpdates: DBCorePutRequest['updates'] = {
                    keys: [],
                    changeSpecs: [],
                  };
                  const validKeys = new RangeSet();
                  let anyChangeSpecBecameEmpty = false;
                  for (let i = 0, l = strippedChangeSpecs.length; i < l; ++i) {
                    if (Object.keys(strippedChangeSpecs[i]).length > 0) {
                      newUpdates.keys.push(updates.keys[i]);
                      newUpdates.changeSpecs.push(strippedChangeSpecs[i]);
                      validKeys.addKey(updates.keys[i]);
                    } else {
                      anyChangeSpecBecameEmpty = true;
                    }
                  }
                  updates = newUpdates;
                  if (anyChangeSpecBecameEmpty) {
                    // Some keys were stripped. We must also strip them from keys and values
                    let newKeys: any[] = [];
                    let newValues: any[] = [];
                    for (let i = 0, l = keys.length; i < l; ++i) {
                      if (validKeys.hasKey(keys[i])) {
                        newKeys.push(keys[i]);
                        newValues.push(values[i]);
                      }
                    }
                    keys = newKeys;
                    values = newValues;
                  }
                }
              }
              const ts = Date.now();
              // Canonicalize req.criteria.index to null if it's on the primary key.
              let criteria =
                'criteria' in req && req.criteria
                  ? {
                      ...req.criteria,
                      index:
                        req.criteria.index === schema.primaryKey.keyPath // Use null to inform server that criteria is on primary key
                          ? null // This will disable the server from trying to log consistent operations where it shouldnt.
                          : req.criteria.index,
                    }
                  : undefined;
              if (unsyncedProps && criteria?.index) {
                const keyPaths = schema.indexes.find(
                  (idx) => idx.name === criteria!.index
                )?.keyPath;
                const involvedProps = keyPaths
                  ? typeof keyPaths === 'string'
                    ? [keyPaths]
                    : keyPaths
                  : [];
                if (involvedProps.some((p) => unsyncedProps?.includes(p))) {
                  // Don't log criteria on unsynced properties as the server could not test them.
                  criteria = undefined;
                }
              }

              const mut: DBOperation =
                req.type === 'delete'
                  ? {
                      type: 'delete',
                      ts,
                      opNo,
                      keys,
                      criteria,
                      txid,
                      userId,
                    }
                  : req.type === 'add'
                  ? {
                      type: 'insert',
                      ts,
                      opNo,
                      keys,
                      txid,
                      userId,
                      values,
                    }
                  : criteria && changeSpec
                  ? {
                      // Common changeSpec for all keys
                      type: 'modify',
                      ts,
                      opNo,
                      keys,
                      criteria,
                      changeSpec,
                      txid,
                      userId,
                    }
                  : changeSpec
                  ? {
                      // In case criteria involved an unsynced property, we go for keys instead.
                      type: 'update',
                      ts,
                      opNo,
                      keys,
                      changeSpecs: keys.map(() => changeSpec!),
                      txid,
                      userId,
                    }
                  : updates
                  ? {
                      // One changeSpec per key
                      type: 'update',
                      ts,
                      opNo,
                      keys: updates.keys,
                      changeSpecs: updates.changeSpecs,
                      txid,
                      userId,
                    }
                  : {
                      type: 'upsert',
                      ts,
                      opNo,
                      keys,
                      values,
                      txid,
                      userId,
                    };

              if ('isAdditionalChunk' in req && req.isAdditionalChunk) {
                mut.isAdditionalChunk = true;
              }
              return keys.length > 0 || criteria
                ? mutsTable
                    .mutate({ type: 'add', trans, values: [mut] }) // Log entry
                    .then(() => {
                      trans.mutationsAdded = true; // Mark transaction as having added mutations to trigger eager sync
                      return res; // Return original response
                    })
                : res;
            });
          }
        },
      };
    },
  };
}
