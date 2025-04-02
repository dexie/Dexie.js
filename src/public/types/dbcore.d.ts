// For public interface

import { ObservabilitySet } from "./db-events";
import {ChromeTransactionDurability} from "./dexie-constructor";

export const enum DBCoreRangeType {
  Equal = 1,
  Range = 2,
  Any = 3,
  Never = 4
}

export interface DBCoreKeyRange {
  readonly type: DBCoreRangeType;
  readonly lower: any;
  readonly lowerOpen?: boolean;
  readonly upper: any;
  readonly upperOpen?: boolean;
  //includes (key: Key) : boolean; Despite IDBKeyRange api - it's no good to have this as a method. Benefit from using a more functional approach.
}

export interface DBCoreTransaction {
  abort(): void;
}

interface DbCoreTransactionOptions {
  durability: ChromeTransactionDurability
}

export type DBCoreMutateRequest = DBCoreAddRequest | DBCorePutRequest | DBCoreDeleteRequest | DBCoreDeleteRangeRequest;

export interface DBCoreMutateResponse {
  numFailures: number,
  failures: {[operationNumber: number]: Error};
  lastResult: any;
  results?: any[]; // Always present on responses to AddRequest and PutRequest.
}

export interface DBCoreAddRequest {
  type: 'add';
  trans: DBCoreTransaction;
  values: readonly any[];
  keys?: any[];
  mutatedParts?: ObservabilitySet
  /** @deprecated Will always get results since 3.1.0-alpha.5 */
  wantResults?: boolean;
}

export interface DBCorePutRequest {
  type: 'put';
  trans: DBCoreTransaction;
  values: readonly any[];
  keys?: any[];
  mutatedParts?: ObservabilitySet
  criteria?: {
    index: string | null;
    range: DBCoreKeyRange;
  };
  changeSpec?: {[keyPath: string]: any}; // Common changeSpec for each key
  isAdditionalChunk?: boolean;
  updates?: {
    keys: any[],
    changeSpecs: {[keyPath: string]: any}[]; // changeSpec per key.  
  },
  /** @deprecated Will always get results since 3.1.0-alpha.5 */
  wantResults?: boolean;
}

export interface DBCoreDeleteRequest {
  type: 'delete';
  trans: DBCoreTransaction;
  keys: any[];
  mutatedParts?: ObservabilitySet
  criteria?: {
    index: string | null;
    range: DBCoreKeyRange;
  };
  isAdditionalChunk?: boolean;
}

export interface DBCoreDeleteRangeRequest {
  type: 'deleteRange';
  trans: DBCoreTransaction;
  range: DBCoreKeyRange;
  mutatedParts?: ObservabilitySet
}

export interface DBCoreGetManyRequest {
  trans: DBCoreTransaction;
  keys: any[];
  cache?: "immutable" | "clone"
  obsSet?: ObservabilitySet
}

export interface DBCoreGetRequest {
  trans: DBCoreTransaction;
  key: any;
  obsSet?: ObservabilitySet
}

export interface DBCoreQuery {
  index: DBCoreIndex;//keyPath: null | string | string[]; // null represents primary key. string a property, string[] several properties.
  range: DBCoreKeyRange;
}

export interface DBCoreQueryRequest {
  trans: DBCoreTransaction;
  values?: boolean;
  limit?: number;
  query: DBCoreQuery;
  obsSet?: ObservabilitySet

}

export interface DBCoreQueryResponse {
  result: any[];
}

export interface DBCoreOpenCursorRequest {
  trans: DBCoreTransaction;
  values?: boolean;
  unique?: boolean;
  reverse?: boolean;
  query: DBCoreQuery;
  obsSet?: ObservabilitySet
}

export interface DBCoreCountRequest {
  trans: DBCoreTransaction;
  query: DBCoreQuery;
  obsSet?: ObservabilitySet
}

export interface DBCoreCursor {
  readonly trans: DBCoreTransaction;
  readonly key: any;
  readonly primaryKey: any;
  readonly value?: any;
  readonly done?: boolean;
  continue(key?: any): void;
  continuePrimaryKey(key: any, primaryKey: any): void;
  advance(count: number): void;
  start(onNext: ()=>void): Promise<any>
  stop(value?: any | Promise<any>): void;
  next(): Promise<DBCoreCursor>;
  fail(error: Error): void;
}

export interface DBCoreSchema {
  name: string;
  tables: DBCoreTableSchema[];
}
export interface DBCoreTableSchema {
  readonly name: string;
  readonly primaryKey: DBCoreIndex;
  readonly indexes: DBCoreIndex[];
  readonly getIndexByKeyPath: (keyPath: null | string | string[]) => DBCoreIndex | undefined;
}

export interface DBCoreIndex {
  /** Name of the index, or null for primary key */
  readonly name: string | null;
  /** True if this index represents the primary key */
  readonly isPrimaryKey?: boolean;
  /** True if this index represents the primary key and is not inbound (https://dexie.org/docs/inbound) */
  readonly outbound?: boolean; 
  /** True if and only if keyPath is an array (https://dexie.org/docs/Compound-Index) */
  readonly compound?: boolean;
  /** keyPath, null for primary key, string for single-property indexes, Array<string> for compound indexes */
  readonly keyPath: null | string | string[];
  /** Auto-generated primary key (does not apply to secondary indexes) */
  readonly autoIncrement?: boolean;
  /** Whether index is unique. Also true if index is primary key. */
  readonly unique?: boolean;
  /** Whether index is multiEntry. */
  readonly multiEntry?: boolean;
  /** Extract (using keyPath) a key from given value (object). Null for outbound primary keys */
  readonly extractKey: ((value: any) => any) | null;
  /** If this index is a virtual index, lowLevelIndex represents the actual IndexedDB index behind it */
  readonly lowLevelIndex?: DBCoreIndex;
}
export interface DBCore {
  stack: "dbcore";
  // Transaction and Object Store
  transaction(stores: string[], mode: 'readonly' | 'readwrite', options?: DbCoreTransactionOptions): DBCoreTransaction;

  // Utility methods
  readonly MIN_KEY: any;
  readonly MAX_KEY: any;
  readonly schema: DBCoreSchema;
  table(name: string): DBCoreTable;
}

export interface DBCoreTable {
  readonly name: string;
  readonly schema: DBCoreTableSchema;

  mutate(req: DBCoreMutateRequest): Promise<DBCoreMutateResponse>;
  get(req: DBCoreGetRequest): Promise<any>;
  getMany(req: DBCoreGetManyRequest): Promise<any[]>;
  query(req: DBCoreQueryRequest): Promise<DBCoreQueryResponse>;
  openCursor(req: DBCoreOpenCursorRequest): Promise<DBCoreCursor | null>;
  count(req: DBCoreCountRequest): Promise<number>;
}

// Type aliases for backward compatibility against v3.0.0:
export type Key = any;
export type RangeType = DBCoreRangeType;
export type KeyRange = DBCoreKeyRange;
export type MutateRequest = DBCoreMutateRequest;
export type AddRequest = DBCoreAddRequest;
export type PutRequest = DBCorePutRequest;
export type DeleteRequest = DBCoreDeleteRequest;
export type DeleteRangeRequest = DBCoreDeleteRangeRequest;
export type MutateResponse = DBCoreMutateResponse;
export type DBCoreTransactionMode = 'readonly' | 'readwrite';
