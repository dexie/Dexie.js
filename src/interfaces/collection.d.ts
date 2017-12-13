import { ThenShortcut } from "../types/then-shortcut";
import { IndexableType, IndexableTypeArray } from "../types/indexable-type";
import { WhereClause } from "./where-clause";
import Promise from "./promise-extended";

export interface Collection<T, TKey> {
  and(filter: (x: T) => boolean): Collection<T, TKey>;
  clone(props?: Object): Collection<T, TKey>;
  count(): Promise<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;
  distinct(): Collection<T, TKey>;
  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: TKey}) => any): Promise<void>;
  eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): Promise<void>;
  eachPrimaryKey(callback: (key: TKey, cursor: {key: IndexableType, primaryKey: TKey}) => any): Promise<void>;
  eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: TKey}) => any): Promise<void>;
  filter(filter: (x: T) => boolean): Collection<T, TKey>;
  first(): Promise<T | undefined>;
  first<R>(thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  keys(): Promise<IndexableTypeArray>;
  keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): Promise<R>;
  primaryKeys(): Promise<TKey[]>;
  primaryKeys<R>(thenShortcut: ThenShortcut<TKey[], R>): Promise<R>;
  last(): Promise<T | undefined>;
  last<R>(thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  limit(n: number): Collection<T, TKey>;
  offset(n: number): Collection<T, TKey>;
  or(indexOrPrimayKey: string): WhereClause<T, TKey>;
  raw(): Collection<T, TKey>;
  reverse(): Collection<T, TKey>;
  sortBy(keyPath: string): Promise<T[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>) : Promise<R>;
  toArray(): Promise<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>) : Promise<R>;
  uniqueKeys(): Promise<IndexableTypeArray>;
  uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): Promise<R>;
  until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, TKey>;
  // Mutating methods
  delete(): Promise<number>;
  modify(changeCallback: (obj: T, ctx:{value: T}) => void): Promise<number>;
  modify(changes: { [keyPath: string]: any } ): Promise<number>;
}
