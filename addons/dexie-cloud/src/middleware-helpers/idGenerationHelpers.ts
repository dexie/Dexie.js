import {
  DBCoreAddRequest,
  DBCoreDeleteRequest,
  DBCoreIndex, DBCorePutRequest
} from 'dexie';
import { b64LexEncode } from 'dreambase-library/dist/common/b64lex';

const { toString } = {};
export function toStringTag(o: Object) {
  return toString.call(o).slice(8, -1);
}

export function getEffectiveKeys(
  primaryKey: DBCoreIndex,
  req: (Pick<DBCoreAddRequest | DBCorePutRequest, 'type' | 'values'> & {
    keys?: any[];
  }) |
    Pick<DBCoreDeleteRequest, 'keys' | 'type'>
) {
  if (req.type === 'delete')
    return req.keys;
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
      if (rv.length > 3)
        rv = rv.substr(0, 3);
      else
        continue;
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
    if (bitFix < 8)
      rv = upperFixed;
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
export function generateKey(prefix: string, shardKey?: string) {
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
  timePart[0] = time / 1099511627776; // Normal division (no bitwise operator) --> works with >= 32 bits.
  timePart[1] = time / 4294967296;
  timePart[2] = time / 16777216;
  timePart[3] = time / 65536;
  timePart[4] = time / 256;
  timePart[5] = time;
  const randomPart = new Uint8Array(a.buffer, 6);
  crypto.getRandomValues(randomPart);
  const id = new Uint8Array(a.buffer);
  return prefix + b64LexEncode(id) + (shardKey || '');
}
