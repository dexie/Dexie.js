import { PagingCore, PagedQueryResponse } from '../L5-paging-low-level/paging-engine';
import { Transaction, Key, KeyRange } from '../L1-dbcore/dbcore';
import { AtomicFormula } from '../L8-expression/expression';
import { BloomFilter } from './bloomfilter';

const LIMIT_FOR_PARALLELL_KEY_LISTING = 10000;
const LIMIT_FOR_SEQUENCIAL_KEY_LISTING = 50000;

export interface PagedMultiRangeCriteria {
  index: string;
  ranges: KeyRange[];
  lastPrimaryKey?: Key;
  bloom: BloomFilter;
}

export function executeConjunctionQuery(
  core: PagingCore,
  trans: Transaction,
  table: string,
  operands: PagedMultiRangeCriteria[]): Promise<BloomFilter>
{
  return Promise.all(operands.map(({index, ranges, lastPrimaryKey, bloom}) => 
    core.queryRanges({
      index,
      ranges,
      lastPrimaryKey,
      table,
      trans,
      want: 'bloom',
      bloom,
      wantNextQuery: true
  }))).then(() => operands.map(op=>op.bloom).reduce((r,c) => c.and(r)));
}
