import { TableSchema } from "./table-schema";
import { IDBValidKey, IndexableTypeArrayReadonly } from "./indexeddb";
import { TableHooks } from "./table-hooks";
import { Collection } from "./collection";
import { ThenShortcut } from "./then-shortcut";
import { WhereClause } from "./where-clause";
import Promise from "./promise-extended";
import { Database } from "./database";

export interface Table<T=any, TKey extends IDBValidKey=IDBValidKey> {
  db: Database;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;

  get(key: TKey): Promise<T | undefined>;
  get<R>(key: TKey, thenShortcut: ThenShortcut<T | undefined,R>): Promise<R>;
  get(equalityCriterias: {[key:string]:IDBValidKey}): Promise<T | undefined>;
  get<R>(equalityCriterias: {[key:string]:IDBValidKey}, thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  where(index: string | string[]): WhereClause<T, TKey>;
  where(equalityCriterias: {[key:string]:IDBValidKey}): Collection<T, TKey>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey>;

  count(): Promise<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;

  offset(n: number): Collection<T, TKey>;

  limit(n: number): Collection<T, TKey>;

  each(callback: (obj: T, cursor: {key: IDBValidKey, primaryKey: TKey}) => any): Promise<void>;

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
