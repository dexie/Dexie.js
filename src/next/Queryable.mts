import { Query, QueryPlan } from "./Query.mjs";

export abstract class Queryable<T = any, TKey = any, TInsertType = T> {
  protected _parent: Queryable<T, TKey, TInsertType> | null;

  constructor(parent: Queryable<T, TKey, TInsertType> | null) {
    this._parent = parent;
  }

  protected _exec(query: Query): Promise<ReadonlyArray<T> | QueryPlan> {
    if (!this._parent) throw new Error("No engine to execute query.");
    return this._parent._exec(query);
  }
  protected _count(query: Query): Promise<number> {
    if (!this._parent) throw new Error("No engine to count query.");
    return this._parent._count(query);
  }
  protected abstract _build(query: Query): void;

  protected _buildQuery(query: Query): void {
    if (this._parent) {
      this._parent._buildQuery(query);
    }
    this._build(query);
  }

  toArray(): Promise<ReadonlyArray<T>> {
    const query = new Query();
    this._buildQuery(query);
    return this._exec(query) as Promise<ReadonlyArray<T>>;
  }
  count(): Promise<number> {
    const query = new Query();
    this._buildQuery(query);
    return this._count(query);
  }
  explain(): Promise<QueryPlan> {
    const query = new Query();
    query.explain = true;
    this._buildQuery(query);
    return this._exec(query) as Promise<QueryPlan>;
  }
}

export class OffsetQueryable<T = any, TKey = any, TInsertType = T> extends Queryable<T, TKey, TInsertType> {
  protected _offsetValue: number;
  constructor(parent: Queryable<T, TKey, TInsertType>, _offsetValue: number) {
    super(parent);
    this._offsetValue = _offsetValue;
  }

  protected _build(query: Query): void {
    query.offset = this._offsetValue;
  }

  limit(n: number): LimitQueryable<T, TKey, TInsertType> {
    return new LimitQueryable(this, n);
  }
}

export class LimitQueryable<T = any, TKey = any, TInsertType = T> extends Queryable<T, TKey, TInsertType> {
  protected _limitValue: number;
  constructor(parent: Queryable<T, TKey, TInsertType>, _limitValue: number) {
    super(parent);
    this._limitValue = _limitValue;
  }
  protected _build(query: Query): void {
    query.limit = this._limitValue;
  }
}

