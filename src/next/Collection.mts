import { WhereClause } from './WhereClause.mjs';
import { Queryable } from './Queryable.mjs';
import { canonicalizeMango, MangoExpression, MangoExpressionWithAliases } from './MangoExpression.mjs';
import { OrderByQueryable } from './OrderedQueryable.mjs';
import { Query } from './Query.mjs';

export abstract class Collection<T = any, TKey = any, TInsertType = T> extends Queryable<T, TKey, TInsertType> {
  where(prop: string): WhereClause<T, TKey, TInsertType>;
  where(expr: MangoExpressionWithAliases): Collection<T, TKey, TInsertType>;
  where(arg: string | MangoExpressionWithAliases): WhereClause<T, TKey, TInsertType> | Collection<T, TKey, TInsertType> {
    if (typeof arg === 'object') {
      return new FilteredCollection(this, canonicalizeMango(arg), 'and');
    } else {
      return new WhereClause(this, arg, 'and');
    }
  }
  orderBy(...props: string[]): OrderByQueryable<T, TKey, TInsertType> {
    return new OrderByQueryable(this, props);
  }
}

export class FilteredCollection<T = any, TKey = any, TInsertType = T> extends Collection<T, TKey, TInsertType> {
  _op: 'or' | 'and';
  _expr: MangoExpression;
  constructor(parent: Queryable<T, TKey, TInsertType>, expr: MangoExpression, op: 'or' | 'and') {
    super(parent);
    this._expr = expr;
    this._op = op;
  }
  or(prop: string): WhereClause<T, TKey, TInsertType>;
  or(expr: MangoExpressionWithAliases): Collection<T, TKey, TInsertType>;
  or(arg: string | MangoExpressionWithAliases): WhereClause<T, TKey, TInsertType> | Collection<T, TKey, TInsertType> {
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


