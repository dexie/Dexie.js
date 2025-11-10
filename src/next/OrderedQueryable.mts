import { Query } from './Query.mjs';
import { Queryable, OffsetQueryable, LimitQueryable } from './Queryable.mjs';

export abstract class OrderedQueryable<T = any, TKey = any, TInsertType = T> extends Queryable<T, TKey, TInsertType> {
  offset(n: number): OffsetQueryable<T, TKey, TInsertType> {
    return new OffsetQueryable(this, n);
  }
  limit(n: number): LimitQueryable<T, TKey, TInsertType> {
    return new LimitQueryable(this, n);
  }
  direction(dir: 'asc' | 'desc'): DirectionQueryable<T, TKey, TInsertType> {
    return new DirectionQueryable(this, dir);
  }
  desc(): DirectionQueryable<T, TKey, TInsertType> {
    return this.direction('desc');
  }
  asc(): DirectionQueryable<T, TKey, TInsertType> {
    return this.direction('asc');
  }
}

export class OrderByQueryable<T = any, TKey = any, TInsertType = T> extends OrderedQueryable<T, TKey, TInsertType> {
  _props: string[];
  constructor(parent: Queryable<T, TKey, TInsertType>, props: string[]) {
    super(parent);
    this._props = props;
  }
  protected _build(query: Query): void {
    query.orderBy.push(...this._props);
  }
}

export class DirectionQueryable<T = any, TKey = any, TInsertType = T> extends OrderedQueryable<T, TKey, TInsertType> {
  _dir: 'asc' | 'desc';
  constructor(parent: Queryable<T, TKey, TInsertType>, dir: 'asc' | 'desc') {
    super(parent);
    this._dir = dir;
  }
  protected _build(query: Query): void {
    query.direction = this._dir;
  }
}
