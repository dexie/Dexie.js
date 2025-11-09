import { Query } from './Query';
import { Queryable, OffsetQueryable, LimitQueryable } from './Queryable';

export abstract class OrderedQueryable extends Queryable {
  offset(n: number) {
    return new OffsetQueryable(this, n);
  }
  limit(n: number) {
    return new LimitQueryable(this, n);
  }
  direction(dir: 'asc' | 'desc') {
    return new DirectionQueryable(this, dir);
  }
  desc() {
    return this.direction('desc');
  }
  asc() {
    return this.direction('asc');
  }
}

export class OrderByQueryable extends OrderedQueryable {
  _props: string[];
  constructor(parent: Queryable, props: string[]) {
    super(parent);
    this._props = props;
  }
  protected _build(query: Query): void {
    query.orderBy.push(...this._props);
  }
}

export class DirectionQueryable extends OrderedQueryable {
  _dir: 'asc' | 'desc';
  constructor(parent: Queryable, dir: 'asc' | 'desc') {
    super(parent);
    this._dir = dir;
  }
  protected _build(query: Query): void {
    query.direction = this._dir;
  }
}
