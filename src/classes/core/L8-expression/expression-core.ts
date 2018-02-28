import { KeyRange, Transaction } from '../L1-dbcore/dbcore';
import { PagingCore } from '../L5-paging-low-level/paging-engine';
import { utilizeCompoundIndexes } from './utilize-compound-indexes';
import { Expression } from './expression';
import { disjunctiveNormalForm } from './disjunctive-normal-form';
import { canonicalizeDnf } from './canonicalize';
import { exceptions } from '../../../errors';

const enum ResultFlags {
  PrimaryKeys = 1,
  Keys = 2,
  Values = 4
}

export interface ExpressionQuery {
  trans: Transaction;
  table: string;
  expr: Expression;
  // wait with pageToken so far! Gonna put it in later!
  want: {
    result: ResultFlags;
    pageToken?: boolean;
    count?: boolean;
  },
  orderBy?: {
    keyPath: string;
    reverse?: string;
    unique?: boolean;
    limit?: number;
  }
}

export interface QueryResponse {
  pageToken?: any;
  count?: number;
  keys?: any[];
  primaryKeys?: any[];
  values?: any[];
}

export interface ExpressionCore extends PagingCore {
  evaluateExpression (query: ExpressionQuery): Promise<QueryResponse>;
}

export function ExpressionCore (engine: PagingCore) {
  return {
    ...engine,
    evaluateExpression (query) {
      // Convert a complex expression into a DNF matrix:
      const dnf = disjunctiveNormalForm(query.expr);
      // Canonicalize it (make it "Full DNF"):
      const canonicalDnf = canonicalizeDnf(dnf);
      // The canonicalization process can possible result
      // in an empty expression. If so, return directly:
      if (canonicalDnf.operands.length === 0) return Promise.resolve({
        count: 0,
        keys: [],
        primaryKeys: [],
        values: [] // Maybe inspect the query before returning all non-requested props?!
      });

      // Find an IndexLookup for given table:
      const indexLookup = engine.tableIndexLookup[query.table];
      if (!indexLookup) throw new exceptions.InvalidTable(`No such table: ${query.table}`);

      // Further reduce the conjunctions by looking up
      // possible compound indexes to use (with respect
      // of any requested index for ordering (orderBy))
      let conjunctions = canonicalDnf.operands.map(op => 
        utilizeCompoundIndexes(
          op,
          indexLookup,
          query.orderBy && query.orderBy.keyPath));
      
      // TODO: Följ https://docs.google.com/document/d/14C0xzzvRo4p7TQbbMh3bS_rVZZdcsxcuX0W1xga997w/edit#
      // under rubriken "OrderBy evaluering / grundevaluering"
    }
  } as ExpressionCore;
}