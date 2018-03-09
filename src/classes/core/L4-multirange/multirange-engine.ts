import { DBCore, KeyRange, Key, Transaction, QueryBase } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L2.9-sub-query/sub-query-core';
import { KeyRangePagingCore, PagedQueryRequest, PagedQueryResponse, PagedQueryBase } from '../L3-keyrange-paging/keyrange-paging-engine';
import { KeyRangePageToken } from '../L3-keyrange-paging/pagetoken';


export interface MultiRangeQuery extends PagedQueryBase {
  ranges: KeyRange[];
}

export interface MultiRangeResponse extends PagedQueryResponse {
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
        return next.queryRange({...query, range: ranges[0]} as PagedQueryRequest);
      
      /*if (want == 'bloom') {
        return Promise.all(ranges.map(range => bloom(next, ({...req, range, limit: KEY_COUNT_LIMIT} as KeyRangeQuery))))
          .then(() => ({}));
      }*/
      throw new Error();
    }
  };

}