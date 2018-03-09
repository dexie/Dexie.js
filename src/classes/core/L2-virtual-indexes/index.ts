import { DBCore, QueryRequest, OpenCursorRequest, CountRequest, KeyRange, Cursor, Key, IndexSchema, QueryResponse, RangeType } from '../L1-dbcore/dbcore';
import { isArray } from '../../../functions/utils';
import { exceptions } from '../../../errors';
import { getKeyExtractor } from './get-key-extractor';

export type VirtualIndexLookup = {[keyPath: string]: VirtualIndex[]};
export interface VirtualIndex {
  /** Identical to keyPaths.length. Can be 0..N. Note: This is the length of the *virtual index*, not
   * the real index.
   */
  keyLength: number;

  /** If this is a virtual index representing all but some keys in a compound index,
   * the keyTail is a number of skipped keys from the real index.
   */
  keyTail?: number; 

  /** 0..N keyPaths that really represents the property that this index refers to.
   * For outbound primary keys, this is null.
   * For normal indexes, this is same as index.keyPath.
   * For virtually normal indexes (but compound internally), this will still be the single keyPath.
  */
  keyPaths: string[];

  /** Index or primary key */
  index: IndexSchema;

  /** Extract (using keyPath) a key from given value (object)
   * 
  */
  extractKey: (value: any) => Key;
}

export interface VirtualIndexCore<TQuery=KeyRange> extends DBCore<TQuery> {
  readonly tableIndexLookup: {
    [tableName: string]: VirtualIndexLookup;
  }
}

const MIN_KEY = -Infinity;
const MAX_KEY = [[]];

// Move into some util:
export function pad (a: any | any[], value: any, count: number) {
  if (!isArray(a)) a = [a];
  const {length} = a;
  const result = new Array(length + count);
  for (let i=a.length+count-1; i>=length; --i) {
    result[i] = value;
  }
  return result;
}

export function VirtualIndexCore (next: DBCore) : VirtualIndexCore {
  const tableIndexLookup = {} as {
    [tableName: string]: VirtualIndexLookup
  };

  // NEEDS REVIEW AND UNIT TEST!!!
  const addVirtualIndexes = (tableName: string, keyPath: string | string[], keyTail: number, lowLevelIndex: IndexSchema) => {
    const keyPaths = keyPath == null ? [] : isArray(keyPath) ? keyPath : [keyPath];
    const indexLookup = (tableIndexLookup[tableName] = tableIndexLookup[tableName] || {});

    // Translate array based keyPath to an index name
    const keyPathAlias = keyPaths.length > 1 ?
      `[${keyPaths.join('+')}]` :
      keyPaths.length === 1 ?
        keyPaths[0] :
        ":id";

    const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
    const extractKey = getKeyExtractor(keyPaths);
    const keyLength = keyPaths.length;
    if (keyLength > 1) {
      const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
      indexList.push({index: lowLevelIndex, keyTail, keyLength, keyPaths, extractKey});
      addVirtualIndexes(tableName, keyPaths.slice(0, keyLength - 1), keyTail + 1, lowLevelIndex);
    } else {
      // Map the simple keyPath to the index.
      indexList.push({index: lowLevelIndex, keyTail: 0, keyLength: 1, keyPaths, extractKey});
    }
    indexList.sort((a,b) => a.keyTail - b.keyTail); // Shortest keyTail is the best one (represents real index)
  };

  const {schema} = next;
  for (let table of schema.tables) {
    // Add special keyPath ":id" that corresponds to the primary key:    
    addVirtualIndexes(table.name, ":id", 0, table.primaryKey);
    if (table.primaryKey.keyPath) {
      // inbound keys
      addVirtualIndexes(table.name, table.primaryKey.keyPath, 0, table.primaryKey);
    }
    for (let index of table.indexes) {
      addVirtualIndexes(table.name, index.keyPath, 0, index);
    }
  }

  function findBestIndex({table, index}: {table: string, index?: string}): VirtualIndex {
    const indexLookup = tableIndexLookup[table];
    if (!indexLookup) throw new exceptions.InvalidTable(`Invalid table: ${table}`);
    if (index == null) index = ":id";
    const result = indexLookup[index];
    if (!result) throw new exceptions.NotFound(`Could not find an index to query property ${index}`);
    return result[0];
  }

  function translateRange (range: KeyRange, keyTail: number): KeyRange {
    return {
      type: range.type === RangeType.Equal ?
        RangeType.Range :
        range.type,
      lower: pad(range.lower, range.lowerOpen ? MAX_KEY : MIN_KEY, keyTail),
      lowerOpen: true, // doesn't matter true or false
      upper: pad(range.upper, range.upperOpen ? MIN_KEY : MAX_KEY, keyTail),
      upperOpen: true // doesn't matter true or false
    };
  }

  function translateRequest (req: QueryRequest | OpenCursorRequest | CountRequest) {
    const {index, keyTail} = findBestIndex(req);
    if (!keyTail) {
      // No virtual compound index with keyTail.
      // Just replace the index name with the name that the DBCore recognizes
      return {...req, index: index.name};
    }

    // Translate range as well
    return {
      ...req,
      index: index.name,
      range: translateRange(req.query, keyTail)
    };
  }
  
  /** Virtual Index DBCore
   * 
   * Translates incoming index names to physical index names.
   * 
   * * Canonicalize index naming no matter their real names in DBCode.schema.
   * * Virtualize first parts of compound indexes as if they were normal named indexes.
   * * Let special index ":id" resolve to the primary key.
   * * Allows virtual indexes on sub-queries where first part of a compound index is a fixed key (x.equals(A) AND y.between(range))
   * 
   */
  const thiz = {
    ...next,

    tableIndexLookup,

    count(req: CountRequest): Promise<number> {
      return next.count(translateRequest(req));
    },    

    getAll(req: QueryRequest) : Promise<QueryResponse> {
      return next.query(translateRequest(req));
    },

    openCursor(req: OpenCursorRequest) : Promise<Cursor> {
      const {keyTail, keyLength} = findBestIndex(req);
      if (!keyTail) return next.openCursor(translateRequest(req));

      function ProxyCursor(cursor: Cursor) : Cursor {
        function _continue (key?: Key) {
          key != null ?
            cursor.continue(pad(key, -Infinity, keyTail)) :
            req.unique ?
              cursor.continue(pad(key, MAX_KEY, keyTail)) :
              cursor.continue()
        }
        return {
          ...cursor,
          continue: _continue,
          continuePrimaryKey: (key: Key, primaryKey: Key) => {
            cursor.continuePrimaryKey(pad(key, -Infinity, keyTail), primaryKey);
          },
          advance: cursor.advance.bind(cursor),
          get key() {
            const key = cursor.key as any[];
            return keyLength - keyTail === 1 ?
              key[0] :
              key.slice(0, keyLength - keyTail);
          }
        };
      }

      return next.openCursor(translateRequest(req))
        .then(cursor=>cursor && (keyTail ? ProxyCursor(cursor) : cursor));
    }
  };

  return thiz;
}
