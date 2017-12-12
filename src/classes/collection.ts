import { Collection as ICollection } from "../interfaces/collection";
import { WhereClause } from "./where-clause";
import { Dexie } from "./dexie";
import { Table } from "./table";
import { IndexableType } from "../types/indexable-type";
import Promise from "../interfaces/promise-extended";

export class Collection<T,TKey extends IndexableType> implements ICollection<T,TKey> {
  _ctx: CollectionContext<T,TKey>;

  constructor (
    whereClause?: WhereClause<T,TKey> | null,
    keyRangeGenerator?: ()=>IDBKeyRange)
  {
    let keyRange = null, error = null;
    if (keyRangeGenerator) try {
        keyRange = keyRangeGenerator();
    } catch (ex) {
        error = ex;
    }

    var whereCtx = whereClause._ctx,
        table = whereCtx.table;
    this._ctx = {
        table: table,
        index: whereCtx.index,
        isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
        range: keyRange,
        keysOnly: false,
        dir: "next",
        unique: "",
        algorithm: null,
        filter: null,
        replayFilter: null,
        justLimit: true, // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
        isMatch: null,
        offset: 0,
        limit: Infinity,
        error: error, // If set, any promise must be rejected with this error
        or: whereCtx.or,
        valueMapper: table.hook.reading.fire
    };
  }

  and(filter: (x: T) => boolean): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  clone(props?: Object): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  count(): Promise<number>;
  count<R>(thenShortcut: (value: number) => R | PromiseLike<R>): Promise<R>;
  count(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  distinct(): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  each(callback: (obj: T, cursor: { key: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>; primaryKey: TKey; }) => ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  eachKey(callback: (key: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>, cursor: { key: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>; primaryKey: TKey; }) => ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  eachPrimaryKey(callback: (key: TKey, cursor: { key: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>; primaryKey: TKey; }) => ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  eachUniqueKey(callback: (key: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>, cursor: { key: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>; primaryKey: TKey; }) => ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  filter(filter: (x: T) => boolean): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  first(): Promise<T>;
  first<R>(thenShortcut: (value: T) => R | PromiseLike<R>): Promise<R>;
  first(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  keys(): Promise<(string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][])[]>;
  keys<R>(thenShortcut: (value: (string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][])[]) => R | PromiseLike<R>): Promise<R>;
  keys(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  primaryKeys(): Promise<TKey[]>;
  primaryKeys<R>(thenShortcut: (value: TKey[]) => R | PromiseLike<R>): Promise<R>;
  primaryKeys(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  last(): Promise<T>;
  last<R>(thenShortcut: (value: T) => R | PromiseLike<R>): Promise<R>;
  last(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  limit(n: number): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  offset(n: number): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  or(indexOrPrimayKey: string): WhereClause<T, TKey> {
    throw new Error("Method not implemented.");
  }
  raw(): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  reverse(): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  sortBy(keyPath: string): Promise<T[]>;
  sortBy<R>(keyPath: string, thenShortcut: (value: T[]) => R | PromiseLike<R>): Promise<R>;
  sortBy(keyPath: any, thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  toArray(): Promise<T[]>;
  toArray<R>(thenShortcut: (value: T[]) => R | PromiseLike<R>): Promise<R>;
  toArray(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  uniqueKeys(): Promise<(string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][])[]>;
  uniqueKeys<R>(thenShortcut: (value: (string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][])[]) => R | PromiseLike<R>): Promise<R>;
  uniqueKeys(thenShortcut?: any) {
    throw new Error("Method not implemented.");
  }
  until(filter: (value: T) => boolean, includeStopEntry?: boolean): Collection<T, TKey> {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  modify(changeCallback: (obj: T, ctx: { value: T; }) => void): Promise<number>;
  modify(changes: { [keyPath: string]: any; }): Promise<number>;
  modify(changes: any) {
    throw new Error("Method not implemented.");
  }

}

export interface CollectionContext<T,TKey extends IndexableType> {
  table: Table<T,TKey>;
  index?: string | null;
  isPrimKey?: boolean;
  range: IDBKeyRange;
  keysOnly: boolean;
  dir: "next" | "prev";
  unique: "" | "unique";
  algorithm?: Function | null;
  filter?: Function | null;
  replayFilter: Function | null;
  justLimit: boolean; // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
  isMatch: Function | null;
  offset: number,
  limit: number,
  error: any, // If set, any promise must be rejected with this error
  or: Collection<T,TKey>,
  valueMapper: (any) => any
}

