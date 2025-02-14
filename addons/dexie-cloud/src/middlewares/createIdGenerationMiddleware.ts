import Dexie, {
  DBCore,
  DBCoreAddRequest,
  DBCoreMutateRequest,
  DBCorePutRequest,
  DBCoreTransaction,
  Middleware,
} from 'dexie';
import { isValidSyncableID } from 'dexie-cloud-common';
import { DexieCloudDB } from '../db/DexieCloudDB';
import {
  getEffectiveKeys,
  generateKey,
  toStringTag,
} from '../middleware-helpers/idGenerationHelpers';
import { TXExpandos } from '../types/TXExpandos';

export function createIdGenerationMiddleware(
  db: DexieCloudDB
): Middleware<DBCore> {
  return {
    stack: 'dbcore',
    name: 'idGenerationMiddleware',
    level: 1,
    create: (core) => {
      return {
        ...core,
        table: (tableName) => {
          const table = core.table(tableName);

          function generateOrVerifyAtKeys(
            req: DBCoreAddRequest | DBCorePutRequest,
            idPrefix: string
          ) {
            let valueClones: null | object[] = null;
            const keys = getEffectiveKeys(table.schema.primaryKey, req);
            keys.forEach((key, idx) => {
              if (key === undefined) {
                // Generate the key
                const colocatedId =
                  req.values[idx].realmId || db.cloud.currentUserId;
                const shardKey = colocatedId.substr(colocatedId.length - 3);
                keys[idx] = generateKey(idPrefix, shardKey);
                if (!table.schema.primaryKey.outbound) {
                  if (!valueClones) valueClones = req.values.slice();
                  valueClones[idx] = Dexie.deepClone(valueClones[idx]);
                  Dexie.setByKeyPath(
                    valueClones[idx],
                    table.schema.primaryKey.keyPath!,
                    keys[idx]
                  );
                }
              } else if (
                typeof key !== 'string' ||
                (!key.startsWith(idPrefix) && !key.startsWith('#' + idPrefix))
              ) {
                // Key was specified by caller. Verify it complies with id prefix.
                throw new Dexie.ConstraintError(
                  `The ID "${key}" is not valid for table "${tableName}". ` +
                    `Primary '@' keys requires the key to be prefixed with "${idPrefix}" (or "#${idPrefix}).\n` +
                    `If you want to generate IDs programmatically, remove '@' from the schema to get rid of this constraint. Dexie Cloud supports custom IDs as long as they are random and globally unique.`
                );
              }
            });
            return table.mutate({
              ...req,
              keys,
              values: valueClones || req.values,
            });
          }

          return {
            ...table,
            mutate: (req) => {
              const idbtrans = req.trans as DBCoreTransaction & IDBTransaction & TXExpandos;
              if (idbtrans.mode === 'versionchange') {
                // Tell all the other middlewares to skip bothering. We're in versionchange mode.
                // dexie-cloud is not initialized yet.
                idbtrans.disableChangeTracking = true;
                idbtrans.disableAccessControl = true;
              }
              if (idbtrans.disableChangeTracking) {
                // Disable ID policy checks and ID generation
                return table.mutate(req);
              }
              if (req.type === 'add' || req.type === 'put') {
                const cloudTableSchema = db.cloud.schema?.[tableName];
                if (!cloudTableSchema?.generatedGlobalId) {
                  if (cloudTableSchema?.markedForSync) {
                    // Just make sure primary key is of a supported type:
                    const keys = getEffectiveKeys(table.schema.primaryKey, req);
                    keys.forEach((key, idx) => {
                      if (!isValidSyncableID(key)) {
                        const type = Array.isArray(key)
                          ? key.map(toStringTag).join(',')
                          : toStringTag(key);
                        throw new Dexie.ConstraintError(
                          `Invalid primary key type ${type} for table ${tableName}. Tables marked for sync has primary keys of type string or Array of string (and optional numbers)`
                        );
                      }
                    });
                  }
                } else {
                  if (db.cloud.options?.databaseUrl && !db.initiallySynced) {
                    // A database URL is configured but no initial sync has been performed.
                    const keys = getEffectiveKeys(table.schema.primaryKey, req);
                    // Check if the operation would yield any INSERT. If so, complain! We never want wrong ID prefixes stored.
                    return table
                      .getMany({ keys, trans: req.trans, cache: 'immutable' })
                      .then((results) => {
                        if (results.length < keys.length) {
                          // At least one of the given objects would be created. Complain since
                          // the generated ID would be based on a locally computed ID prefix only - we wouldn't
                          // know if the server would give the same ID prefix until an initial sync has been
                          // performed.
                          throw new Error(
                            `Unable to create new objects without an initial sync having been performed.`
                          );
                        }
                        return table.mutate(req);
                      });
                  }
                  return generateOrVerifyAtKeys(
                    req,
                    cloudTableSchema.idPrefix!
                  );
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
