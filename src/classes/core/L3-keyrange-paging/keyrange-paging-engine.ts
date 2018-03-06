import { VirtualIndexCore } from '../L2-virtual-indexes';
import { KeyRangeQuery, Transaction, KeyRange, Cursor, Key } from '../L1-dbcore/dbcore';
import { OffsetCursor } from '../L1-dbcore/utils/offset-cursor';
import { exceptions } from '../../../errors';

export interface KeyRangePagingCore extends VirtualIndexCore {
  queryRange(query: PagableKeyRangeQuery): Promise<QueryRangeResponse>;
}

export interface PagableKeyRangeQuery extends KeyRangeQuery {
  wantPageToken?: boolean;
  pageToken?: KeyRangePageToken;
}

export interface KeyRangePageToken {
  cursor?: Cursor; // If set, iteration is done via cursor
  lastKey?: Key; // Set when iteration is done via getAll()
  lastPrimaryKey?: Key; // If set, next iteration must use openCursor until next key is reached.
}

export interface QueryRangeResponse {
  pageToken?: KeyRangePageToken;
  primaryKeys?: Key[];
  keys?: Key[];
  values?: any[];
}

const CursorGetters = {
  keys: c => c.key,
  primaryKeys: c => c.primaryKey,
  values: c => c.value,
  keyPairs: c => [c.primaryKey, c.key]
};

export function KeyRangePagingEngine(next: VirtualIndexCore): KeyRangePagingCore {
  return {
    ...next,
    queryRange,
    openCursor(query) {
      return null;
    }
  };
  
  function queryRange(query: PagableKeyRangeQuery): Promise<QueryRangeResponse> {
    let { table, index, pageToken, range, reverse, wantPageToken, limit, unique, want } = query;
    const idx = next.tableIndexLookup[table][index][0];

    let useCursor = (
      (pageToken && pageToken.cursor) || // There's already a cursor to continue from
      reverse || // reverse calls
      unique ||
      (want !== 'primaryKeys' && want !== 'values') || // Only primaryKeys and values can be retrieved with getAll()
      idx.keyLength === 0 // outbound primary key. Cant find the index after getAll() or getAllKeys()
    );

    const makeResponse = (result: any[], pageToken: KeyRangePageToken | null) => {
      const res: QueryRangeResponse = { pageToken };
      res[want] = result;
      return res;
    };

    if (limit === 0) return Promise.resolve(makeResponse([], null));

    const cursorGetter = CursorGetters[want];

    if (useCursor) {
      //
      // openCursor()
      //
      const result: any[] = [];
      const cursor = pageToken.cursor;
      return Promise.resolve(cursor || next.openCursor(query)).then(cursor => {
        if (cursor) {
          return cursor.start(() => {
            result.push(cursorGetter(cursor));
            if (result.length < limit) cursor.continue();
            else cursor.stop();
          });
        }
      }).then(() => makeResponse(result, { cursor }));
    }

    //
    // use getAll()
    //

    // Manipulate range according to lastKey
    if (pageToken) {
      const {lastKey, lastPrimaryKey} = pageToken;
      if (lastPrimaryKey != null) {
        //
        // Must use openCursor with continuePrimaryKey() to iterate the remainding entries
        // on this key that has same key but different primary keys:
        //
        const result = [];
        return next.openCursor({...query, range: {...query.range, lower: lastKey, lowerOpen: false}} as KeyRangeQuery)
          .then(cursor => OffsetCursor(cursor, 1).start(()=>{
            if (next.cmp(cursor.key, lastKey) > 0) {
              return cursor.stop(); // No args to stop() makes promise resolve with undefined.
            }
            result.push(cursorGetter(cursor));
            if (result.length < limit) {
              return cursor.continue();
            }
            cursor.stop(cursor.primaryKey); // Makes promise resolve with the primaryKey we're on.
          }, lastKey, lastPrimaryKey)).then(lastPrimaryKey => {
            // lastPrimaryKey will be undefined if cursor's key passed beyond lastKey.
            // ==> next query() will use getAll()
            // Else, lastPrimaryKey will be last cursor's primaryKey
            // ==> next query() will come here again and do openCursor()
            return makeResponse(result, {
              lastKey,
              lastPrimaryKey
            });
          });
      } else {
        // We can do getAll() but we have a pageToken to consider:
        query = {
          ...query,
          range: {
            ...range,
            lower: lastKey,
            lowerOpen: true // Don't include last key
          }
        };
      }
    }
  
    return next.getAll(query).then(entries => {
      if (entries.length < limit) {
        // We did not reach limit.
        // Return response with pageToken set to null.
        return makeResponse(entries, null);
      }
      // Limit (probably) reached. (could be that the length of result is equal to given limit)
      if ((idx.index.multiEntry) || // multiEntry index
        (want === 'values' && idx.keyLength === 0)) // outbound primary key, and caller needs values.
      {
        // multiEntry or outbound primary keys. Impossible to follow up next iteration after getAll()
        // Set an OffsetCursor as {cursor} in pageToken, so that next query will go into the 'useCursor'
        // part and forward the cursor using Cursor.advance(this limit).
        // This will do an extra call to openCursor(), but it won't do cursor.advance() until
        // they really do the next query, as OffsetCursor is lazy.
        return next.openCursor(query)
          .then(cursor => makeResponse(entries, { cursor: OffsetCursor(cursor, limit) }));
      }

      // We can look up next key 
      const lastEntry = entries[limit - 1]; // primaryKey or value
      if (want === 'values') {
        // lastItem is a value.
        // Create a page token containing lastKey and lastPrimaryKey
        // by extracting primaryKey from value
        return makeResponse(entries, {
          lastKey: idx.extractKey(lastEntry),
          lastPrimaryKey: lastEntry
        });
      } else {
        // lastItem is a primaryKey.
        // Create a page token containing lastKey and lastPrimaryKey
        // by loading value from key, and then extract the key
        return next.get({ trans: query.trans, table, keys: [lastEntry] }).then(([value]) =>
          makeResponse(entries, {
            lastKey: lastEntry,
            lastPrimaryKey: idx.extractKey(value)
          }));
      }
    });
  }
}
