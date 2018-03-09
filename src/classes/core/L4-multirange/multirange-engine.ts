import { DBCore, KeyRange, Key, Transaction, QueryBase, Cursor } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L2.9-sub-query/sub-query-core';
import { KeyRangePagingCore, PagedQueryRequest, PagedQueryResponse } from '../L3-keyrange-paging/keyrange-paging-engine';
import { KeyRangePageToken } from '../L3-keyrange-paging/pagetoken';

export interface MultiRangeCore<TExpression=KeyRange[]> extends KeyRangePagingCore<TExpression> {
  query(req: MultiRangeQueryRequest<TExpression>): Promise<MultiRangeResponse>
}

export interface MultiRangeQueryRequest<TExpression=KeyRange[]> extends PagedQueryRequest<TExpression> {
  query?: TExpression;
  pageToken?: MultiRangePageToken;
}

export interface MultiRangeResponse extends PagedQueryResponse {
  pageToken?: MultiRangePageToken;
}

export class MultiRangePageToken extends KeyRangePageToken {
  rangePos: number;
  constructor (pageToken: KeyRangePageToken, rangePos: number) {
    super(pageToken);
    this.rangePos = rangePos;
  }
}

const KEY_COUNT_LIMIT = 10000;

function responseConverter ({pageToken, query, limit}: MultiRangeQueryRequest, rangePos: number) {
  return (res: PagedQueryResponse) => {
    if (!res.pageToken && rangePos === query.length - 1) return res as MultiRangeResponse;
    return {
      ...res,
      partial: res.partial || (rangePos !== query.length - 1 && (!limit || res.result.length < limit)),
      pageToken: new MultiRangePageToken (
        res.pageToken || {type: null},
        res.pageToken ?
          rangePos :
          rangePos + 1
      )
    } as MultiRangeResponse;
  }
}

export function MultiRangeCore (next: KeyRangePagingCore<KeyRange>) : MultiRangeCore<KeyRange[]> {
  return {
    ...next,
    query(req: MultiRangeQueryRequest) : Promise<MultiRangeResponse> {
      const {limit, query, pageToken} = req;
      //if (!query) return next.query({...req, query: null}).then(responseConverter(req, 0));
      if (query.length === 0) return Promise.resolve({result: []});
      const rangePos = pageToken ? pageToken.rangePos : 0;
      return next.query({...req, query: query[rangePos]}).then(responseConverter(req, 0));
    },
    openCursor(req: MultiRangeQueryRequest) : Promise<Cursor> {
      // TODO: Create a ProxyCursor that jumps between ranges.
      throw new Error();
    },
    count (req) {
      return Promise.all(req.query.map(range => next.count({...req, query: range})))
        .then(counts => counts.reduce((p,c) => p + c));
    }
  }
}
