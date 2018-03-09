import { Transaction, Key, KeyRange } from '../L1-dbcore/dbcore';
import { AtomicFormula } from '../L8-expression/expression';
import { BloomFilter } from './bloomfilter';
import { KeyRangePagingCore, KeyRangePageToken } from '../L3-keyrange-paging/keyrange-paging-engine';

const LIMIT_FOR_PARALLELL_KEY_LISTING = 10000;
const LIMIT_FOR_SEQUENCIAL_KEY_LISTING = 50000;

const INDEX_SCAN_LIMIT = 10000;

export interface PagedMultiRangeCriteria {
  index: string;
  ranges: KeyRange[];
  //pageToken?: KeyRangePageToken;
  bloom: BloomFilter;
}

export function executeConjunctionQuery(
  core: KeyRangePagingCore,
  trans: Transaction,
  table: string,
  operands: PagedMultiRangeCriteria[]): Promise<BloomFilter>
{
  function indexScan (index: string, range: KeyRange, bloom: BloomFilter, pageToken?: KeyRangePageToken) {
    return core.queryRange({
      trans,
      table,
      index,
      limit: INDEX_SCAN_LIMIT,
      pageToken,
      range,
      want: 'primaryKeys',
      wantPageToken: true
    }).then(({primaryKeys, pageToken}) => {
      bloom.addKeys(primaryKeys);
      if (pageToken) return indexScan(index, range, bloom, pageToken);
    });
  }

  return Promise.all(operands.map(({index, ranges, bloom}) => 
    ranges.reduce((p, range) => p.then(()=>{ // Could use Promise.all(ranges.map(...)) here but afraid it could explode.
      return indexScan(index, range, bloom);
    }), Promise.resolve()))
  ).then(()=>operands.map(op => op.bloom).reduce((r,c)=>c.applyAND(r)));
}
