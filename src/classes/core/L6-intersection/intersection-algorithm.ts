import { MultiRangeQuery, MultiRangeCore, MultiRangeResponse } from '../L4-multirange/multirange-engine';
import { Transaction, KeyRange, Key } from '../L1-dbcore/dbcore';
import { AtomicFormula } from '../L8-expression/expression';
import { PagedMultiRangeQuery } from '../L5-paging-low-level/paging-engine';

export interface IntersectionQuery extends Pick<PagedMultiRangeQuery,
  "trans" | "table" | "index" | "limit" | "want" | "unique" | "reverse">
{
  trans: Transaction;
  table: string;
  limit?: number;
  want: 'keys' | 'values' | 'primaryKeys' | 'keyPairs';
  reverse?: boolean;
  operands: AtomicFormula[];
}

export interface IntersectionCore extends MultiRangeCore {
  query(req: IntersectionQuery): Promise<MultiRangeResponse>;
}

export function IntersectionCore (next: MultiRangeCore) : IntersectionCore {
  return {
    ...next,
    query({trans, table, limit, want, unique, reverse, operands}: IntersectionQuery): Promise<MultiRangeResponse> {
      if (operands.length === 1) {
        const {index, ranges} = operands[0];
        return next.queryRanges({trans, table, limit, want, unique, reverse, index, ranges});
      } else {
        //const indexes = expr.operands.map(o=>o.index);
        //const compoundIdxs = findPossibleCompoundIdxs
        // Skip for now, the special case of using compound indexes.
        
        const {length} = operands;
        return (function nextOp(i: number, keySet?: Set<Key>): Promise<Key[]> {
          const {index, ranges} = operands[i];
          const query = {
            trans,
            table,
            want: 'primaryKeys' as 'primaryKeys',
            index,
            ranges,
            //limit: 1000
          };
          return next
            .queryRanges(i < length - 1 ? query : {...query, reverse, limit})
            .then(({primaryKeys}) => {
              if (keySet) {
                primaryKeys = primaryKeys.filter(key => keySet.has(key));
              }
              return i < length ? nextOp(i + 1, new Set(primaryKeys)) : primaryKeys;
            });
        })(0).then(orderedPrimaryKeys => {
          if (want === 'primaryKeys') return {primaryKeys: orderedPrimaryKeys};
          if (want === 'values') return next.get({table, trans, keys: orderedPrimaryKeys}).then(values => ({
            values
          }));
        });
      }
    }
  };
}

