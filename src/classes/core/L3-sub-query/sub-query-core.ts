import { DBCore, KeyRangeQuery, OpenCursorResponse, Cursor, Key } from '../L1-dbcore/dbcore';
import { VirtualIndexCore } from '../L2-virtual-indexes/index';

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

export function concatKeys(firstIsCompound: boolean, first: Key, second: Key) {
  const key = firstIsCompound ? first : [first];
  key.push(second);
  return key;
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
        return {
          ...cursor,
          continue: cursor.continue.bind(cursor),
          continuePrimaryKey: cursor.continuePrimaryKey.bind(cursor),
          advance: cursor.advance.bind(cursor),
          get key() {
            const key = cursor.key as any[];
            return key.slice(1);
          }
        };
      }

      return next.openCursor(translateSubQuery(subQuery)).then(({cursor, iterate})=>({
        cursor: cursor && ProxyCursor(cursor),
        iterate
      }));
    },
    
    subQuery (additionalBaseQuery: KeyEqualityQuery): SubQueryCore {
      return SubQueryCore(next, concatEqualityQueries(baseQuery, additionalBaseQuery));
    }
  }
}

