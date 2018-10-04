import { DBCore, DBCoreTable, MutateResponse, DeleteRangeRequest, AddRequest, PutRequest, DeleteRequest, DBCoreTransaction, KeyRange } from '../public/types/dbcore';
import { Dexie } from '../classes/dexie';
import { nop } from '../functions/chaining-functions';
import { tryCatch, getObjectDiff, setByKeyPath } from '../functions/utils';
import { PSD } from '../helpers/promise';
import { LockableTableMiddleware } from '../dbcore/lockable-table-middleware';
import { exceptions } from '../errors';
import { DBCoreUp1, DBCoreUp1Table } from '../public/types/dbcore-up-1';
import { getEffectiveKeys, getExistingValues } from '../dbcore/get-effective-keys';

export function HooksMiddleware(db: Dexie) {
  return {
    name: "HooksMiddleware",
    middleware: (downCore: DBCoreUp1) => ({
      ...downCore,
      table(tableName: string) {
        const {deleting, creating, updating} = db.table(tableName).hook;
        const downTable = downCore.table(name);
        const {primaryKey} = downTable.schema;
    
        const tableMiddleware: DBCoreUp1Table = {
          ...downTable,
          mutate(req):Promise<MutateResponse> {
            switch (req.type) {
              case 'add':
                if (creating.fire === nop) break;
              case 'put':
                if (creating.fire === nop && updating.fire === nop) break;
              case 'delete':
                if (deleting.fire === nop) break;
                // The following line should intentionally fall through from all three of 'add' and 'put' and 'delete':
                return lock(req.trans, addPutOrDelete(req));
              case 'deleteRange':
                if (deleting.fire === nop) break;
                return lock(req.trans, deleteRange(req));
            }
            // Any of the breaks above happened (no hooks) - do the default:
            return downTable.mutate(req);
          }
        };
        const {lock, lockableMiddleware} = LockableTableMiddleware(tableMiddleware);

        function addPutOrDelete(req: AddRequest | PutRequest | DeleteRequest): Promise<MutateResponse> {
          const dxTrans = PSD.trans;
          const keys = req.keys || getEffectiveKeys(primaryKey, req);
          // Clone Request and set keys arg
          req = {...req, keys};
          if (req.type !== 'delete') req.values = [...req.values];
          if (req.keys) req.keys = [...req.keys];

          return getExistingValues(downTable, req, keys).then (existingValues => {
            const contexts = keys.map((key, i) => {
              const existingValue = existingValues[i];
              const ctx = { onerror: null, onsuccess: null, primKey: key, value: existingValue };
              if (req.type === 'delete') {
                // delete operation
                deleting.fire(ctx, key, existingValue, dxTrans);
              } else if (req.type === 'add' || existingValue === undefined) {
                // The add() or put() resulted in a create
                const generatedPrimaryKey = creating.fire(ctx, key, req.values[i], dxTrans);
                if (key == null && generatedPrimaryKey != null) {
                  key = generatedPrimaryKey;
                  req.keys[i] = key;
                  if (!primaryKey.outbound) {
                    setByKeyPath(req.values[i], primaryKey.compound ?
                      primaryKey.keyPathArray :
                      primaryKey.keyPathArray[0], key);
                  }
                }
              } else {
                // The put() operation resulted in an update
                const objectDiff = getObjectDiff(existingValue, req.values[i]);
                const additionalChanges = updating.fire(ctx, objectDiff, this.primKey, existingValue, dxTrans);
                if (additionalChanges) {
                  const requestedValue = req.values[i];
                  Object.keys(additionalChanges).forEach(keyPath => {
                    setByKeyPath(requestedValue, keyPath, additionalChanges[keyPath]);
                  });
                }
              }
              return ctx;
            });
            return downTable.mutate(req).then(({failures, results, numFailures}) => {
              for (let i=0; i<keys.length; ++i) {
                const result = results[i];
                const ctx = contexts[i];
                if (result === undefined) {
                  ctx.onerror && ctx.onerror(failures[i]);
                } else {
                  ctx.onsuccess && ctx.onsuccess(
                    req.type === 'put' && existingValues[i] ? // the put resulted in an update
                      req.values[i] : // update hooks expects existing value
                      result // create hooks expects primary key
                  );
                }
              }
              return {failures, results, numFailures};
            });
          });
        }

        function deleteRange(req: DeleteRangeRequest): Promise<MutateResponse> {
          return deleteNextChunk(req.trans, req.range, 10000);
        }

        function deleteNextChunk(trans: DBCoreTransaction, range: KeyRange, limit: number) {
          // Query what keys in the DB within the given range
          return downTable.query({trans, values: false, query: {keyPath: ":id", range}, limit})
          .then(({result}) => {
            // Given a set of keys, bulk delete those using the same procedure as in addPutOrDelete().
            // This will make sure that deleting hook is called.
            return addPutOrDelete({type: 'delete', keys: result, trans}).then(res => {
              if (res.numFailures > 0) return Promise.reject(res.failures[0]);
              if (result.length < limit) {
                return {failures: [], numFailures: 0} as MutateResponse;
              } else {
                return deleteNextChunk(trans, {...range, lower: result[result.length - 1], lowerOpen: true}, limit);
              }
            });
          })
        }

        return lockableMiddleware;
      },
    }) as DBCoreUp1
  };
}