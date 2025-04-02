import { TableSchema } from "./table-schema";
import { IndexableTypeArrayReadonly } from "./indexable-type";
import { TableHooks } from "./table-hooks";
import { Collection } from "./collection";
import { ThenShortcut } from "./then-shortcut";
import { WhereClause } from "./where-clause";
import { PromiseExtended } from "./promise-extended";
import { IndexableType } from "./indexable-type";
import { DBCoreTable } from "./dbcore";
import { Dexie } from "./dexie";
import { UpdateSpec } from "./update-spec";

export interface Table<T=any, TKey=any, TInsertType=T> {
  db: Dexie;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey, TInsertType>;
  core: DBCoreTable;

  get(key: TKey): PromiseExtended<T | undefined>;
  get<R>(key: TKey, thenShortcut: ThenShortcut<T | undefined,R>): PromiseExtended<R>;
  get(equalityCriterias: {[key:string]:any}): PromiseExtended<T | undefined>;
  get<R>(equalityCriterias: {[key:string]:any}, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  where(index: string | string[]): WhereClause<T, TKey, TInsertType>;
  where(equalityCriterias: {[key:string]:any}): Collection<T, TKey, TInsertType>;

  filter(fn: (obj: T) => boolean): Collection<T, TKey, TInsertType>;

  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;

  offset(n: number): Collection<T, TKey, TInsertType>;

  limit(n: number): Collection<T, TKey, TInsertType>;

  each(callback: (obj: T, cursor: {key: any, primaryKey: TKey}) => any): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;

  toCollection(): Collection<T, TKey, TInsertType>;
  orderBy(index: string | string[]): Collection<T, TKey, TInsertType>;
  reverse(): Collection<T, TKey, TInsertType>;
  mapToClass(constructor: Function): Function;
  add(item: TInsertType, key?: TKey): PromiseExtended<TKey>;
  update(
    key: TKey | T,
    changes: UpdateSpec<TInsertType> | ((obj: T, ctx:{value: any, primKey: IndexableType}) => void | boolean)): PromiseExtended<number>;
  put(item: TInsertType, key?: TKey): PromiseExtended<TKey>;
  delete(key: TKey): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
  bulkGet(keys: TKey[]): PromiseExtended<(T | undefined)[]>;

  bulkAdd<B extends boolean>(items: readonly TInsertType[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd<B extends boolean>(items: readonly TInsertType[], options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkAdd(items: readonly TInsertType[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<TKey>;

  bulkPut<B extends boolean>(items: readonly TInsertType[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut<B extends boolean>(items: readonly TInsertType[], options: { allKeys: B }): PromiseExtended<B extends true ? TKey[] : TKey>;
  bulkPut(items: readonly TInsertType[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<TKey>;

  bulkUpdate(keysAndChanges: ReadonlyArray<{key: TKey, changes: UpdateSpec<T>}>): PromiseExtended<number>;

  bulkDelete(keys: TKey[]): PromiseExtended<void>;
}
