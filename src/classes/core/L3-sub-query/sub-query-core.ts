import { DBCore, KeyRangeQuery, OpenCursorResponse, Cursor, Key } from '../L1-dbcore/dbcore';
import { VirtualIndexCore, pad } from '../L2-virtual-indexes/index';

export interface KeyEqualityQuery {
  index: string;
  key: Key;
}

export interface SubQueryCore extends VirtualIndexCore {
  subQuery(query: KeyEqualityQuery) : SubQueryCore;
}

export function concatIndexes(firstIsCompound: boolean, first: string, second: string) {
  return firstIsCompound ?
    `${first.substr(0, first.length - 1)}+${second}]` :
    `[${first}+${second}]`;
}

export function copyArray(source: any[], target: any[]) {
  for (let i=source.length; i;) target[--i] = source[i];
}

export function concatKeys(firstIsCompound: boolean, first: Key, second: Key) {
  if (firstIsCompound) {
    const result = new Array(first.length + 1);
    copyArray(first, result);
    result[first.length] = second;
    return result;
  } else {
    return [first, second];
  }
}

export function concatEqualityQueries(first: KeyEqualityQuery, second: KeyEqualityQuery): KeyEqualityQuery {
  const firstIsCompound = first.index[0] === '[';
  return {
    index: concatIndexes(firstIsCompound, first.index, second.index),
    key: concatKeys(firstIsCompound, first.key, second.key)
  };
}

export function SubQueryCore (next: VirtualIndexCore, baseQuery?: KeyEqualityQuery): SubQueryCore {
  if (!baseQuery) {
    return {
      ...next,
      subQuery(baseQuery: KeyEqualityQuery): SubQueryCore {
        return SubQueryCore(next, baseQuery);
      }
    };
  }

  const baseIndex = baseQuery.index;
  const baseIndexIsArray = baseIndex[0] === '[';

  function translateSubQuery (subQuery: KeyRangeQuery) : KeyRangeQuery {
    const {lower, lowerOpen, upper, upperOpen} = subQuery.range;
    return {
      ...subQuery,
      index: concatIndexes(baseIndexIsArray, baseIndex, subQuery.index),
      range: {
        lower: concatKeys(baseIndexIsArray, baseQuery.key, lower),
        lowerOpen,
        upper: concatKeys(baseIndexIsArray, baseQuery.key, upper),
        upperOpen
      }
    };
  }

  return {
    ...next,

    count(subQuery: KeyRangeQuery): Promise<number> {
      return next.count(translateSubQuery(subQuery));
    },
    getAll(subQuery: KeyRangeQuery) : Promise<any[]> {
      return next.getAll(translateSubQuery(subQuery));
    },
    openCursor(subQuery) : Promise<OpenCursorResponse> {

      function ProxyCursor(cursor: Cursor) : Cursor {
        function _continue (key?: Key) {
          key != null ?
            cursor.continue(concatKeys(baseIndexIsArray, baseQuery.key, key)) :
            cursor.continue()
        }
        return {
          ...cursor,
          continue: _continue,
          continuePrimaryKey: (key: Key, primaryKey: Key) => {
            cursor.continuePrimaryKey(concatKeys(baseIndexIsArray, baseQuery.key, key), primaryKey);
          },
          advance: cursor.advance.bind(cursor),
          get key() {
            const key = cursor.key as any[];
            return key.slice(1);
          }
        };
      }

      return next.openCursor(translateSubQuery(subQuery)).then(({cursor, iterate})=>({
        cursor: cursor && ProxyCursor(cursor),
        iterate /*NEJ BEHÖVS EJ: uplevelCallback => iterate (()=>{
          if (next.cmp(baseQuery.key, cursor.key.slice(0, cursor.key.length - 1)) === 0) {
            uplevelCallback();
          } else {
            cursor.done();
          }
        })*/
      }));
    },
    
    subQuery (additionalBaseQuery: KeyEqualityQuery): SubQueryCore {
      return SubQueryCore(next, concatEqualityQueries(baseQuery, additionalBaseQuery));
    }
  }
}

