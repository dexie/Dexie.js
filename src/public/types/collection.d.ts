import { ThenShortcut } from "./then-shortcut";
import { IndexableTypeArray } from "./indexable-type";
import { WhereClause } from "./where-clause";
import { PromiseExtended } from "./promise-extended";
import { IndexableType } from "./indexable-type";
import { Dexie } from "./dexie";
// import { UpdateSpec } from "./update-spec";

export interface Collection<T=any, TKey extends IndexableType=IndexableType, TEntity=T> {
  db: Dexie;
  and(filter: (x: T) => boolean): Collection<T, TKey, TEntity>;
  clone(props?: Object): Collection<T, TKey, TEntity>;
  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;
  distinct(): Collection<T, TKey, TEntity>;
  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachPrimaryKey(callback: (key: TKey, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  filter(filter: (x: T) => boolean): Collection<T, TKey, TEntity>;
  first(): PromiseExtended<T | undefined>;
  first<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  keys(): PromiseExtended<IndexableTypeArray>;
  keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
  primaryKeys(): PromiseExtended<TKey[]>;
  primaryKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>;
  last(): PromiseExtended<T | undefined>;
  last<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  limit(n: number): Collection<T, TKey, TEntity>;
  offset(n: number): Collection<T, TKey, TEntity>;
  or(indexOrPrimayKey: string): WhereClause<T, TKey>;
  raw(): Collection<T, TKey, TEntity>;
  reverse(): Collection<T, TKey, TEntity>;
  sortBy(keyPath: string): PromiseExtended<T[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>) : PromiseExtended<R>;
  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>) : PromiseExtended<R>;
  uniqueKeys(): PromiseExtended<IndexableTypeArray>;
  uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
  until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, TKey, TEntity>;
  // Mutating methods
  delete(): PromiseExtended<number>;
  modify(changeCallback: (obj: T, ctx:{value: T}) => void | boolean): PromiseExtended<number>;
  modify(changes: { [keyPath: string]: any }): PromiseExtended<number>;
}
