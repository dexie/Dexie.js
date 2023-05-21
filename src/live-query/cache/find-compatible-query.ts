import { CacheEntry, TblQueryCache } from '../../public/types/cache';
import {
  DBCoreCountRequest,
  DBCoreQueryRequest,
} from '../../public/types/dbcore';
import { areRangesEqual } from './are-ranges-equal';
import { cache } from './cache';
import { isSuperRange } from './is-super-range';

export function findCompatibleQuery(
  dbName: string,
  tableName: string,
  type: 'query',
  req: DBCoreQueryRequest
): [] | [CacheEntry, boolean, TblQueryCache, CacheEntry[]];
export function findCompatibleQuery(
  dbName: string,
  tableName: string,
  type: 'count',
  req: DBCoreCountRequest
): [] | [CacheEntry, boolean, TblQueryCache, CacheEntry[]];
export function findCompatibleQuery(
  dbName: string,
  tableName: string,
  type: 'query' | 'count',
  req: Partial<DBCoreQueryRequest> & Partial<DBCoreCountRequest>
): [] | [CacheEntry, boolean, TblQueryCache, CacheEntry[]] {
  const tblCache = cache[`idb://${dbName}/${tableName}`];
  if (!tblCache) return [];
  const queries = tblCache.queries[type];
  if (!queries) return [null, false, tblCache, null];
  const indexName = req.query ? req.query.index.name : null;
  const entries = queries[indexName || ''];
  if (!entries) return [null, false, tblCache, null];

  switch (type) {
    case 'query':
      const equalEntry = entries.find(
        (entry) =>
          (entry.req as DBCoreQueryRequest).limit === req.limit &&
          (entry.req as DBCoreQueryRequest).values === req.values &&
          areRangesEqual(entry.req.query.range, req.query.range)
      );
      if (equalEntry)
        return [
          equalEntry,
          true, // exact match
          tblCache,
          entries,
        ];
      const superEntry = entries.find((entry) => {
        const limit = 'limit' in entry.req ? entry.req.limit : Infinity;
        return (
          limit >= req.limit &&
          (req.values ? (entry.req as DBCoreQueryRequest).values : true) &&
          isSuperRange(entry.req.query.range, req.query.range)
        );
      });
      return [superEntry, false, tblCache, entries];
    case 'count':
      const countQuery = entries.find((entry) =>
        areRangesEqual(entry.req.query.range, req.query.range)
      );
      return [countQuery, !!countQuery, tblCache, entries];
  }
}
