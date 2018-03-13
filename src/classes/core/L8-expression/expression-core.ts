import { KeyRange, Transaction } from '../L1-dbcore/dbcore';
import { utilizeCompoundIndexes } from './utilize-compound-indexes';
import { ExpressionQuery } from './expression';
import { disjunctiveNormalForm } from './disjunctive-normal-form';
import { canonicalizeDnf } from './canonicalize';
import { exceptions } from '../../../errors';
import { MultiRangeCore, MultiRangeQueryRequest, MultiRangePageToken, MultiRangeResponse } from '../L4-multirange/multirange-engine';

const enum ResultFlags {
  PrimaryKeys = 1,
  Keys = 2,
  Values = 4
}

export interface ExpressionRequest<TQuery=ExpressionQuery> extends MultiRangeQueryRequest<TQuery> {
  trans: Transaction;
  table: string;
  query: TQuery;
  values?: boolean;
  pageToken?: MultiRangePageToken; // Maybe another PageToken derivation?!!
  index?: string; // This comprises the resulting order (The orderBy index)
  reverse?: boolean;
  limit?: number;
  wantPageToken?: boolean;
  count?: boolean;
}

export interface ExpressionResponse extends MultiRangeResponse {
  pageToken?: MultiRangePageToken;
  approximateCount?: number;
  result: any[];
}

export interface ExpressionCore<TQuery=ExpressionQuery> extends MultiRangeCore<TQuery> {
  query (req: ExpressionRequest<TQuery>): Promise<ExpressionResponse>;
}

export function ExpressionCore (engine: MultiRangeCore<KeyRange[]>) {
  return {
    ...engine,
    query (req: ExpressionRequest) : Promise<ExpressionResponse> {
      // Convert a complex expression into a DNF matrix:
      const dnf = disjunctiveNormalForm(req.query);
      // Canonicalize it (make it "Full DNF"):
      const canonicalDnf = canonicalizeDnf(dnf);
      // The canonicalization process can possible result
      // in an empty expression. If so, return directly:
      if (canonicalDnf.operands.length === 0) return Promise.resolve({
        count: 0,
        result: []
      });

      // Find an IndexLookup for given table:
      const indexLookup = engine.tableIndexLookup[req.table];
      if (!indexLookup) throw new exceptions.InvalidTable(`No such table: ${req.table}`);

      // Further reduce the conjunctions by looking up
      // possible compound indexes to use (with respect
      // of any requested index for ordering (orderBy))
      let conjunctions = canonicalDnf.operands.map(op => 
        utilizeCompoundIndexes(
          op,
          indexLookup,
          req.index));
      
      // TODO: Följ https://docs.google.com/document/d/14C0xzzvRo4p7TQbbMh3bS_rVZZdcsxcuX0W1xga997w/edit#
      // under rubriken "OrderBy evaluering / grundevaluering"
    },
    openCursor(req) {
      throw new Error("Not implemented");
    },
    count(req) {
      throw new Error("Not implemented");
    }

  } as ExpressionCore;
}