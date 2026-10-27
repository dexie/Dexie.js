import {
  getResultWindowBufferResults,
  resetResultWindowBuffer,
} from 'event-reduce-js';
import type { ResultWindowBuffer } from 'event-reduce-js';
import { RangeSet } from '../../helpers/rangeset';
import { CacheEntry } from '../../public/types/cache';
import { IntervalTree } from '../../public/types/rangeset';
import { DBCoreQueryRequest } from '../../public/types/dbcore';
import { createWindowBuffer } from '../event-reduce-apply';
import type { ReducibleQuery } from '../event-reduce-apply';

/** The result window buffers of cached queries that EventReduce can update.
 * Kept outside of CacheEntry, so that the public types do not change.
 */
const windowBuffers = new WeakMap<CacheEntry, ResultWindowBuffer<any>>();

/** Creates the buffer of a new cache entry.
 * Returns the request to send to the database: with the limit of the buffer.
 */
export function createEntryBuffer(
  entry: CacheEntry,
  req: DBCoreQueryRequest,
  query: ReducibleQuery | null
): DBCoreQueryRequest {
  if (!query) return req;
  const buffer = createWindowBuffer(query);
  windowBuffers.set(entry, buffer);
  return buffer.limitBufferSize
    ? { ...req, limit: req.limit! + buffer.limitBufferSize }
    : req;
}

export function getEntryBuffer(entry: CacheEntry) {
  return windowBuffers.get(entry);
}

/** Puts the rows read from the database into the buffer of the entry.
 * Returns the rows of the result window.
 */
export function resetEntryBuffer(entry: CacheEntry, rows: any[]): any[] {
  const buffer = windowBuffers.get(entry);
  if (!buffer) return rows;
  resetResultWindowBuffer(buffer, rows);
  return getResultWindowBufferResults(buffer);
}

/** Observes the primary keys of the rows after the result window, so that the
 * entry is invalidated when one of them changes in another tab or an explicit
 * transaction. The rows of the result window are observed already.
 */
export function observeEntryBuffer(
  entry: CacheEntry,
  pkRangeSet: IntervalTree | undefined,
  extractPrimKey: (value: any) => any
) {
  const buffer = windowBuffers.get(entry);
  if (buffer && buffer.limitBufferSize && pkRangeSet) {
    (pkRangeSet as RangeSet).addKeys(
      buffer.buffer.slice(buffer.queryParams.limit).map(extractPrimKey)
    );
  }
}
