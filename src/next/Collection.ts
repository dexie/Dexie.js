import { WhereClause } from './WhereClause';
import { Queryable } from './Queryable';
import { canonicalizeMango, MangoExpression, MangoExpressionWithAliases } from './MangoExpression';
import { OrderByQueryable } from './OrderedQueryable';
import { Query } from './Query';

export abstract class Collection extends Queryable {
  where(prop: string): WhereClause;
  where(expr: MangoExpressionWithAliases): Collection;
  where(arg: string | MangoExpressionWithAliases): WhereClause | Collection {
    if (typeof arg === 'object') {
      return new FilteredCollection(this, canonicalizeMango(arg), 'and');
    } else {
      return new WhereClause(this, arg, 'and');
    }
  }
  orderBy(...props: string[]) {
    return new OrderByQueryable(this, props);
  }
}

export class FilteredCollection extends Collection {
  _op: 'or' | 'and';
  _expr: MangoExpression;
  constructor(parent: Queryable, expr: MangoExpression, op: 'or' | 'and') {
    super(parent);
    this._expr = expr;
    this._op = op;
  }
  or(prop: string): WhereClause;
  or(expr: MangoExpressionWithAliases): Collection;
  or(arg: string | MangoExpressionWithAliases): WhereClause | Collection {
    if (typeof arg === 'object') {
      return new FilteredCollection(this, canonicalizeMango(arg), 'or');
    } else {
      return new WhereClause(this, arg, 'or');
    }
  }
  protected _build(query: Query): void {
    if (query.where === null) {
      query.where = this._expr;
    } else if (this._op === 'and') {
      query.where = {$and: [query.where, this._expr]};
    } else if (this._op === 'or') {
      query.where = {$or: [query.where, this._expr]};
    }
  }
}


