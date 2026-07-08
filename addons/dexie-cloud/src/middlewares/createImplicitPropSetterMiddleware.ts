import Dexie, { DBCore, DBCoreTransaction, Middleware } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { TXExpandos } from '../types/TXExpandos';
import { UNAUTHORIZED_USER } from '../authentication/UNAUTHORIZED_USER';

export function createImplicitPropSetterMiddleware(
  db: DexieCloudDB
): Middleware<DBCore> {
  return {
    stack: 'dbcore',
    name: 'implicitPropSetterMiddleware',
    level: 1,
    create: (core) => {
      return {
        ...core,
        table: (tableName) => {
          const table = core.table(tableName);
          return {
            ...table,
            mutate: (req) => {
              const trans = req.trans as DBCoreTransaction &
                TXExpandos &
                IDBTransaction;

              if (trans.disableChangeTracking) {
                return table.mutate(req);
              }

              const currentUserId =
                trans.currentUser?.userId ?? UNAUTHORIZED_USER.userId;

              if (db.cloud.schema?.[tableName]?.markedForSync) {
                if (req.type === 'add' || req.type === 'put') {
                  let values: any[] | null = null;

                  for (let i = 0; i < req.values.length; i++) {
                    const obj = req.values[i];
                    if (obj && typeof obj === 'object') {
                      let needsClone = false;
                      let email = obj.email;
                      if (tableName === 'members' && typeof email === 'string') {
                        const trimmedLower = email.trim().toLowerCase();
                        if (trimmedLower !== email) {
                          needsClone = true;
                          email = trimmedLower;
                        }
                      }

                      const owner = obj.owner || currentUserId;
                      const realmId = obj.realmId || currentUserId;
                      if (owner !== obj.owner || realmId !== obj.realmId) {
                        needsClone = true;
                      }

                      let ts = obj.$ts;
                      let isPrivatePut = false;
                      if (req.type === 'put') {
                        const key = table.schema.primaryKey.extractKey?.(obj);
                        if (typeof key === 'string' && key[0] === '#') {
                          isPrivatePut = true;
                          ts = Date.now();
                          if (ts !== obj.$ts) {
                            needsClone = true;
                          }
                        }
                      }

                      if (
                        !needsClone &&
                        (Object.isFrozen(obj) ||
                          Object.isSealed(obj) ||
                          !Object.isExtensible(obj))
                      ) {
                        needsClone = true;
                      }

                      if (needsClone) {
                        if (!values) {
                          values = [...req.values];
                        }
                        const cloned = { ...obj };
                        if (tableName === 'members' && typeof email === 'string') {
                          cloned.email = email;
                        }
                        cloned.owner = owner;
                        cloned.realmId = realmId;
                        if (isPrivatePut) {
                          cloned.$ts = ts;
                        }
                        values[i] = cloned;
                      }
                    }
                  }

                  if (values) {
                    req = { ...req, values };
                  }

                  // Handle degrading the request for private IDs if needed:
                  let mutatedReq = false;
                  for (const obj of req.values) {
                    const key = table.schema.primaryKey.extractKey?.(obj);
                    if (typeof key === 'string' && key[0] === '#') {
                      if (req.type === 'put') {
                        if (!mutatedReq) {
                          req = { ...req };
                          mutatedReq = true;
                        }
                        delete req.criteria;
                        delete req.changeSpec;
                        if (!req.upsert) delete req.updates;
                      }
                    }
                  }
                }
              }
              return table.mutate(req);
            },
          };
        },
      };
    },
  };
}
