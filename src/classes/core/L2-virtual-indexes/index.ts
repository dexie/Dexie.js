import { DBCore, RangeQuery, KeyRange, Cursor, OpenCursorResponse } from '../L1-dbcore/dbcore';
import { isArray } from '../../../functions/utils';
import { exceptions } from '../../../errors';

const MIN_KEY = -Infinity;
const MAX_KEY = [[]];

// Move into some util:
export function pad (a: any[], value: any, count: number) {
  const {length} = a;
  const result = new Array(length + count);
  for (let i=a.length+count-1; i>=length; --i) {
    result[i] = value;
  }
  return result;
}

export function createVirtualIndexCore (next: DBCore) : DBCore {
  const tableIndexLookup = {} as {
    [tableName: string]: {
      [keyPath: string]: {
        keyLength: number;
        keyTail?: number; // If this is a virtual index representing all but some keys in a compound index.
        index?: string; // If no index, this resolves to the primary key.
      }[]
    }
  };

  // NEEDS REVIEW AND UNIT TEST!!!
  const addKeyPathsAndAliases = (tableName: string, keyPath: string | string[], keyTail: number=0, lowLevelIndexName?: string) => {
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
      indexList.push({index: lowLevelIndexName, keyTail, keyLength});
      addKeyPathsAndAliases(tableName, keyPaths.slice(0, keyLength - 1), keyTail + 1, lowLevelIndexName);
    } else {
      // Map the simple keyPath to the index.
      indexList.push({index: lowLevelIndexName, keyTail: 0, keyLength: 1});
    }
    indexList.sort((a,b) => a.keyTail - b.keyTail)
  };

  const {schema} = next;
  for (let table of schema.tables) {
    // Add special keyPath ":id" that corresponds to the primary key:    
    addKeyPathsAndAliases(table.name, ":id", 0);
    if (table.keyPath) {
      // inbound keys
      addKeyPathsAndAliases(table.name, table.keyPath);
    }
    for (let index of table.indexes) {
      addKeyPathsAndAliases(table.name, index.keyPath, 0, index.name);
    }
  }

  function findPossibleIndexes({table, index}: RangeQuery) {
    const indexLookup = tableIndexLookup[table];
    if (!indexLookup) throw new exceptions.InvalidTable(`Invalid table: ${table}`);
    if (index == null) index = ":id";
    const result = indexLookup[index];
    if (!result) throw new exceptions.NotFound(`Could not find an index to query property ${index}`);
    return result;
  }

  function translateRange (range: KeyRange, keyTail: number) {
    return {
      lower: pad(range.lower, range.lowerOpen ? MAX_KEY : MIN_KEY, keyTail),
      lowerOpen: true, // doesn't matter true or false
      upper: pad(range.upper, range.upperOpen ? MIN_KEY : MAX_KEY, keyTail),
      upperOpen: true // doesn't matter true or false
    };
  }

  function translateQuery (query: RangeQuery) {
    const {index, keyTail} = findPossibleIndexes(query)[0];
    if (!keyTail) {
      // No virtual compound index with keyTail.
      // Just replace the index name with the name that the DBCore recognizes
      return {...query, index};
    }

    // Translate range as well
    return {
      ...query,
      index,
      range: translateRange(query.range, keyTail)
    };
  }
  
  return {
    ...next,

    count(query): Promise<number> {
      return next.count(translateQuery(query));
    },    

    getAll(query) : Promise<any[]> {
      return next.getAll(translateQuery(query));
    },

    openCursor(query) : Promise<OpenCursorResponse> {
      const {keyTail, keyLength} = findPossibleIndexes(query)[0];
      if (!keyTail) return next.openCursor(translateQuery(query));

      function ProxyCursor(cursor: Cursor) : Cursor {
        return {
          ...cursor,
          continue: cursor.continue.bind(cursor),
          continuePrimaryKey: cursor.continuePrimaryKey.bind(cursor),
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
}