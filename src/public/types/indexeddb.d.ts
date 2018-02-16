/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved. 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0  
 
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE, 
MERCHANTABLITY OR NON-INFRINGEMENT. 
 
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** 

Modified by David Fahlander (dexie.org) with corrections according to the
IndexedDB W3C standard, and specifically in respect of IndexedDB 2.0.

*/

export type IndexableTypePart =
string | number | Date | ArrayBuffer | ArrayBufferView | DataView | Array<Array<void>>;

export type IndexableTypeArray = Array<IndexableTypePart>;
export type IndexableTypeArrayReadonly = ReadonlyArray<IndexableTypePart>;
export type IDBValidKey = IndexableTypePart | IndexableTypeArrayReadonly;


export interface IDBCursor {
  readonly direction: IDBCursorDirection;
  key: IDBValidKey;
  readonly primaryKey: any;
  source: IDBObjectStore | IDBIndex;
  advance(count: number): void;
  continue(key?: IDBKeyRange | IDBValidKey): void;
  continuePrimaryKey(key: IDBKeyRange | IDBValidKey, primaryKey: IDBValidKey): void;
  delete(): IDBRequest;
  update(value: any): IDBRequest;
  readonly NEXT: string;
  readonly NEXT_NO_DUPLICATE: string;
  readonly PREV: string;
  readonly PREV_NO_DUPLICATE: string;
}

export interface IDBCursorWithValue extends IDBCursor {
  readonly value: any;
}

export interface IDBDatabaseEventMap {
  "abort": IDBEvent;
  "error": IDBEvent;
}

export interface IDBDatabase extends EventTarget {
  readonly name: string;
  readonly objectStoreNames: DOMStringList;
  onabort: (this: IDBDatabase, ev: IDBEvent) => any;
  onerror: (this: IDBDatabase, ev: IDBEvent) => any;
  version: number;
  onversionchange: (ev: IDBVersionChangeEvent) => any;
  close(): void;
  createObjectStore(name: string, optionalParameters?: IDBObjectStoreParameters): IDBObjectStore;
  deleteObjectStore(name: string): void;
  transaction(storeNames: string | string[], mode?: IDBTransactionMode): IDBTransaction;
  addEventListener(type: "versionchange", listener: (ev: IDBVersionChangeEvent) => any, useCapture?: boolean): void;
  addEventListener<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  removeEventListener<K extends keyof IDBDatabaseEventMap>(type: K, listener: (this: IDBDatabase, ev: IDBDatabaseEventMap[K]) => any, useCapture?: boolean): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

export interface IDBIndexParameters {
  multiEntry?: boolean;
  unique?: boolean;
}

export interface IDBObjectStoreParameters {
  autoIncrement?: boolean;
  keyPath?: IDBKeyPath | null;
}

export type IDBKeyPath = string | string[];

export interface IDBFactory {
  cmp(first: any, second: any): number;
  deleteDatabase(name: string): IDBOpenDBRequest;
  open(name: string, version?: number): IDBOpenDBRequest;
}

export interface IDBIndex {
  keyPath: string | string[];
  readonly name: string;
  readonly objectStore: IDBObjectStore;
  readonly unique: boolean;
  multiEntry: boolean;
  count(key?: IDBKeyRange | IDBValidKey): IDBRequest;
  get(key: IDBKeyRange | IDBValidKey): IDBRequest;
  getKey(key: IDBKeyRange | IDBValidKey): IDBRequest;
  getAll?(key?: IDBKeyRange | IDBValidKey, limit?: number): IDBRequest;
  getAllKeys?(key?: IDBKeyRange | IDBValidKey, limit?: number): IDBRequest;  
  openCursor(range?: IDBKeyRange | IDBValidKey, direction?: IDBCursorDirection): IDBRequest;
  openKeyCursor(range?: IDBKeyRange | IDBValidKey, direction?: IDBCursorDirection): IDBRequest;
}

export interface IDBKeyRange {
  readonly lower: any;
  readonly lowerOpen: boolean;
  readonly upper: any;
  readonly upperOpen: boolean;
}

export interface IDBKeyRangeConstructor {
  prototype: IDBKeyRange;
  new(): IDBKeyRange;
  bound(lower: any, upper: any, lowerOpen?: boolean, upperOpen?: boolean): IDBKeyRange;
  lowerBound(lower: any, open?: boolean): IDBKeyRange;
  only(value: any): IDBKeyRange;
  upperBound(upper: any, open?: boolean): IDBKeyRange;
}

export interface IDBObjectStore {
  readonly indexNames: DOMStringList;
  keyPath: string | string[];
  readonly name: string;
  readonly transaction: IDBTransaction;
  autoIncrement: boolean;
  add(value: any, key?: IDBValidKey): IDBRequest;
  clear(): IDBRequest;
  count(key?: IDBKeyRange | IDBValidKey): IDBRequest;
  createIndex(name: string, keyPath: string | string[], optionalParameters?: IDBIndexParameters): IDBIndex;
  delete(key: IDBKeyRange | IDBValidKey): IDBRequest;
  deleteIndex(indexName: string): void;
  get(key: any): IDBRequest;
  index(name: string): IDBIndex;
  openCursor(range?: IDBKeyRange | IDBValidKey, direction?: IDBCursorDirection): IDBRequest;
  openKeyCursor?(range?: IDBKeyRange | IDBValidKey, direction?: IDBCursorDirection): IDBRequest;
  put(value: any, key?: IDBValidKey): IDBRequest;
  getAll?(key?: IDBKeyRange | IDBValidKey, limit?: number): IDBRequest;
  getAllKeys?(key?: IDBKeyRange | IDBValidKey, limit?: number): IDBRequest;  
}

export interface IDBOpenDBRequestEventMap extends IDBRequestEventMap {
  "blocked": IDBEvent;
  "upgradeneeded": IDBVersionChangeEvent;
}

export interface IDBOpenDBRequest extends IDBRequest {
  onblocked: (this: IDBOpenDBRequest, ev: IDBEvent) => any;
  onupgradeneeded: (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) => any;
  addEventListener<K extends keyof IDBOpenDBRequestEventMap>(type: K, listener: (this: IDBOpenDBRequest, ev: IDBOpenDBRequestEventMap[K]) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  removeEventListener<K extends keyof IDBOpenDBRequestEventMap>(type: K, listener: (this: IDBOpenDBRequest, ev: IDBOpenDBRequestEventMap[K]) => any, useCapture?: boolean): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

export interface IDBRequestEventMap {
  "error": IDBEvent;
  "success": IDBEvent;
}

export interface IDBRequest extends EventTarget {
  readonly error: DOMException;
  onerror: (this: IDBRequest, ev: IDBEvent) => any;
  onsuccess: (this: IDBRequest, ev: IDBEvent) => any;
  readonly readyState: IDBRequestReadyState;
  readonly result: any;
  source: IDBObjectStore | IDBIndex | IDBCursor;
  readonly transaction: IDBTransaction;
  addEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest, ev: IDBRequestEventMap[K]) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  removeEventListener<K extends keyof IDBRequestEventMap>(type: K, listener: (this: IDBRequest, ev: IDBRequestEventMap[K]) => any, useCapture?: boolean): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

export interface IDBEvent extends Event {
  target: IDBRequest;
}

export interface IDBTransactionEventMap {
  "abort": IDBEvent;
  "complete": IDBEvent;
  "error": IDBEvent;
}

export interface IDBTransaction extends EventTarget {
  readonly db: IDBDatabase;
  readonly error: DOMException;
  readonly mode: IDBTransactionMode;
  onabort: (this: IDBTransaction, ev: IDBEvent) => any;
  oncomplete: (this: IDBTransaction, ev: IDBEvent) => any;
  onerror: (this: IDBTransaction, ev: IDBEvent) => any;
  abort(): void;
  objectStore(name: string): IDBObjectStore;
  readonly READ_ONLY: string;
  readonly READ_WRITE: string;
  readonly VERSION_CHANGE: string;
  addEventListener<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, useCapture?: boolean): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  removeEventListener<K extends keyof IDBTransactionEventMap>(type: K, listener: (this: IDBTransaction, ev: IDBTransactionEventMap[K]) => any, useCapture?: boolean): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
}

export interface IDBVersionChangeEvent extends IDBEvent {
  readonly newVersion: number | null;
  readonly oldVersion: number;
}
