import { TableSchema } from "./table-schema";
import { IndexableTypeArrayReadonly } from "./indexable-type";
import { TableHooks } from "./table-hooks";
import { Collection } from "./collection";
import { ThenShortcut } from "./then-shortcut";
import { WhereClause } from "./where-clause";
import { PromiseExtended } from "./promise-extended";
import { IndexableType } from "./indexable-type";
import { DBCoreTable } from "./dbcore";
import { InsertType } from "./insert-type";
import { KeyPaths, KeyPathValue } from "./keypaths";
import { Dexie } from "./dexie";
import { UpdateSpec } from "./update-spec";

export type IDType<T, TKey> = TKey extends keyof T ? T[TKey] : TKey;
export interface Table<T=any, TKeyPropNameOrKeyType=IndexableType, TOpt=void> {
  db: Dexie;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, IDType<T, TKeyPropNameOrKeyType>>;
  core: DBCoreTable;

  get(key: IDType<T, TKeyPropNameOrKeyType>): PromiseExtended<T | undefined>;
  get<R>(key: IDType<T, TKeyPropNameOrKeyType>, thenShortcut: ThenShortcut<T | undefined,R>): PromiseExtended<R>;
  get(equalityCriterias: {[key:string]:any}): PromiseExtended<T | undefined>;
  get<R>(equalityCriterias: {[key:string]:any}, thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  where(index: string | string[]): WhereClause<T, IDType<T, TKeyPropNameOrKeyType>>;
  where(equalityCriterias: {[key:string]:any}): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;

  filter(fn: (obj: T) => boolean): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;

  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;

  offset(n: number): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;

  limit(n: number): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;

  each(callback: (obj: T, cursor: {key: any, primaryKey: IDType<T, TKeyPropNameOrKeyType>}) => any): PromiseExtended<void>;

  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>): PromiseExtended<R>;

  toCollection(): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;
  orderBy(index: string | string[]): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;
  reverse(): Collection<T, IDType<T, TKeyPropNameOrKeyType>>;
  mapToClass(constructor: Function): Function;
  add(item: InsertType<T, TOpt, TKeyPropNameOrKeyType>, key?: IDType<T, TKeyPropNameOrKeyType>): PromiseExtended<IDType<T, TKeyPropNameOrKeyType>>;
  update(
    key: IDType<T, TKeyPropNameOrKeyType> | T,
    changes: UpdateSpec<T> | ((obj: T, ctx:{value: any, primKey: IndexableType}) => void | boolean)): PromiseExtended<number>;
  put(item: InsertType<T, TOpt, TKeyPropNameOrKeyType>, key?: IDType<T, TKeyPropNameOrKeyType>): PromiseExtended<IDType<T, TKeyPropNameOrKeyType>>;
  delete(key: IDType<T, TKeyPropNameOrKeyType>): PromiseExtended<void>;
  clear(): PromiseExtended<void>;
  bulkGet(keys: IDType<T, TKeyPropNameOrKeyType>[]): PromiseExtended<(T | undefined)[]>;

  bulkAdd<B extends boolean>(items: readonly InsertType<T, TOpt, TKeyPropNameOrKeyType>[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? IDType<T, TKeyPropNameOrKeyType>[] : IDType<T, TKeyPropNameOrKeyType>>;
  bulkAdd<B extends boolean>(items: readonly InsertType<T, TOpt, TKeyPropNameOrKeyType>[], options: { allKeys: B }): PromiseExtended<B extends true ? IDType<T, TKeyPropNameOrKeyType>[] : IDType<T, TKeyPropNameOrKeyType>>;
  bulkAdd(items: readonly InsertType<T, TOpt, TKeyPropNameOrKeyType>[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<IDType<T, TKeyPropNameOrKeyType>>;

  bulkPut<B extends boolean>(items: readonly InsertType<T, TOpt, TKeyPropNameOrKeyType>[], keys: IndexableTypeArrayReadonly, options: { allKeys: B }): PromiseExtended<B extends true ? IDType<T, TKeyPropNameOrKeyType>[] : IDType<T, TKeyPropNameOrKeyType>>;
  bulkPut<B extends boolean>(items: readonly InsertType<T, TOpt ,TKeyPropNameOrKeyType>[], options: { allKeys: B }): PromiseExtended<B extends true ? IDType<T, TKeyPropNameOrKeyType>[] : IDType<T, TKeyPropNameOrKeyType>>;
  bulkPut(items: readonly InsertType<T, TOpt, TKeyPropNameOrKeyType>[], keys?: IndexableTypeArrayReadonly, options?: { allKeys: boolean }): PromiseExtended<IDType<T, TKeyPropNameOrKeyType>>;

  bulkDelete(keys: IDType<T, TKeyPropNameOrKeyType>[]): PromiseExtended<void>;
}
