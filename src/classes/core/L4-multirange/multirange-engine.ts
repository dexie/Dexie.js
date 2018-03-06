import { DBCore, KeyRange, Key, Transaction, KeyRangeQuery } from '../L1-dbcore/dbcore';
import { SubQueryCore } from '../L3-sub-query/sub-query-core';

export interface MultiRangeQuery extends Pick<KeyRangeQuery,
  "trans" | "table" | "index" | "limit" | "want" | "unique" | "reverse">
{
  trans: Transaction;
  table: string;
  index: string;
  limit?: number;
  want: 'keys' | 'values' | 'primaryKeys' | 'keyPairs';
  unique?: boolean;
  reverse?: boolean;
  ranges: KeyRange[];
}

export interface MultiRangeResponse {
  count?: number;
  keys?: any[];
  primaryKeys?: any[];
  values?: any[];
}

export interface MultiRangeCore extends SubQueryCore {
  queryRanges(req: MultiRangeQuery): Promise<MultiRangeResponse>
}

const KEY_COUNT_LIMIT = 10000;

export function MultiRangeCore (next: SubQueryCore) : MultiRangeCore {
  return {
    ...next,
    queryRanges(req) : Promise<MultiRangeResponse> {
      const {limit, reverse, want, ranges} = req;
      /*if (want == 'bloom') {
        return Promise.all(ranges.map(range => bloom(next, ({...req, range, limit: KEY_COUNT_LIMIT} as KeyRangeQuery))))
          .then(() => ({}));
      }*/
      throw new Error();
    }
  };

}