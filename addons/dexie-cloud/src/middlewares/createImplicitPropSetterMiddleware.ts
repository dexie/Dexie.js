import { DBCore, DBCoreTransaction, Middleware } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { TXExpandos } from '../types/TXExpandos';

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
              const trans = req.trans as DBCoreTransaction & TXExpandos;
              if (
                db.cloud.schema?.[tableName]?.markedForSync &&
                trans.currentUser?.isLoggedIn
              ) {
                if (req.type === 'add' || req.type === 'put') {
                  // If user is logged in, make sure "owner" and "realmId" props are set properly.
                  // If not logged in, this will be set upon syncification of the tables (next sync after login)
                  for (const obj of req.values) {
                    if (!('owner' in obj)) {
                      obj.owner = trans.currentUser.userId;
                    }
                    if (!('realmId' in obj)) {
                      obj.realmId = trans.currentUser.userId;
                    }
                  }
                }
              }
              return table.mutate(req);
            }
          };
        }
      };
    }
  };
}
