import { DBCore, KeyRange, Key, Transaction, QueryBase } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L2.9-sub-query/sub-query-core';
import { KeyRangePagingCore, PagedQueryRequest, PagedQueryResponse } from '../L3-keyrange-paging/keyrange-paging-engine';
import { KeyRangePageToken } from '../L3-keyrange-paging/pagetoken';

export interface MultiRangeCore<TExpression=KeyRange[]> extends KeyRangePagingCore<TExpression> {
  query(req: MultiRangeQueryRequest<TExpression>): Promise<MultiRangeResponse>
}

export interface MultiRangeQueryRequest<TExpression=KeyRange[]> extends PagedQueryRequest<TExpression> {
  query?: TExpression;
}

export interface MultiRangeResponse extends PagedQueryResponse {
}

const KEY_COUNT_LIMIT = 10000;

export function MultiRangeCore (next: KeyRangePagingCore<KeyRange>) : MultiRangeCore<KeyRange[]> {
  return {
    ...next,
    query(req: MultiRangeQueryRequest) : Promise<MultiRangeResponse> {
      const {limit, query} = req;
      if (query.length === 1)
        return next.query({...req, query: query[0]});
      
      throw new Error();
    },
    openCursor(query) {
      throw new Error();
    },
    count (query) {
      throw new Error();
    }
  }
}
