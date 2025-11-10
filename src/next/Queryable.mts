import { Query } from "./Query.mjs";

export abstract class Queryable<T = any, TKey = any, TInsertType = T> {
  protected _parent: Queryable<T, TKey, TInsertType> | null;

  constructor(parent: Queryable<T, TKey, TInsertType> | null) {
    this._parent = parent;
  }

  protected _exec(query: Query): Promise<ReadonlyArray<T>> {
    if (!this._parent) throw new Error("No engine to execute query.");
    this._build(query);
    return this._parent._exec(query);
  }
  protected _count(query: Query): Promise<number> {
    if (!this._parent) throw new Error("No engine to count query.");
    this._build(query);
    return this._parent._count(query);
  }
  protected abstract _build(query: Query): void;

  toArray(): Promise<ReadonlyArray<T>> {
    const query = new Query();
    this._build(query);
    return this._exec(query);
  }
  count(): Promise<number> {
    const query = new Query();
    this._build(query);
    return this._count(query);
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

