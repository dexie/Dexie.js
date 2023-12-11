import Dexie, { DBCoreSchema } from 'dexie';
import {
  DBInsertOperation,
  DBOperation,
  DBOperationsSet,
  DBOpPrimaryKey,
} from 'dexie-cloud-common';
import { UserLogin } from '../db/entities/UserLogin';

export function encodeIdsForServer(
  schema: DBCoreSchema,
  currentUser: UserLogin,
  changes: DBOperationsSet
): DBOperationsSet {
  const rv: DBOperationsSet = [];
  for (let change of changes) {
    const { table, muts } = change;
    const tableSchema = schema.tables.find((t) => t.name === table);
    if (!tableSchema)
      throw new Error(
        `Internal error: table ${table} not found in DBCore schema`
      );
    const { primaryKey } = tableSchema;
    let changeClone = change;
    muts.forEach((mut, mutIndex) => {
      const rewriteValues =
        !primaryKey.outbound &&
        (mut.type === 'upsert' || mut.type === 'insert');
      mut.keys.forEach((key, keyIndex) => {
        if (Array.isArray(key)) {
          // Server only support string keys. Dexie Cloud client support strings or array of strings.
          if (changeClone === change)
            changeClone = cloneChange(change, rewriteValues);
          const mutClone = changeClone.muts[mutIndex];
          const rewrittenKey = JSON.stringify(key);
          mutClone.keys[keyIndex] = rewrittenKey;
          /* Bug (#1777)
            We should not rewrite values. It will fail because the key is array and the value is string.
            Only the keys should be rewritten and it's already done on the server.
            We should take another round of revieweing how key transformations are being done between
            client and server and let the server do the key transformations entirely instead now that
            we have the primary key schema on the server making it possible to do so.
            if (rewriteValues) {
            Dexie.setByKeyPath(
              (mutClone as DBInsertOperation).values[keyIndex],
              primaryKey.keyPath!,
              rewrittenKey
            );
          }*/
        } else if (key[0] === '#') {
          // Private ID - translate!
          if (changeClone === change)
            changeClone = cloneChange(change, rewriteValues);
          const mutClone = changeClone.muts[mutIndex];
          if (!currentUser.isLoggedIn)
            throw new Error(
              `Internal error: Cannot sync private IDs before authenticated`
            );
          const rewrittenKey = `${key}:${currentUser.userId}`;
          mutClone.keys[keyIndex] = rewrittenKey;
          if (rewriteValues) {
            Dexie.setByKeyPath(
              (mutClone as DBInsertOperation).values[keyIndex],
              primaryKey.keyPath!,
              rewrittenKey
            );
          }
        }
      });
    });
    rv.push(changeClone);
  }
  return rv;
}

function cloneChange(change: DBOperationsSet[number], rewriteValues: boolean) {
  // clone on demand:
  return {
    ...change,
    muts: rewriteValues
      ? change.muts.map((m) => {
          return (m.type === 'insert' || m.type === 'upsert') && m.values
            ? {
                ...m,
                keys: m.keys.slice(),
                values: m.values.slice(),
              }
            : {
                ...m,
                keys: m.keys.slice(),
              };
        })
      : change.muts.map((m) => ({ ...m, keys: m.keys.slice() })),
  };
}
