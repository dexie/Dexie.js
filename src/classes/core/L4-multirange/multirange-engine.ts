import { DBCore, KeyRange, Key, Transaction, KeyRangeQuery } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L3-sub-query/sub-query-core';
import { KeyRangePagingCore, PagableKeyRangeQuery, QueryRangeResponse } from '../L2.1-keyrange-paging/keyrange-paging-engine';

export interface MultiRangeQuery extends Pick<PagableKeyRangeQuery, 
  "trans" | "table" | "index" | "limit" | "want" | "unique" | "reverse" | "wantPageToken" | "pageToken"> // all but "range"
{
  ranges: KeyRange[];
}

export interface MultiRangeResponse extends QueryRangeResponse {
}

export interface MultiRangeCore extends KeyRangePagingCore {
  queryRanges(req: MultiRangeQuery): Promise<MultiRangeResponse>
}

const KEY_COUNT_LIMIT = 10000;

export function MultiRangeCore (next: KeyRangePagingCore) : MultiRangeCore {
  return {
    ...next,
    queryRanges(query) : Promise<MultiRangeResponse> {
      const {limit, ranges} = query;
      if (ranges.length === 1)
        return next.queryRange({...query, range: ranges[0]} as PagableKeyRangeQuery);
      
      /*if (want == 'bloom') {
        return Promise.all(ranges.map(range => bloom(next, ({...req, range, limit: KEY_COUNT_LIMIT} as KeyRangeQuery))))
          .then(() => ({}));
      }*/
      throw new Error();
    }
  };

}