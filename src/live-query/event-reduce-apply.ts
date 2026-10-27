import {
  applyChangeEventToResultWindowBuffer,
  createResultWindowBuffer,
  getRecommendedResultWindowBufferSize,
} from 'event-reduce-js';
import type {
  ChangeEvent,
  QueryParams,
  ResultWindowBuffer,
} from 'event-reduce-js';
import { getUint8Array, type } from '../functions/cmp';
import { isArray } from '../functions/utils';

/** A committed or optimistic write, as far as EventReduce needs to know it. */
export type ReducibleMutation =
  | { type: 'add' | 'put'; values: readonly any[] }
  | { type: 'delete'; keys: readonly any[] }
  | { type: 'deleteRange' };

export interface ReducibleQuery {
  extractPrimKey: (value: any) => any;
  /** Key paths that decide the sort position of a row. */
  sortFields: string[];
  matches: (value: any) => boolean;
  /** Result order. Must only return 0 for the same row. */
  compare: (a: any, b: any) => number;
  limit?: number;
  skip?: number;
}

/** Creates EventReduce's result window buffer for a query, with the
 * recommended buffer size. See the EventReduce docs.
 */
export function createWindowBuffer(
  query: ReducibleQuery
): ResultWindowBuffer<any> {
  const size =
    query.limit! < Infinity
      ? getRecommendedResultWindowBufferSize(query.limit)
      : 0;
  return createResultWindowBuffer(toQueryParams(query), {
    limitBufferSize: size,
    skipBufferSize: size,
  });
}

/** Applies mutations to a result window buffer with EventReduce
 * (https://github.com/pubkey/event-reduce). Returns the updated buffer, or
 * null when the query must run again. Updates the buffer in place unless
 * copy is set.
 */
export function applyToWindowBuffer(
  buffer: ResultWindowBuffer<any>,
  mutations: readonly ReducibleMutation[],
  copy: boolean
): ResultWindowBuffer<any> | null {
  if (copy) {
    buffer = {
      ...buffer,
      buffer: buffer.buffer.slice(),
      keyDocumentMap: new Map(buffer.keyDocumentMap),
    };
  }
  const skip = !!buffer.queryParams.skip;
  for (const mutation of mutations) {
    const changeEvents = toChangeEvents(
      mutation,
      buffer.queryParams,
      buffer.keyDocumentMap,
      skip
    );
    if (!changeEvents) return null;
    for (const changeEvent of changeEvents) {
      if (
        applyChangeEventToResultWindowBuffer(buffer, changeEvent) ===
        'runFullQueryAgain'
      )
        return null;
    }
  }
  return buffer;
}

export function toQueryParams(query: ReducibleQuery): QueryParams<any> {
  const { extractPrimKey, compare } = query;
  return {
    primaryKey: '', // not used, ids come from getDocumentId
    getDocumentId: (doc: any) => keyToId(extractPrimKey(doc)),
    sortFields: query.sortFields,
    limit: query.limit && query.limit < Infinity ? query.limit : undefined,
    skip: query.skip || undefined,
    queryMatcher: query.matches,
    // EventReduce needs a comparator that never returns 0.
    sortComparator: (a, b) => (compare(a, b) < 0 ? -1 : 1),
  };
}

/** Turns a mutation into EventReduce change events. Dexie does not know the
 * previous value of rows outside the buffer, so they are inserted. That is
 * correct unless skip is used: such a row might have been in front of the
 * window. Returns null then, and for deleteRange and invalid keys.
 */
export function toChangeEvents(
  mutation: ReducibleMutation,
  queryParams: QueryParams<any>,
  keyDocumentMap: Map<string, any>,
  skip: boolean
): ChangeEvent<any>[] | null {
  const getDocumentId = queryParams.getDocumentId!;
  const changeEvents: ChangeEvent<any>[] = [];
  if (mutation.type === 'add' || mutation.type === 'put') {
    for (const value of mutation.values) {
      const id = getDocumentId(value);
      if (id === undefined) return null;
      const previous = keyDocumentMap.get(id);
      if (previous) {
        if (mutation.type === 'add') continue; // add() of an existing key fails
        changeEvents.push({ operation: 'UPDATE', id, doc: value, previous });
      } else {
        if (skip) return null; // might have been in front of the window
        changeEvents.push({
          operation: 'INSERT',
          id,
          doc: value,
          previous: null,
        });
      }
    }
  } else if (mutation.type === 'delete') {
    for (const key of mutation.keys) {
      const id = keyToId(key);
      if (id === undefined) continue; // not a valid key: nothing is deleted
      const previous = keyDocumentMap.get(id);
      if (previous) {
        changeEvents.push({ operation: 'DELETE', id, doc: null, previous });
      } else if (skip) {
        return null; // might have been in front of the window
      }
    }
  } else {
    return null; // deleteRange
  }
  return changeEvents;
}

export function toPaths(keyPath: null | string | string[]): string[] {
  return keyPath == null ? [] : isArray(keyPath) ? keyPath : [keyPath];
}

/** Returns a string that is unique for each IndexedDB key, so that keys of
 * any type can be used as ids for EventReduce. Returns undefined for values
 * that are not valid keys.
 */
export function keyToId(key: any): string | undefined {
  switch (type(key)) {
    case 'number':
      return key === key ? 'n' + key : undefined; // NaN is not a valid key
    case 'string':
      return 's' + key;
    case 'Date': {
      const time = key.getTime();
      return time === time ? 'd' + time : undefined;
    }
    case 'binary':
      return 'b' + getUint8Array(key).join(',');
    case 'Array': {
      const ids: string[] = [];
      for (let i = 0; i < key.length; ++i) {
        const id = keyToId(key[i]);
        if (id === undefined) return undefined;
        ids.push(id);
      }
      return 'a' + JSON.stringify(ids);
    }
  }
  return undefined;
}
