import { ThenShortcut } from "./then-shortcut";
import { IndexableTypeArray } from "./indexable-type";
import { WhereClause } from "./where-clause";
import { PromiseExtended } from "./promise-extended";
import { Database } from "./database";
import { IndexableType } from "./indexable-type";

export interface Collection<T=any, TKey=IndexableType> {
  //db: Database;
  and(filter: (x: T) => boolean): Collection<T, TKey>;
  clone(props?: Object): Collection<T, TKey>;
  count(): PromiseExtended<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): PromiseExtended<R>;
  distinct(): Collection<T, TKey>;
  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachPrimaryKey(callback: (key: TKey, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): PromiseExtended<void>;
  filter(filter: (x: T) => boolean): Collection<T, TKey>;
  first(): PromiseExtended<T | undefined>;
  first<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  keys(): PromiseExtended<IndexableTypeArray>;
  keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
  primaryKeys(): PromiseExtended<TKey[]>;
  primaryKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): PromiseExtended<R>;
  last(): PromiseExtended<T | undefined>;
  last<R>(thenShortcut: ThenShortcut<T | undefined, R>): PromiseExtended<R>;
  limit(n: number): Collection<T, TKey>;
  offset(n: number): Collection<T, TKey>;
  or(indexOrPrimayKey: string): WhereClause<T, TKey>;
  raw(): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  sortBy(keyPath: string): PromiseExtended<T[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>) : PromiseExtended<R>;
  toArray(): PromiseExtended<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>) : PromiseExtended<R>;
  uniqueKeys(): PromiseExtended<IndexableTypeArray>;
  uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): PromiseExtended<R>;
  until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, TKey>;
  // Mutating methods
  delete(): PromiseExtended<number>;
  modify(changeCallback: (obj: T, ctx:{value: T}) => void | boolean): PromiseExtended<number>;
  modify(changes: { [keyPath: string]: any } ): PromiseExtended<number>;
}
