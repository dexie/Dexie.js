import { DBCore, KeyRange, Key, Transaction, QueryBase, Cursor, RangeType } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L2.9-sub-query/sub-query-core';
import { KeyRangePagingCore, PagedQueryRequest, PagedQueryResponse } from '../L3-keyrange-paging/keyrange-paging-engine';
import { KeyRangePageToken } from '../L3-keyrange-paging/pagetoken';

export interface MultiRangeCore<TExpression=KeyRange[]> extends KeyRangePagingCore<TExpression> {
  query(req: MultiRangeQueryRequest<TExpression>): Promise<MultiRangeResponse>
  openCursor(req: MultiRangeQueryRequest<TExpression>): Promise<Cursor | null>
}

export interface MultiRangeQueryRequest<TExpression=KeyRange[]> extends PagedQueryRequest<TExpression> {
  query: TExpression;
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

function responseConverter ({pageToken, query, limit, reverse}: MultiRangeQueryRequest, rangePos: number) {
  return (res: PagedQueryResponse) => {
    const isAtLastRange = reverse ?
      rangePos === 0 :
      rangePos === query.length - 1;

    if (!res.pageToken && isAtLastRange) return res as MultiRangeResponse;
    return {
      ...res,
      partial: res.partial || (!isAtLastRange && (!limit || res.result.length < limit)),
      pageToken: new MultiRangePageToken (
        res.pageToken || {type: null},
        res.pageToken ?
          rangePos :
          reverse ?
            rangePos - 1 :
            rangePos + 1
      )
    } as MultiRangeResponse;
  };
}

export function MultiRangeCore (next: KeyRangePagingCore<KeyRange>) : MultiRangeCore<KeyRange[]> {
  return {
    ...next,
    query(req) : Promise<MultiRangeResponse> {
      const {query, pageToken, reverse} = req;
      if (query.length === 0) return Promise.resolve({result: []});
      const rangePos = pageToken ? pageToken.rangePos : reverse ? query.length - 1 : 0;
      const translatedRequest = {...req, query: query[rangePos]};
      return next.query(translatedRequest)
        .then(responseConverter(req, rangePos));
    },

    openCursor(req) : Promise<Cursor> {
      const {query, pageToken, reverse} = req;
      if (query.length === 0) return Promise.resolve(null); // Empty cursor.
      let rangePos = pageToken ? pageToken.rangePos : reverse ? query.length - 1 : 0;
      const currentRange = query[rangePos];
      const lastRange = reverse ? query[0] : query[query.length - 1];
      const translatedRequest = {...req, query: !reverse ?
        {
          type: RangeType.Range, // TODO: Fixthis! Need a class instead of an interface for ranges!
          lower: currentRange.lower,
          lowerOpen: currentRange.lowerOpen,
          upper: lastRange.upper,
          upperOpen: lastRange.upperOpen
        } : {
          type: RangeType.Range, // TODO: Fixthis!
          upper: currentRange.upper,
          upperOpen: currentRange.upperOpen,
          lower: lastRange.lower,
          lowerOpen: lastRange.lowerOpen
        }
      } as PagedQueryRequest;
      return next.openCursor(translatedRequest)
        .then(cursor => Object.create(cursor, {
          start: {
            value: (onNext, key, primaryKey) => {
              let lastKey = query[rangePos].upper;
              let lastKeyOpen = query[rangePos].upperOpen;
              const cmp = next.cmp;
              return cursor.start(!reverse ? ()=>{
                // TODO: if lowerOpen is true, we might happen to be before range.
                // TODO: Some kind of utility function for comparing cursor with range. Well,
                // we have it already! DbCore has it! Need to map ranges to includes() functions
                // initially, and use them instead!
                if (cmp(cursor.key, lastKey) < 0 || (!lastKeyOpen && cmp(cursor.key, lastKey) === 0)) {
                  return onNext();
                }
                ++rangePos;
                lastKey = query[rangePos].upper;
                lastKeyOpen = query[rangePos].upperOpen;
                cursor.continue(query[rangePos].lower)
              } : ()=>{
                throw new Error("TODO: Fix reverse iteration!");
              }, key, primaryKey);
            }
          }
        }));
    },
    count(req) : Promise<number> {
      return Promise.all(req.query.map(range => next.count({...req, query: range})))
        .then(counts => counts.reduce((p,c) => p + c));
    }
  }
}
