import {
  calculateActionFunction,
  doNothing,
  runFullQueryAgain,
} from 'event-reduce-js';
import type { ChangeEvent, QueryParams } from 'event-reduce-js';
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

/** Applies mutations to the previous result of a query with the EventReduce
 * algorithm (https://github.com/pubkey/event-reduce).
 *
 * Each written value is applied as a change event: moved, inserted and removed
 * rows are put at their sort position without running the query again.
 *
 * The previous version of a row is only known when it is part of the result.
 * Without skip that is enough: a row outside the result either did not match
 * or was sorted after a full limit window, so an update of it behaves like an
 * insert and a delete of it changes nothing. With skip, such a row might have
 * been in front of the window, so the new result cannot be derived.
 *
 * Returns the new result (the given array when nothing changed), or null when
 * the new result cannot be derived and the query must run again.
 * keyDocumentMap must contain the rows of result by keyToId() of their primary
 * key. It is updated to the new result, but is undefined after null is returned.
 */
export function applyWithEventReduce(
  result: any[],
  mutations: readonly ReducibleMutation[],
  query: ReducibleQuery,
  keyDocumentMap: Map<string, any>
): any[] | null {
  const queryParams = toQueryParams(query);
  const results = result.slice();
  let changed = false;
  for (const mutation of mutations) {
    const changeEvents = toChangeEvents(
      mutation,
      queryParams,
      keyDocumentMap,
      !!query.skip
    );
    if (!changeEvents) return null;
    for (const changeEvent of changeEvents) {
      const input = {
        queryParams,
        changeEvent,
        previousResults: results,
        keyDocumentMap,
      };
      // calculateActionFunction() keeps the action names out of the bundle.
      const action = calculateActionFunction(input);
      if (action === runFullQueryAgain) return null;
      if (action !== doNothing) {
        changed = true;
        action(input); // mutates results and keyDocumentMap
      }
    }
  }
  return changed ? results : result;
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

/** Turns a mutation into EventReduce change events. Rows that are not in
 * keyDocumentMap are inserted. Returns null if that is not correct, which is
 * the case for deleteRange, keys that are not valid and, with skip, rows that
 * might have been in front of the window.
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

/** Builds the keyDocumentMap for applyWithEventReduce().
 * Returns undefined if a primary key is not a valid key.
 */
export function toKeyDocumentMap(
  result: readonly any[],
  extractPrimKey: (value: any) => any
): Map<string, any> | undefined {
  const map = new Map<string, any>();
  for (let i = 0, l = result.length; i < l; ++i) {
    const id = keyToId(extractPrimKey(result[i]));
    if (id === undefined) return undefined;
    map.set(id, result[i]);
  }
  return map;
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
