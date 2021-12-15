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
              // @ts-ignore
              if (req.trans.disableChangeTracking) {
                return table.mutate(req);
              }

              const trans = req.trans as DBCoreTransaction & TXExpandos;
              //const { primaryKey } = table.schema;
              if (db.cloud.schema?.[tableName]?.markedForSync) {
                if (req.type === 'add' || req.type === 'put') {
                  // No matter if user is logged in or not, make sure "owner" and "realmId" props are set properly.
                  // If not logged in, this will be changed upon syncification of the tables (next sync after login),
                  // however, application code will work better if we can always rely on that the properties realmId
                  // and owner are set. Application code may index them and query them based on db.cloud.currentUserId,
                  // and expect them to be returned. That scenario must work also when db.cloud.currentUserId === 'unauthorized'.
                  for (const obj of req.values) {
                    if (!obj.owner) {
                      obj.owner = trans.currentUser.userId;
                    }
                    if (!obj.realmId) {
                      obj.realmId = trans.currentUser.userId;
                    }
                    //const key = primaryKey.extractKey?.(obj);
                    //if (key && key[0] === '#') {
                    // Add $ts prop for put operations
                    if (req.type === 'put') {
                      obj.$ts = Date.now();
                    }
                    //}
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
