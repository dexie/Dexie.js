import { TableSchema } from './table-schema';
import { IndexableTypeArrayReadonly } from './indexable-type';
import { TableHooks } from './table-hooks';
import { Collection } from './collection';
import { ThenShortcut } from './then-shortcut';
import { WhereClause } from './where-clause';
import { PromiseExtended } from './promise-extended';
import { Dexie } from './dexie';
import { IndexableType } from './indexable-type';
import { DBCoreTable } from './dbcore';
import { InsertType } from './insert-type';
import { UpdateSpec } from './update-spec';

export type IsStrictlyAny<T> = (T extends never ? true : false) extends false ? false : true;
export type IDType<T, TKey extends IndexableType> = TKey extends keyof T ? T[TKey] : TKey;
export type IDType2<T, TKey extends IndexableType> = TKey extends keyof T ? (T[TKey] extends IndexableType ? T[TKey] : TKey) : TKey;
export type IXType<T, TKey extends IndexableType> = IsStrictlyAny<TKey> extends true ? IndexableType : TKey extends keyof T ? T[TKey] extends IndexableType ? T[TKey] : IndexableType : TKey;

export interface Table<T = any, TKey extends IndexableType = any, TEntity = T> {
  db: Dexie;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;
  core: DBCoreTable;

  get(key: TKey): PromiseExtended<T | undefined>;
  get<R>(key: TKey, thenShortcut: ThenShortcut<T | undefined, R> ): PromiseExtended<R>;
  get(equalityCriterias: {[key: string]: any}): PromiseExtended<T | undefined>;
  get<R>(equalityCriterias: { [key: string]: any }, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  where(index: string | string[]): WhereClause<T, TKey>;
  where(equalityCriterias: { [key: string]: any }): Collection<T, TKey>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey>;

  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;

  offset(n: number): Collection<T, TKey>;

  limit(n: number): Collection<T, TKey>;

  each(callback: (obj: T, cursor: { key: any; primaryKey: TKey }) => any): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;

  toCollection(): Collection<T, TKey>;
  orderBy(index: string | string[]): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  mapToClass(constructor: Function): Function;
  add(item: InsertType<TEntity, void, TKey>, key?: TKey): PromiseExtended<TKey>;
  update(
    key: TKey | T,
    changes: UpdateSpec<TEntity> | ((obj: T, ctx:{value: any, primKey: IndexableType}) => void | boolean)
  ): PromiseExtended<number>;
  put(item: InsertType<TEntity, void, TKey>, key?: TKey): PromiseExtended<TKey>;
  delete(key: TKey): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
  bulkGet(keys: TKey[]): PromiseExtended<(T | undefined)[]>;

  bulkAdd<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd(items: readonly InsertType<TEntity, void, TKey>[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<TKey>;

  bulkPut<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut<B extends boolean>(items: readonly InsertType<TEntity, void, TKey>[], options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut(items: readonly InsertType<TEntity, void, TKey>[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<TKey>;

  bulkDelete(keys: TKey[]): PromiseExtended<void>;
}
