import { DBCore, KeyRangeQuery, KeyRange, Cursor, OpenCursorResponse, Key, IndexSchema } from '../L1-dbcore/dbcore';
import { isArray } from '../../../functions/utils';
import { exceptions } from '../../../errors';

export type VirtualIndexLookup = {[keyPath: string]: VirtualIndex[]};
export interface VirtualIndex {
  keyLength: number;

  /** If this is a virtual index representing all but some keys in a compound index. */
  keyTail?: number; 

  /** Same as index.keyPath but will always be an array of strings */
  keyPaths: string[];

  /** Index or primary key */
  index?: IndexSchema;
}

export interface VirtualIndexCore extends DBCore {
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
    const keyPaths = isArray(keyPath) ? keyPath : [keyPath];
    const indexLookup = (tableIndexLookup[tableName] = tableIndexLookup[tableName] || {});

    // Translate array based keyPath to an index name
    const keyPathAlias = keyPaths.length > 1 ?
      `[${keyPaths.join('+')}]` :
      keyPaths[0];
    const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);

    const keyLength = keyPaths.length;
    if (keyLength > 1) {
      const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
      indexList.push({index: lowLevelIndex, keyTail, keyLength, keyPaths});
      addVirtualIndexes(tableName, keyPaths.slice(0, keyLength - 1), keyTail + 1, lowLevelIndex);
    } else {
      // Map the simple keyPath to the index.
      indexList.push({index: lowLevelIndex, keyTail: 0, keyLength: 1, keyPaths});
    }
    indexList.sort((a,b) => a.keyTail - b.keyTail)
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

  function findBestIndex({table, index}: KeyRangeQuery) {
    const indexLookup = tableIndexLookup[table];
    if (!indexLookup) throw new exceptions.InvalidTable(`Invalid table: ${table}`);
    if (index == null) index = ":id";
    const result = indexLookup[index];
    if (!result) throw new exceptions.NotFound(`Could not find an index to query property ${index}`);
    return result[0];
  }

  function translateRange (range: KeyRange, keyTail: number) {
    return {
      lower: pad(range.lower, range.lowerOpen ? MAX_KEY : MIN_KEY, keyTail),
      lowerOpen: true, // doesn't matter true or false
      upper: pad(range.upper, range.upperOpen ? MIN_KEY : MAX_KEY, keyTail),
      upperOpen: true // doesn't matter true or false
    };
  }

  function translateQuery (query: KeyRangeQuery) {
    const {index, keyTail} = findBestIndex(query);
    if (!keyTail) {
      // No virtual compound index with keyTail.
      // Just replace the index name with the name that the DBCore recognizes
      return {...query, index: index.name};
    }

    // Translate range as well
    return {
      ...query,
      index: index.name,
      range: translateRange(query.range, keyTail)
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

    count(query): Promise<number> {
      return next.count(translateQuery(query));
    },    

    getAll(query) : Promise<any[]> {
      return next.getAll(translateQuery(query));
    },

    openCursor(query: KeyRangeQuery) : Promise<OpenCursorResponse> {
      const {keyTail, keyLength} = findBestIndex(query);
      if (!keyTail) return next.openCursor(translateQuery(query));

      function ProxyCursor(cursor: Cursor) : Cursor {
        function _continue (key?: Key) {
          key != null ?
            cursor.continue(pad(key, -Infinity, keyTail)) :
            query.unique ?
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

      return next.openCursor(translateQuery(query)).then(({cursor, iterate})=>({
        cursor: cursor && (keyTail ? ProxyCursor(cursor) : cursor),
        iterate
      }));
    }
  };

  return thiz;
}
