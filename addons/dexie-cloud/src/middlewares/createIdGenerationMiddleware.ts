import Dexie, {
  DBCore,
  DBCoreAddRequest,
  DBCoreDeleteRequest,
  DBCoreIndex,
  DBCoreMutateRequest,
  DBCorePutRequest,
  Middleware
} from 'dexie';
import { isValidSyncableID } from 'dexie-cloud-common';
import { b64LexEncode } from 'dreambase-library/dist/common/b64lex';
import { DexieCloudDB } from '../db/DexieCloudDB';

const { toString } = {};
export function toStringTag(o: Object) {
  return toString.call(o).slice(8, -1);
}

export function getEffectiveKeys(
  primaryKey: DBCoreIndex,
  req:
    | (Pick<DBCoreAddRequest | DBCorePutRequest, 'type' | 'values'> & {
        keys?: any[];
      })
    | Pick<DBCoreDeleteRequest, 'keys' | 'type'>
) {
  if (req.type === 'delete') return req.keys;
  return req.keys?.slice() || req.values.map(primaryKey.extractKey!);
}

function applyToUpperBitFix(orig: string, bits: number) {
  return (
    (bits & 1 ? orig[0].toUpperCase() : orig[0].toLowerCase()) +
    (bits & 2 ? orig[1].toUpperCase() : orig[1].toLowerCase()) +
    (bits & 4 ? orig[2].toUpperCase() : orig[2].toLowerCase())
  );
}

const consonants = /b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|x|y|z/i;

function isUpperCase(ch: string) {
  return ch >= 'A' && ch <= 'Z';
}

export function generateTablePrefix(
  tableName: string,
  allPrefixes: Set<string>
) {
  let rv = tableName[0].toLocaleLowerCase(); // "users" = "usr", "friends" = "frn", "realms" = "rlm", etc.
  for (let i = 1, l = tableName.length; i < l && rv.length < 3; ++i) {
    if (consonants.test(tableName[i]) || isUpperCase(tableName[i]))
      rv += tableName[i].toLowerCase();
  }
  while (allPrefixes.has(rv)) {
    if (/\d/g.test(rv)) {
      rv = rv.substr(0, rv.length - 1) + (rv[rv.length - 1] + 1);
      if (rv.length > 3) rv = rv.substr(0, 3);
      else continue;
    } else if (rv.length < 3) {
      rv = rv + '2';
      continue;
    }
    let bitFix = 1;
    let upperFixed = rv;
    while (allPrefixes.has(upperFixed) && bitFix < 8) {
      upperFixed = applyToUpperBitFix(rv, bitFix);
      ++bitFix;
    }
    if (bitFix < 8) rv = upperFixed;
    else {
      let nextChar = (rv.charCodeAt(2) + 1) & 127;
      rv = rv.substr(0, 2) + String.fromCharCode(nextChar);
      // Here, in theory we could get an infinite loop if having 127*8 table names with identical 3 first consonants.
    }
  }
  return rv;
}

let time = 0;
/**
 *
 * @param prefix A unique 3-letter short-name of the table.
 * @param shardKey 3 last letters from another ID if colocation is requested. Verified on server on inserts - guarantees unique IDs across shards.
 *  The shardKey part of the key represent the shardId where it was first created. An object with this
 *  primary key can later on be moved to another shard without being altered. The reason for having
 *  the origin shardKey as part of the key, is that the server will not need to check uniqueness constraint
 *  across all shards on every insert. Updates / moves across shards are already controlled by the server
 *  in the sense that the objects needs to be there already - we only need this part for inserts.
 * @returns
 */
function generateKey(prefix: string, shardKey?: string) {
  const a = new Uint8Array(18);
  const timePart = new Uint8Array(a.buffer, 0, 6);
  const now = Date.now(); // Will fit into 6 bytes until year 10 895.
  if (time >= now) {
    // User is bulk-creating objects the same millisecond.
    // Increment the time part by one millisecond for each item.
    // If bulk-creating 1,000,000 rows client-side in 10 seconds,
    // the last time-stamp will be 990 seconds in future, which is no biggie at all.
    // The point is to create a nice order of the generated IDs instead of
    // using random ids.
    ++time;
  } else {
    time = now;
  }
  timePart[0] = time / 0x1_00_00_00_00_00; // Normal division (no bitwise operator) --> works with >= 32 bits.
  timePart[1] = time / 0x1_00_00_00_00;
  timePart[2] = time / 0x1_00_00_00;
  timePart[3] = time / 0x1_00_00;
  timePart[4] = time / 0x1_00;
  timePart[5] = time;
  const randomPart = new Uint8Array(a.buffer, 6);
  crypto.getRandomValues(randomPart);
  const id = new Uint8Array(a.buffer);
  return prefix + b64LexEncode(id) + (shardKey || '');
}

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

          function generateOrVerifyAtKeys(req: DBCoreAddRequest | DBCorePutRequest, idPrefix: string) {
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
                    table.schema.primaryKey.keyPath as any, // TODO: fix typings in dexie-constructor.d.ts!
                    keys[idx]
                  );
                }
              } else if (
                typeof key !== 'string' ||
                !key.startsWith(idPrefix)
              ) {
                // Key was specified by caller. Verify it complies with id prefix.
                throw new Dexie.ConstraintError(
                  `The ID "${key}" is not valid for table "${tableName}". ` +
                    `Primary '@' keys requires the key to be prefixed with "${idPrefix}.\n"` +
                    `If you want to generate IDs programmatically, remove '@' from the schema to get rid of this constraint. Dexie Cloud supports custom IDs as long as they are random and globally unique.`
                );
              }
            });
            return table.mutate({
              ...req,
              keys,
              values: valueClones || req.values
            });
          }

          return {
            ...table,
            mutate: (req) => {
              // @ts-ignore
              if (req.trans.disableChangeTracking) {
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
                        const type = Array.isArray(key) ? key.map(toStringTag).join(',') : toStringTag(key);
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
                    return table.getMany({keys, trans: req.trans, cache: "immutable"}).then(results => {
                      if (results.length < keys.length) {
                        // At least one of the given objects would be created. Complain since
                        // the generated ID would be based on a locally computed ID prefix only - we wouldn't
                        // know if the server would give the same ID prefix until an initial sync has been
                        // performed.
                        throw new Error(`Unable to create new objects without an initial sync having been performed.`);
                      }
                      return table.mutate(req);
                    });
                  }
                  return generateOrVerifyAtKeys(req, cloudTableSchema.idPrefix!);
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
