import { ThenShortcut } from "./then-shortcut";
import { IndexableTypeArray } from "./indexable-type";
import { WhereClause } from "./where-clause";
import { PromiseExtended } from "./promise-extended";
import { IndexableType } from "./indexable-type";
import { Dexie } from "./dexie";
import { UpdateSpec } from "./update-spec";

export interface Collection<T=any, TKey=IndexableType, TInsertType=T> {
  db: Dexie;
  and(filter: (x: T) => boolean): Collection<T, TKey, TInsertType>;
  clone(props?: Object): Collection<T, TKey, TInsertType>;
  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;
  distinct(): Collection<T, TKey, TInsertType>;
  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachPrimaryKey(callback: (key: TKey, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  filter<S extends T>(filter: (x: T) => x is S): Collection<S, TKey>;
  filter(filter: (x: T) => boolean): Collection<T, TKey, TInsertType>;
  first(): PromiseExtended<T | undefined>;
  first<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  firstKey(): PromiseExtended<IndexableType | undefined>;
  keys(): PromiseExtended<IndexableTypeArray>;
  keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
  primaryKeys(): PromiseExtended<TKey[]>;
  primaryKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>;
  last(): PromiseExtended<T | undefined>;
  last<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  lastKey(): PromiseExtended<IndexableType | undefined>;
  limit(n: number): Collection<T, TKey, TInsertType>;
  offset(n: number): Collection<T, TKey, TInsertType>;
  or(indexOrPrimayKey: string): WhereClause<T, TKey, TInsertType>;
  raw(): Collection<T, TKey, TInsertType>;
  reverse(): Collection<T, TKey, TInsertType>;
  sortBy(keyPath: string): PromiseExtended<T[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>) : PromiseExtended<R>;
  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>) : PromiseExtended<R>;
  uniqueKeys(): PromiseExtended<IndexableTypeArray>;
  uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
  until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, TKey, TInsertType>;
  // Mutating methods
  delete(): PromiseExtended<number>;
  modify(changeCallback: (obj: T, ctx:{value: TInsertType}) => void | boolean): PromiseExtended<number>;
  modify(changes: UpdateSpec<TInsertType>): PromiseExtended<number>;
}
