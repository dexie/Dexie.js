import { TableSchema } from "./table-schema";
import { IndexableType } from "./indexed-db/index";
import { TableHooks } from "./table-hooks";
import { Collection } from "./collection";
import { ThenShortcut } from "../types/then-shortcut";
import { IndexableTypeArrayReadonly } from "../types/indexable-type";
import { WhereClause } from "./where-clause";
import Promise from "./promise-extended";

export interface Table<T=any, TKey extends IndexableType=any> {
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;

  get(key: TKey): Promise<T | undefined>;
  get<R>(key: TKey, thenShortcut: ThenShortcut<T | undefined,R>): Promise<R>;
  get(equalityCriterias: {[key:string]:IndexableType}): Promise<T | undefined>;
  get<R>(equalityCriterias: {[key:string]:IndexableType}, thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  where(index: string | string[]): WhereClause<T, TKey>;
  where(equalityCriterias: {[key:string]:IndexableType}): Collection<T, TKey>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey>;

  count(): Promise<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;

  offset(n: number): Collection<T, TKey>;

  limit(n: number): Collection<T, TKey>;

  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: TKey}) => any): Promise<void>;

  toArray(): Promise<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): Promise<R>;

  toCollection(): Collection<T, TKey>;
  orderBy(index: string | string[]): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  mapToClass(constructor: Function): Function;
  add(item: T, key?: TKey): Promise<TKey>;
  update(key: TKey | T, changes: { [keyPath: string]: any }): Promise<number>;
  put(item: T, key?: TKey): Promise<TKey>;
  delete(key: TKey): Promise<void>;
  clear(): Promise<void>;
  bulkAdd(items: T[], keys?: IndexableTypeArrayReadonly): Promise<TKey>;
  bulkPut(items: T[], keys?: IndexableTypeArrayReadonly): Promise<TKey>;
  bulkDelete(keys: IndexableTypeArrayReadonly) : Promise<void>;
}
