import { ThenShortcut } from "../types/then-shortcut";
import { IndexableType, IndexableTypeArray } from "../types/indexable-type";
import { WhereClause } from "./where-clause";

export interface Collection<T, Key> {
  and(filter: (x: T) => boolean): Collection<T, Key>;
  clone(props?: Object): Collection<T, Key>;
  count(): Promise<number>;
  count<R>(thenShortcut: ThenShortcut<number, R>): Promise<R>;
  distinct(): Collection<T, Key>;
  each(callback: (obj: T, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
  eachKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
  eachPrimaryKey(callback: (key: Key, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
  eachUniqueKey(callback: (key: IndexableType, cursor: {key: IndexableType, primaryKey: Key}) => any): Promise<void>;
  filter(filter: (x: T) => boolean): Collection<T, Key>;
  first(): Promise<T | undefined>;
  first<R>(thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  keys(): Promise<IndexableTypeArray>;
  keys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): Promise<R>;
  primaryKeys(): Promise<Key[]>;
  primaryKeys<R>(thenShortcut: ThenShortcut<Key[], R>): Promise<R>;
  last(): Promise<T | undefined>;
  last<R>(thenShortcut: ThenShortcut<T | undefined, R>): Promise<R>;
  limit(n: number): Collection<T, Key>;
  offset(n: number): Collection<T, Key>;
  or(indexOrPrimayKey: string): WhereClause<T, Key>;
  raw(): Collection<T, Key>;
  reverse(): Collection<T, Key>;
  sortBy(keyPath: string): Promise<T[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<T[], R>) : Promise<R>;
  toArray(): Promise<Array<T>>;
  toArray<R>(thenShortcut: ThenShortcut<T[], R>) : Promise<R>;
  uniqueKeys(): Promise<IndexableTypeArray>;
  uniqueKeys<R>(thenShortcut: ThenShortcut<IndexableTypeArray, R>): Promise<R>;
  until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, Key>;
  // Mutating methods
  delete(): Promise<number>;
  modify(changeCallback: (obj: T, ctx:{value: T}) => void): Promise<number>;
  modify(changes: { [keyPath: string]: any } ): Promise<number>;
}
