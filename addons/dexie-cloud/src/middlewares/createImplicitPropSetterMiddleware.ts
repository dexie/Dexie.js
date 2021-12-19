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
                    const key = table.schema.primaryKey.extractKey?.(obj);
                    if (typeof key === 'string' && key[0] === '#') {
                      // Add $ts prop for put operations and
                      // disable update operations as well as consistent
                      // modify operations. Reason: Server may not have
                      // the object. Object should be created on server only
                      // if is being updated. An update operation won't create it
                      // so we must delete req.changeSpec to decrate operation to
                      // an upsert operation with timestamp so that it will be created.
                      // We must also degrade from consistent modify operations for the
                      // same reason - object might be there on server. Must but put up instead.

                      // FUTURE: This clumpsy behavior of private IDs could be refined later.
                      // Suggestion is to in future, treat private IDs as we treat all objects 
                      // and sync operations normally. Only that deletions should become soft deletes
                      // for them - so that server knows when a private ID has been deleted on server
                      // not accept insert/upserts on them.
                      if (req.type === 'put') {
                        const now = Date.now();
                        delete req.criteria;
                        delete req.changeSpec;
                        delete req.changeSpecs;
                        obj.$ts = Date.now();
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
