import Dexie, {
  DBCore,
  Middleware,
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreIndex,
} from "dexie";
import { b64LexEncode } from "dreambase-library/dist/common/b64lex";
import { DexieCloudServerState } from "../DexieCloudServerState";
import { DexieCloudOptions } from "../DexieCloudOptions";
import { getSyncableTables } from "../helpers/getSyncableTables";
import { DexieCloudDB } from "../db/DexieCloudDB";
import { isValidSyncableID } from "dexie-cloud-common";

const { toString } = {};
export function toStringTag(o: Object) {
  return toString.call(o).slice(8, -1);
}


export function getEffectiveKeys(
  primaryKey: DBCoreIndex,
  req:
    | (Pick<DBCoreAddRequest | DBCorePutRequest, "type" | "values"> & {
        keys?: any[];
      })
    | Pick<DBCoreDeleteRequest, "keys" | "type">
) {
  if (req.type === "delete") return req.keys;
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

export function generateTablePrefix(
  tableName: string,
  allPrefixes: Set<string>
) {
  let rv = "";
  for (let i = 0, l = tableName.length; i < l && rv.length < 3; ++i) {
    if (consonants.test(tableName[i])) rv += tableName[i].toLowerCase();
  }
  while (allPrefixes.has(rv)) {
    if (/\d/g.test(rv)) {
      rv = rv.substr(0, rv.length - 1) + (rv[rv.length - 1] + 1);
      if (rv.length > 3) rv = rv.substr(0, 3);
      else continue;
    } else if (rv.length < 3) {
      rv = rv + "2";
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
function generateKey(prefix: string) {
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
  timePart[0] = time / 0x1_00_00_00_00_00;
  timePart[1] = time / 0x1_00_00_00_00;
  timePart[2] = time / 0x1_00_00_00;
  timePart[3] = time / 0x1_00_00;
  timePart[4] = time / 0x1_00;
  timePart[5] = time;
  const randomPart = new Uint8Array(a.buffer, 6);
  crypto.getRandomValues(randomPart);
  const id = new Uint8Array(a.buffer);
  return prefix + b64LexEncode(id);
}

export function createIdGenerationMiddleware(
  db: DexieCloudDB
): Middleware<DBCore> {
  const isSyncable = new Set(getSyncableTables(db).map(tbl => tbl.name));
  return {
    stack: "dbcore",
    name: "idGenerationMiddleware",
    level: 0,
    create: (core) => {
      return {
        ...core,
        table: (tableName) => {
          const table = core.table(tableName);
          return {
            ...table,
            mutate: (req) => {
              const cloudTableSchema = db.cloud.schema?.[tableName];
              if (req.type === "add" || req.type === "put") {
                if (!cloudTableSchema?.generatedGlobalId) {
                  if (isSyncable.has(tableName)) {
                    // Just make sure primary key is of a supported type:
                    const keys = getEffectiveKeys(table.schema.primaryKey, req);
                    keys.forEach((key, idx) => {
                      if (!isValidSyncableID(key)) {
                        throw new Dexie.ConstraintError(`Invalid primary key ${key} for table ${tableName}. Tables marked for sync must have primary keys of type strings or Uint8Arrays.`);
                      }
                    });                  
                  }
                } else {
                  let valueClones: null | object[] = null;
                  const keys = getEffectiveKeys(table.schema.primaryKey, req);
                  keys.forEach((key, idx) => {
                    if (key === undefined) {
                      keys[idx] = generateKey(cloudTableSchema.idPrefix!);
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
                      typeof key !== "string" ||
                      !key.startsWith(cloudTableSchema.idPrefix!)
                    ) {
                      throw new Dexie.ConstraintError(
                        `The ID "${key}" is not valid for table "${tableName}". ` +
                          `Primary '@' keys requires the key to be prefixed with "${cloudTableSchema.idPrefix}.\n"` +
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
              }
              return table.mutate(req);
            },
          };
        },
      };
    },
  };
}
