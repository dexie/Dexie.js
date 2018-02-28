import { MultiRangeResponse, MultiRangeQuery, MultiRangeCore } from '../L4-multirange/multirange-engine';
import { Key } from '../L1-dbcore/dbcore';

export interface PagedMultiRangeQuery extends MultiRangeQuery {
  lastPrimaryKey?: Key; // If present together with lastKey, use continuePrimaryKey() until key end. Then getAllKeys on next.
  lastKey?: Key; // if undefined but lastPrimaryKey set, look it up based on lastPrimaryKey.
  wantNextQuery?: boolean;
}

export interface PagedQueryResponse extends MultiRangeResponse {
  hasMore?: boolean;
}

export interface PagingCore extends MultiRangeCore {
  queryRanges (req: PagedMultiRangeQuery): Promise<PagedQueryResponse>;
}

export function createPagingEngine (next: MultiRangeCore) : PagingCore {
  return {
    ...next,
    queryRanges (req) {
      if (req.lastPrimaryKey == null) {
        return next.queryRanges(req.keyPath
      } else {
        // Have to use openCursor to navigate to position after last primary key
        return new Promise()
      }
      return next.queryRanges({
        ...req,

      })
    }
  }
}