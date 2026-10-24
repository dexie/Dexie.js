import {
  applyChangeEventsToResultWindowBuffer,
  createResultWindowBuffer,
  getRecommendedResultWindowBufferSize,
  getResultWindowBufferResults,
  resetResultWindowBuffer,
} from 'event-reduce-js';
import type { ResultWindowBuffer } from 'event-reduce-js';
import { RangeSet } from '../../helpers/rangeset';
import { CacheEntry } from '../../public/types/cache';
import { IntervalTree } from '../../public/types/rangeset';
import { DBCoreQueryRequest } from '../../public/types/dbcore';
import { toChangeEvents, toQueryParams } from '../event-reduce-apply';
import type { ReducibleMutation, ReducibleQuery } from '../event-reduce-apply';

/** Rows after the result window of cached queries with a limit, so that a
 * row leaving a full window can be replaced from memory instead of reading
 * the database again (EventReduce's result window buffer).
 */
const windowBuffers = new WeakMap<CacheEntry, ResultWindowBuffer<any>>();

/** Creates the buffer of a new cache entry, if its query has a limit.
 * Returns the request to send to the database: with the limit of the buffer.
 */
export function createWindowBuffer(
  entry: CacheEntry,
  req: DBCoreQueryRequest,
  query: ReducibleQuery | null
): DBCoreQueryRequest {
  const size =
    query && req.limit! < Infinity
      ? getRecommendedResultWindowBufferSize(req.limit)
      : 0;
  if (!size) return req;
  windowBuffers.set(
    entry,
    createResultWindowBuffer(toQueryParams(query!), { limitBufferSize: size })
  );
  return { ...req, limit: req.limit! + size };
}

export function getWindowBuffer(entry: CacheEntry) {
  return windowBuffers.get(entry);
}

/** Puts the rows read from the database into the buffer of the entry.
 * Returns the rows of the result window.
 */
export function resetWindowBuffer(entry: CacheEntry, rows: any[]): any[] {
  const buffer = windowBuffers.get(entry);
  if (!buffer) return rows;
  resetResultWindowBuffer(buffer, rows);
  return getResultWindowBufferResults(buffer);
}

/** Applies mutations to a copy of the buffer.
 * Returns the new buffer and result window, or null when the result window
 * is not in the buffer anymore and the query must run again.
 */
export function applyToWindowBuffer(
  buffer: ResultWindowBuffer<any>,
  ops: readonly ReducibleMutation[],
  skip = false
): {
  buffer: ResultWindowBuffer<any>;
  changed: boolean;
  results: any[];
} | null {
  const newBuffer = {
    ...buffer,
    buffer: buffer.buffer.slice(),
    keyDocumentMap: new Map(buffer.keyDocumentMap),
  };
  let changed = false;
  let results = getResultWindowBufferResults(newBuffer);
  for (const op of ops) {
    const changeEvents = toChangeEvents(
      op,
      newBuffer.queryParams,
      newBuffer.keyDocumentMap,
      skip
    );
    if (!changeEvents) return null;
    const res = applyChangeEventsToResultWindowBuffer(newBuffer, changeEvents);
    if (res.runFullQueryAgain === true) return null;
    if (res.changed) changed = true;
    results = res.results;
  }
  return { buffer: newBuffer, changed, results };
}

/** Observes the primary keys of the rows after the result window, so that the
 * entry is invalidated when one of them changes in another tab or an explicit
 * transaction. The rows of the result window are observed already.
 */
export function observeWindowBuffer(
  entry: CacheEntry,
  pkRangeSet: IntervalTree | undefined,
  extractPrimKey: (value: any) => any
) {
  const buffer = windowBuffers.get(entry);
  if (buffer && pkRangeSet) {
    (pkRangeSet as RangeSet).addKeys(
      buffer.buffer.slice(buffer.queryParams.limit).map(extractPrimKey)
    );
  }
}

export function setWindowBuffer(
  entry: CacheEntry,
  buffer: ResultWindowBuffer<any>
) {
  windowBuffers.set(entry, buffer);
}
