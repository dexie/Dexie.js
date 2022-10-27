import { TableSchema } from './table-schema';
import { TableHooks } from './table-hooks';
import { Collection } from './collection';
import { ThenShortcut } from './then-shortcut';
import { WhereClause } from './where-clause';
import { PromiseExtended } from './promise-extended';
import { Dexie } from './dexie';
import { IndexableType, IndexableTypeArrayReadonly, IXType } from './indexable-type';
import { DBCoreTable } from './dbcore';
import { InsertType } from './insert-type';
import { UpdateSpec } from './update-spec';

export interface Table<T = any, TKey extends IndexableType = any, TEntity = T> {
  db: Dexie;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey, TEntity>;
  core: DBCoreTable;

  get(key: IXType<TEntity,TKey>): PromiseExtended<T | undefined>;
  get<R>(key: IXType<TEntity,TKey>, thenShortcut: ThenShortcut<T | undefined, R> ): PromiseExtended<R>;
  get(equalityCriterias: {[key: string]: any}): PromiseExtended<T | undefined>;
  get<R>(equalityCriterias: { [key: string]: any }, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  where(index: string | string[]): WhereClause<T, TKey, TEntity>;
  where(equalityCriterias: { [key: string]: any }): Collection<T, TKey, TEntity>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey, TEntity>;

  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;

  offset(n: number): Collection<T, TKey, TEntity>;

  limit(n: number): Collection<T, TKey, TEntity>;

  each(callback: (obj: T, cursor: { key: any; primaryKey: IXType<TEntity,TKey> }) => any): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;

  toCollection(): Collection<T, TKey, TEntity>;
  orderBy(index: string | string[]): Collection<T, TKey, TEntity>;
  reverse(): Collection<T, TKey, TEntity>;
  mapToClass(constructor: Function): Function;
  add(item: InsertType<TEntity, void, TKey>, key?: IXType<TEntity,TKey>): PromiseExtended<IXType<TEntity,TKey>>;
  update(
    key: IXType<TEntity,TKey> | T,
    changes: UpdateSpec<TEntity> | ((obj: T, ctx:{value: any, primKey: IndexableType}) => void | boolean)
  ): PromiseExtended<number>;
  put(item: InsertType<TEntity, void, TKey>, key?: IXType<TEntity,TKey>): PromiseExtended<IXType<TEntity,TKey>>;
  delete(key: IXType<TEntity,TKey>): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
  bulkGet(keys: IXType<TEntity,TKey>[]): PromiseExtended<(T | undefined)[]>;

  bulkAdd<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? IXType<TEntity,TKey>[] : IXType<TEntity,TKey>>;
  bulkAdd<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], options: { allKeys: B }): PromiseExtended<B extends true ? IXType<TEntity,TKey>[] : IXType<TEntity,TKey>>;
  bulkAdd(items: readonly InsertType<TEntity, void, TKey>[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<IXType<TEntity,TKey>>;

  bulkPut<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? IXType<TEntity,TKey>[] : IXType<TEntity,TKey>>;
  bulkPut<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], options: { allKeys: B }): PromiseExtended<B extends true ? IXType<TEntity,TKey>[] : IXType<TEntity,TKey>>;
  bulkPut(items: readonly InsertType<TEntity, void, TKey>[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<IXType<TEntity,TKey>>;

  bulkDelete(keys: IXType<TEntity,TKey>[]): PromiseExtended<void>;
}
