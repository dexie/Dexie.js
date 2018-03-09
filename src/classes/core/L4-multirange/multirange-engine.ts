import { DBCore, KeyRange, Key, Transaction, QueryBase, Cursor, RangeType } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L2.9-sub-query/sub-query-core';
import { KeyRangePagingCore, PagedQueryRequest, PagedQueryResponse } from '../L3-keyrange-paging/keyrange-paging-engine';
import { KeyRangePageToken } from '../L3-keyrange-paging/pagetoken';
import { ProxyCursor } from '../L1-dbcore/utils/proxy-cursor';

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
  constructor(pageToken: KeyRangePageToken, rangePos: number) {
    super(pageToken);
    this.rangePos = rangePos;
  }
}

function responseConverter({ pageToken, query, limit, reverse }: MultiRangeQueryRequest, rangePos: number) {
  return (res: PagedQueryResponse) => {
    const isAtLastRange = reverse ?
      rangePos === 0 :
      rangePos === query.length - 1;

    if (!res.pageToken && isAtLastRange) return res as MultiRangeResponse;
    return {
      ...res,
      partial: res.partial || (!isAtLastRange && (!limit || res.result.length < limit)),
      pageToken: new MultiRangePageToken(
        res.pageToken || { type: null },
        res.pageToken ?
          rangePos :
          reverse ?
            rangePos - 1 :
            rangePos + 1
      )
    } as MultiRangeResponse;
  };
}

export function MultiRangeCore(next: KeyRangePagingCore<KeyRange>): MultiRangeCore<KeyRange[]> {
  return {
    ...next,
    query(req): Promise<MultiRangeResponse> {
      const { query, pageToken, reverse } = req;
      if (query.length === 0) return Promise.resolve({ result: [] });
      const rangePos = pageToken ? pageToken.rangePos : reverse ? query.length - 1 : 0;
      const translatedRequest = { ...req, query: query[rangePos] };
      return next.query(translatedRequest)
        .then(responseConverter(req, rangePos));
    },

    openCursor(req): Promise<Cursor> {
      const { query, pageToken, reverse } = req;
      const includes = query.map(range => next.rangeIncludes(range));
      if (query.length === 0) return Promise.resolve(null); // Empty cursor.
      let rangePos = pageToken ? pageToken.rangePos : reverse ? query.length - 1 : 0;
      const currentRange = query[rangePos];
      const lastRange = reverse ? query[0] : query[query.length - 1];
      const translatedRequest = {
        ...req, query: !reverse ?
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
      return next.openCursor(translatedRequest).then(cursor => ProxyCursor(cursor, {
        proxyOnNext: (onNext: () => void) => {
          const cmp = reverse ? (a, b) => next.cmp(b, a) : next.cmp;
          let rangeIncludes = includes[rangePos],
            range = query[rangePos];

          return () => {
            if (rangeIncludes(cursor.key)) {
              return onNext();
            }
            let cursorIsBeyondRange, nextStartKey, nextEndKey, nextEndKeyOpen;
            do {
              if (range === lastRange) return cursor.stop();
              range = query[reverse ? --rangePos : ++rangePos];
              [nextStartKey, nextEndKey, nextEndKeyOpen] = reverse ?
                [range.upper, range.lower, range.lowerOpen] :
                [range.lower, range.upper, range.upperOpen];
              cursorIsBeyondRange = nextEndKeyOpen ?
                cmp(cursor.key, nextEndKey) >= 0 :
                cmp(cursor.key, nextEndKey) > 0;
            } while (cursorIsBeyondRange);
            rangeIncludes = includes[rangePos];
            if (rangeIncludes(cursor.key)) return onNext();
            cursor.continue(nextStartKey);
          };
        }
      }));
    },
    count(req): Promise<number> {
      return Promise.all(req.query.map(range => next.count({ ...req, query: range })))
        .then(counts => counts.reduce((p, c) => p + c));
    }
  }
}
