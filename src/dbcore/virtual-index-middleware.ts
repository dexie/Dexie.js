import {
  DBCore,
  DBCoreIndex,
  DBCoreKeyRange,
  DBCoreQueryRequest,
  DBCoreRangeType,
  DBCoreOpenCursorRequest,
  DBCoreCountRequest,
  DBCoreCursor,
  DBCoreTable,
} from "../public/types/dbcore";
import { isArray } from '../functions/utils';
import { getKeyExtractor } from './get-key-extractor';
import { getKeyPathAlias } from './dbcore-indexeddb';
import { Middleware } from '../public/types/middleware';

interface VirtualIndex extends DBCoreIndex {
  /** True if this index is virtual, i.e. represents a compound index internally,
   * but makes it act as as having a subset of its keyPaths.
   */
  isVirtual: boolean;

  /** Number of keypaths that this index comprises. Can be 0..N.
   * Note: This is the length of the *virtual index*, not the real index.
   */
  keyLength: number;

  /** Number of popped keypaths from the real index.
   */
  keyTail: number;
}

// Move into some util:
export function pad (a: any | any[], value: any, count: number) {
  const result = isArray(a) ? a.slice() : [a];
  for (let i=0; i<count; ++i) result.push(value);
  return result;
}


export function createVirtualIndexMiddleware (down: DBCore) : DBCore {
  return {
    ...down,
    table(tableName: string) {
      const table = down.table(tableName);
      const {schema} = table;
      const indexLookup: {[indexAlias: string]: VirtualIndex[]} = {};
      const allVirtualIndexes: VirtualIndex[] = [];

      function addVirtualIndexes (keyPath: null | string | string[], keyTail: number, lowLevelIndex: DBCoreIndex): VirtualIndex {
        const keyPathAlias = getKeyPathAlias(keyPath);
        const indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
        const keyLength = keyPath == null ? 0: typeof keyPath === 'string' ? 1 : keyPath.length;
        const isVirtual = keyTail > 0;
        const virtualIndex = {
          ...lowLevelIndex,
          isVirtual,
          isPrimaryKey: !isVirtual && lowLevelIndex.isPrimaryKey,
          keyTail,
          keyLength,
          extractKey: getKeyExtractor(keyPath),
          unique: !isVirtual && lowLevelIndex.unique
        };
        indexList.push(virtualIndex);
        if (!virtualIndex.isPrimaryKey) {
          allVirtualIndexes.push(virtualIndex);
        }
        if (keyLength > 1) {
          const virtualKeyPath = keyLength === 2 ?
            keyPath[0] : // This is a compound [a, b]. Add a virtual normal index a.
            keyPath.slice(0, keyLength - 1); // This is compound [a,b,c]. Add virtual compound [a,b].
          addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
        }
        indexList.sort((a,b) => a.keyTail - b.keyTail); // Shortest keyTail is the best one (represents real index)
        return virtualIndex;
      }
    
      const primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
      indexLookup[":id"] = [primaryKey];
      for (const index of schema.indexes) {
        addVirtualIndexes(index.keyPath, 0, index);
      }
    
      function findBestIndex(keyPath: null | string | string[]): VirtualIndex {
        const result = indexLookup[getKeyPathAlias(keyPath)];
        return result && result[0];
      }
    
      function translateRange (range: DBCoreKeyRange, keyTail: number): DBCoreKeyRange {
        return {
          type: range.type === DBCoreRangeType.Equal ?
            DBCoreRangeType.Range :
            range.type,
          lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
          lowerOpen: true, // doesn't matter true or false
          upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
          upperOpen: true // doesn't matter true or false
        };
      }
    
      function translateRequest (req: DBCoreQueryRequest): DBCoreQueryRequest;
      function translateRequest (req: DBCoreOpenCursorRequest): DBCoreOpenCursorRequest;
      function translateRequest (req: DBCoreCountRequest): DBCoreCountRequest {
        const index = req.query.index as VirtualIndex;
        return index.isVirtual ? {
          ...req,
          query: {
            index,
            range: translateRange(req.query.range, index.keyTail)
          }
        } : req;
      }
    
      const result: DBCoreTable = {
        ...table,
        schema: {
          ...schema,
          primaryKey,
          indexes: allVirtualIndexes,
          getIndexByKeyPath: findBestIndex
        },

        count(req) {
          return table.count(translateRequest(req));
        },    
    
        query(req) {
          return table.query(translateRequest(req));
        },
    
        openCursor(req) {
          const {keyTail, isVirtual, keyLength} = (req.query.index as VirtualIndex);
          if (!isVirtual) return table.openCursor(req);
    
          function createVirtualCursor(cursor: DBCoreCursor) : DBCoreCursor {
            function _continue (key?: any) {
              key != null ?
                cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) :
                req.unique ?
                  cursor.continue(pad(cursor.key, req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) :
                  cursor.continue()
            }
            const virtualCursor = Object.create(cursor, {
              continue: {value: _continue},
              continuePrimaryKey: {
                value(key: any, primaryKey: any) {
                  cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey);
                }
              },
              key: {
                get() {
                  const key = cursor.key as any[]; // A virtual cursor always operates on compound key
                  return keyLength === 1 ?
                    key[0] : // Cursor.key should not be an array.
                    key.slice(0, keyLength); // Cursor.key should be first part of array.
                }
              },
              value: {
                get() {
                  return cursor.value;
                }
              }
            });
            return virtualCursor;
          }
    
          return table.openCursor(translateRequest(req))
            .then(cursor => cursor && createVirtualCursor(cursor));
        }
      };
      return result;
    }
  }
}

export const virtualIndexMiddleware : Middleware<DBCore> = {
  stack: "dbcore",
  name: "VirtualIndexMiddleware",
  level: 1,
  create: createVirtualIndexMiddleware
};

