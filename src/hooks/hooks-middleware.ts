import {
  DBCore,
  DBCoreTable,
  DBCoreMutateResponse,
  DBCoreDeleteRangeRequest,
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreTransaction,
  DBCoreKeyRange
} from "../public/types/dbcore";
import { nop } from '../functions/chaining-functions';
import { getObjectDiff, hasOwn, setByKeyPath } from '../functions/utils';
import { PSD } from '../helpers/promise';
//import { LockableTableMiddleware } from '../dbcore/lockable-table-middleware';
import { getEffectiveKeys } from '../dbcore/get-effective-keys';
import { Middleware } from '../public/types/middleware';
import { Transaction } from '../classes/transaction';

export const hooksMiddleware: Middleware<DBCore>  = {
  stack: "dbcore",
  name: "HooksMiddleware",
  level: 2,
  create: (downCore: DBCore) => ({
    ...downCore,
    table(tableName: string) {
      const downTable = downCore.table(tableName);
      const {primaryKey} = downTable.schema;
  
      const tableMiddleware: DBCoreTable = {
        ...downTable,
        mutate(req):Promise<DBCoreMutateResponse> {
          const dxTrans = PSD.trans as Transaction;
          // Hooks can be transaction-bound. Need to grab them from transaction.table and not
          // db.table!
          const {deleting, creating, updating} = dxTrans.table(tableName).hook;
          switch (req.type) {
            case 'add':
              if (creating.fire === nop) break;
              return dxTrans._promise('readwrite', ()=>addPutOrDelete(req), true);
            case 'put':
              if (creating.fire === nop && updating.fire === nop) break;
              return dxTrans._promise('readwrite', ()=>addPutOrDelete(req), true);
            case 'delete':
              if (deleting.fire === nop) break;
              return dxTrans._promise('readwrite', ()=>addPutOrDelete(req), true);
            case 'deleteRange':
              if (deleting.fire === nop) break;
              return dxTrans._promise('readwrite', ()=>deleteRange(req), true);
          }
          // Any of the breaks above happened (no hooks) - do the default:
          return downTable.mutate(req);


          function addPutOrDelete(req: DBCoreAddRequest | DBCorePutRequest | DBCoreDeleteRequest): Promise<DBCoreMutateResponse> {
            const dxTrans = PSD.trans;
            const keys = req.keys || getEffectiveKeys(primaryKey, req);
            if (!keys) throw new Error("Keys missing");
            // Clone Request and set keys arg
            req = req.type === 'add' || req.type === 'put' ?
              {...req, keys} :
              {...req};
            if (req.type !== 'delete') req.values = [...req.values];
            if (req.keys) req.keys = [...req.keys];
  
            return getExistingValues(downTable, req, keys).then (existingValues => {
              const contexts = keys.map((key, i) => {
                const existingValue = existingValues[i];
                const ctx = { onerror: null, onsuccess: null };
                if (req.type === 'delete') {
                  // delete operation
                  deleting.fire.call(ctx, key, existingValue, dxTrans);
                } else if (req.type === 'add' || existingValue === undefined) {
                  // The add() or put() resulted in a create
                  const generatedPrimaryKey = creating.fire.call(ctx, key, req.values[i], dxTrans);
                  if (key == null && generatedPrimaryKey != null) {
                    key = generatedPrimaryKey;
                    req.keys[i] = key;
                    if (!primaryKey.outbound) {
                      setByKeyPath(req.values[i], primaryKey.keyPath, key);
                    }
                  }
                } else {
                  // The put() operation resulted in an update
                  const objectDiff = getObjectDiff(existingValue, req.values[i]);
                  const additionalChanges = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans);
                  if (additionalChanges) {
                    const requestedValue = req.values[i];
                    Object.keys(additionalChanges).forEach(keyPath => {
                      if (hasOwn(requestedValue, keyPath)) {
                        // keyPath is already present as a literal property of the object
                        requestedValue[keyPath] = additionalChanges[keyPath];
                      } else {
                        // keyPath represents a new or existing path into the object
                        setByKeyPath(requestedValue, keyPath, additionalChanges[keyPath]);
                      }
                    });
                  }
                }
                return ctx;
              });
              return downTable.mutate(req).then(({failures, results, numFailures, lastResult}) => {
                for (let i=0; i<keys.length; ++i) {
                  const primKey = results ? results[i] : keys[i];
                  const ctx = contexts[i];
                  if (primKey == null) {
                    ctx.onerror && ctx.onerror(failures[i]);
                  } else {
                    ctx.onsuccess && ctx.onsuccess(
                      req.type === 'put' && existingValues[i] ? // the put resulted in an update
                        req.values[i] : // update hooks expects existing value
                        primKey // create hooks expects primary key
                    );
                  }
                }
                return {failures, results, numFailures, lastResult};
              }).catch(error => {
                contexts.forEach(ctx => ctx.onerror && ctx.onerror(error));
                return Promise.reject(error);
              });
            });
          }
  
          function deleteRange(req: DBCoreDeleteRangeRequest): Promise<DBCoreMutateResponse> {
            return deleteNextChunk(req.trans, req.range, 10000);
          }
  
          function deleteNextChunk(trans: DBCoreTransaction, range: DBCoreKeyRange, limit: number) {
            // Query what keys in the DB within the given range
            return downTable.query({trans, values: false, query: {index: primaryKey, range}, limit})
            .then(({result}) => {
              // Given a set of keys, bulk delete those using the same procedure as in addPutOrDelete().
              // This will make sure that deleting hook is called.
              return addPutOrDelete({type: 'delete', keys: result, trans}).then(res => {
                if (res.numFailures > 0) return Promise.reject(res.failures[0]);
                if (result.length < limit) {
                  return {failures: [], numFailures: 0, lastResult: undefined} as DBCoreMutateResponse;
                } else {
                  return deleteNextChunk(trans, {...range, lower: result[result.length - 1], lowerOpen: true}, limit);
                }
              });
            })
          }
        }
      };
      //const {lock, lockableMiddleware} = LockableTableMiddleware(tableMiddleware);

      return tableMiddleware;
    },
  }) as DBCore
};

function getExistingValues(
  table: DBCoreTable,
  req: DBCoreAddRequest | DBCorePutRequest | DBCoreDeleteRequest,
  effectiveKeys: any[]
) {
  return req.type === "add"
    ? Promise.resolve([])
    : table.getMany({ trans: req.trans, keys: effectiveKeys, cache: "immutable" });
}
