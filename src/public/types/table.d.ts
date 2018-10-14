import { TableSchema } from "./table-schema";
import { IndexableTypeArrayReadonly } from "./indexable-type";
import { TableHooks } from "./table-hooks";
import { Collection } from "./collection";
import { ThenShortcut } from "./then-shortcut";
import { WhereClause } from "./where-clause";
import { PromiseExtended } from "./promise-extended";
import { Database } from "./database";
import { IndexableType } from "./indexable-type";

export interface Table<T=any, TKey=IndexableType> {
  db: Database;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;

  get(key: TKey): PromiseExtended<T | undefined>;
  get<R>(key: TKey, thenShortcut: ThenShortcut<T | undefined,R>): PromiseExtended<R>;
  get(equalityCriterias: {[key:string]:any}): PromiseExtended<T | undefined>;
  get<R>(equalityCriterias: {[key:string]:any}, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  where(index: string | string[]): WhereClause<T, TKey>;
  where(equalityCriterias: {[key:string]:any}): Collection<T, TKey>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey>;

  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;

  offset(n: number): Collection<T, TKey>;

  limit(n: number): Collection<T, TKey>;

  each(callback: (obj: T, cursor: {key: any, primaryKey: TKey}) => any): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;

  toCollection(): Collection<T, TKey>;
  orderBy(index: string | string[]): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  mapToClass(constructor: Function): Function;
  add(item: T, key?: TKey): PromiseExtended<TKey>;
  update(key: TKey | T, changes: { [keyPath: string]: any }): PromiseExtended<number>;
  put(item: T, key?: TKey): PromiseExtended<TKey>;
  delete(key: TKey): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
  bulkAdd(items: T[], keys?: IndexableTypeArrayReadonly): PromiseExtended<TKey>;
  bulkPut(items: T[], keys?: IndexableTypeArrayReadonly): PromiseExtended<TKey>;
  bulkDelete(keys: IndexableTypeArrayReadonly) : PromiseExtended<void>;
}
