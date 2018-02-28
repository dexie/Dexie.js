import { PagingCore, PagedQueryResponse } from '../L5-paging-low-level/paging-engine';
import { Transaction, Key, KeyRange } from '../L1-dbcore/dbcore';
import { AtomicFormula } from '../L8-expression/expression';
import { KeyMap } from '../../../helpers/keymap';
import { KeySet } from '../../../helpers/keyset';
import { assert } from '../../../functions/utils';

export interface PagedMultiRangeCriteria {
  index: string;
  ranges: KeyRange[];
  isOrderBy?: boolean;
  reverse?: boolean;
  prevResponseKeys?: {primaryKeys: Key[]}[];
}

export function intersect(core: PagingCore, trans: Transaction, table: string, operands: PagedMultiRangeCriteria[]): Promise<KeySet> {
  assert (!operands.some((o,i) => o.isOrderBy && i !== operands.length - 1),
    "isOrderBy only valid for last operand");
    
  return Promise.all(operands.map(({index, ranges, prevResponseKeys, isOrderBy, reverse}) => isOrderBy ?
    // If isOrderBy, wait with querying this one until last.
    {
      index,
      ranges,
      prevResponseKeys: [],
      primaryKeys: [],
      isOrderBy: true,
      reverse,
      hasMore: true
    } :
    // If not orderBy, start querying the first/next chunk of each operand until
    // the first complete index scan
    core.queryRanges({
      index,
      ranges,
      lastPrimaryKey: prevResponseKeys && prevResponseKeys[prevResponseKeys.length-1],
      limit: 1000,
      table,
      trans,
      want: 'primaryKeys',
      wantNextQuery: true
  }).then(({hasMore, primaryKeys}) => ({
    index,
    ranges,
    prevResponseKeys: prevResponseKeys || [],
    primaryKeys,
    isOrderBy,
    reverse,
    hasMore
  })))).then(responses => {
    const doneResults = responses.filter(r => !r.hasMore);
    if (doneResults.length === 0) {
      // Still not any operand has finished to end. Keep on scanning:
      return intersect(core, trans, table, responses.map(r => ({
        index: r.index,
        ranges: r.ranges,
        isOrderBy: false,
        prevResponseKeys: r.prevResponseKeys.concat({primaryKeys: r.primaryKeys})
      })));
    } else {
      // Got enough to produce a Set based on the first non-orderBy operand:
      const {prevResponseKeys, primaryKeys} = doneResults.shift();
      let set = KeySet();
      prevResponseKeys.forEach(({primaryKeys}) => set.bulkAdd(primaryKeys));
      set.bulkAdd(primaryKeys);
      // Reduce set with all done results:
      doneResults.forEach(({prevResponseKeys, primaryKeys}) => {
        const newSet = KeySet();        
        newSet.bulkAddIntersect(primaryKeys, set);
        prevResponseKeys.forEach(({primaryKeys}) => newSet.bulkAddIntersect(primaryKeys, set));
        set = newSet;
      });
      // Continue reading unfinished operands
      const undoneResults = responses.filter(r => r.hasMore);
      if (undoneResults.length === 0) return set;
      return undoneResults.reduce((p, r) => {
        const newSet = KeySet();
        let lastPrimaryKey = r.prevResponseKeys && r.prevResponseKeys[r.prevResponseKeys.length - 1];
        return p.then(set => (function nextChunk(lastPrimaryKey: Key){
          return core.queryRanges({
            trans,
            table,
            want: 'primaryKeys',
            wantNextQuery: true,
            limit: 1000,
            lastPrimaryKey,
            index: r.index,
            ranges: r.ranges,
            reverse: r.isOrderBy && r.reverse
          }).then(({primaryKeys, hasMore})=>{
            newSet.bulkAddIntersect(primaryKeys, set);
            return hasMore ?
              nextChunk(primaryKeys[primaryKeys.length - 1]) :
              newSet;
          });
        })(lastPrimaryKey));
      }, Promise.resolve(set));
    }
  });
}