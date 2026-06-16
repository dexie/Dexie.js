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
              const trans = req.trans as DBCoreTransaction & TXExpandos & IDBTransaction;

              if (trans.disableChangeTracking) {
                return table.mutate(req);
              }

              const currentUserId = trans.currentUser?.userId ?? UNAUTHORIZED_USER.userId;

              if (db.cloud.schema?.[tableName]?.markedForSync) {
                if (req.type === 'add' || req.type === 'put') {
                  if (tableName === 'members' || tableName === 'roles') {
                    for (const obj of req.values) {
                      if (obj && 'permissions' in obj) {
                        validatePermissions(obj.permissions, tableName);
                      }
                    }
                    if (req.type === 'put') {
                      const changeSpec = 'changeSpec' in req ? (req as any).changeSpec : undefined;
                      if (changeSpec) {
                        validateChangeSpec(changeSpec, tableName);
                      }
                      const updates = 'updates' in req ? (req as any).updates : undefined;
                      if (updates && updates.changeSpecs) {
                        for (const spec of updates.changeSpecs) {
                          validateChangeSpec(spec, tableName);
                        }
                      }
                    }
                  }
                  if (tableName === 'members') {
                    for (const member of req.values) {
                      if (typeof member.email === 'string') {
                        // Resolve https://github.com/dexie/dexie-cloud/issues/4
                        // If adding a member, make sure email is lowercase and trimmed.
                        // This is to avoid issues where the APP does not check this
                        // and just allows the user to enter an email address that might
                        // have been pasted by the user from a source that had a trailing
                        // space or was in uppercase. We want to avoid that the user
                        // creates a new member with a different email address than
                        // the one he/she intended to create.
                        member.email = member.email.trim().toLowerCase();
                      }
                    }
                  }
                  // No matter if user is logged in or not, make sure "owner" and "realmId" props are set properly.
                  // If not logged in, this will be changed upon syncification of the tables (next sync after login),
                  // however, application code will work better if we can always rely on that the properties realmId
                  // and owner are set. Application code may index them and query them based on db.cloud.currentUserId,
                  // and expect them to be returned. That scenario must work also when db.cloud.currentUserId === 'unauthorized'.
                  for (const obj of req.values) {
                    if (!obj.owner) {
                      obj.owner = currentUserId;
                    }
                    if (!obj.realmId) {
                      obj.realmId = currentUserId;
                    }
                    const key = table.schema.primaryKey.extractKey?.(obj);
                    if (typeof key === 'string' && key[0] === '#') {
                      // Add $ts prop for put operations and
                      // disable update operations as well as consistent
                      // modify operations. Reason: Server may not have
                      // the object. Object should be created on server only
                      // if is being updated. An update operation won't create it
                      // so we must delete req.changeSpec to degrade operation to
                      // an upsert operation with timestamp so that it will be created.
                      // We must also degrade from consistent modify operations for the
                      // same reason - object might be there on server. Must but put up instead.

                      // FUTURE: This clumpsy behavior of private IDs could be refined later.
                      // Suggestion is to in future, treat private IDs as we treat all objects 
                      // and sync operations normally. Only that deletions should become soft deletes
                      // for them - so that server knows when a private ID has been deleted on server
                      // not accept insert/upserts on them.
                      if (req.type === 'put') {
                        delete req.criteria;
                        delete req.changeSpec;
                        if (!req.upsert) delete req.updates;
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

function validatePermissions(permissions: any, tableName: string) {
  if (permissions === undefined) return;
  if (permissions === null || typeof permissions !== 'object' || Array.isArray(permissions)) {
    throw new TypeError(`Invalid permissions format in ${tableName}: permissions must be an object.`);
  }

  const { add, update, manage } = permissions;

  if (add !== undefined) {
    if (add !== '*' && (!Array.isArray(add) || add.some(x => typeof x !== 'string'))) {
      throw new TypeError(`Invalid 'add' permission format in ${tableName}: must be '*' or an array of strings.`);
    }
  }

  if (manage !== undefined) {
    if (manage !== '*' && (!Array.isArray(manage) || manage.some(x => typeof x !== 'string'))) {
      throw new TypeError(`Invalid 'manage' permission format in ${tableName}: must be '*' or an array of strings.`);
    }
  }

  if (update !== undefined) {
    if (update === null || typeof update !== 'object' || Array.isArray(update)) {
      throw new TypeError(`Invalid 'update' permission format in ${tableName}: must be an object.`);
    }
    for (const [tbl, props] of Object.entries(update)) {
      if (props !== '*' && (!Array.isArray(props) || props.some(x => typeof x !== 'string'))) {
        throw new TypeError(`Invalid update permission properties format for table '${tbl}' in ${tableName}: must be '*' or an array of strings.`);
      }
    }
  }
}

function validateChangeSpec(changeSpec: { [keyPath: string]: any }, tableName: string) {
  if (!changeSpec) return;
  for (const [keyPath, value] of Object.entries(changeSpec)) {
    if (keyPath === 'permissions') {
      validatePermissions(value, tableName);
    } else if (keyPath === 'permissions.add' || keyPath === 'permissions.manage') {
      if (value !== undefined && value !== '*' && (!Array.isArray(value) || value.some(x => typeof x !== 'string'))) {
        throw new TypeError(`Invalid '${keyPath}' format in ${tableName}: must be '*' or an array of strings.`);
      }
    } else if (keyPath === 'permissions.update') {
      if (value !== undefined) {
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          throw new TypeError(`Invalid 'permissions.update' format in ${tableName}: must be an object.`);
        }
        for (const [tbl, props] of Object.entries(value)) {
          if (props !== '*' && (!Array.isArray(props) || props.some(x => typeof x !== 'string'))) {
            throw new TypeError(`Invalid update permission properties format for table '${tbl}' in ${tableName}: must be '*' or an array of strings.`);
          }
        }
      }
    } else if (keyPath.startsWith('permissions.update.')) {
      if (value !== undefined && value !== '*' && (!Array.isArray(value) || value.some(x => typeof x !== 'string'))) {
        throw new TypeError(`Invalid update properties format for '${keyPath}' in ${tableName}: must be '*' or an array of strings.`);
      }
    }
  }
}
