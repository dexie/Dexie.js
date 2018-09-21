// For public interface

export type Key = any;

export const enum RangeType {
  Equal = 1,
  Range = 2,
  Any = 3,
  Never = 4
}

export interface KeyRange {
  readonly type: RangeType;
  readonly lower: Key | undefined;
  readonly lowerOpen?: boolean;
  readonly upper: Key | undefined;
  readonly upperOpen?: boolean;
  //includes (key: Key) : boolean; Despite IDBKeyRange api - it's no good to have this as a method. Benefit from using a more functional approach.
}

export interface DBCoreTransaction {
  abort(): void;
}

export interface DBCoreTransactionRequest {
  tables: string[];
  mode: 'readonly' | 'readwrite';
}

export interface DBCoreInsertRequest {
  op: 'insert';
  trans: DBCoreTransaction;
  table: string;
  values: any[];
  keys?: Key[];
}

export interface DBCoreUpsertRequest {
  op: 'upsert';
  trans: DBCoreTransaction;
  table: string;
  values: any[];
  keys?: Key[];
}

export interface DBCoreWriteResponse {
  lastKey: Key;
  failures: DBCoreWriteFailure[];
}

export interface DBCoreWriteFailure {
  reason: Error;
  pos: number;
}

export interface DBCDeleteRequest {
  trans: DBCoreTransaction;
  table: string;
  keys: Key[];
}

export interface DBCoreDeleteRangeRequest {
  trans: DBCoreTransaction;
  table: string;
  range: KeyRange;
}

export interface DBCoreGetRequest {
  trans: DBCoreTransaction;
  table: string;
  keys: Key[];
}

export interface DBCoreQueryBase {
  trans: DBCoreTransaction;
  table: string;
  index?: string | null;
}

export interface DBCoreQueryRequest<TQuery=KeyRange> extends DBCoreQueryBase {
  query: TQuery;
  values?: boolean;
  limit?: number;
}

export interface DBCoreQueryResponse {
  result: any[];
}

export interface DBCoreOpenCursorRequest<TQuery=KeyRange> extends DBCoreQueryBase {
  query: TQuery;
  values?: boolean;
  unique?: boolean;
  reverse?: boolean;
}

export interface DBCoreCountRequest<TQuery=KeyRange> extends DBCoreQueryBase {
  query: TQuery;
}

export interface DBCoreCursor<TResult=any> {
  readonly trans: DBCoreTransaction;
  readonly key: Key;
  readonly primaryKey: Key;
  readonly value?: any;
  readonly done?: boolean;
  continue(key?: any): void;
  continuePrimaryKey(key: Key, primaryKey: Key): void;
  advance(count: number): void;
  start(onNext: ()=>void): Promise<TResult>
  stop(value?: TResult | Promise<TResult>): void;
  next(): Promise<DBCoreCursor>;
  fail(error: Error): void;
}

export interface DBCoreSchema {
  name: string;
  tables: DBCoreTableSchema[];
}

export interface DBCoreTableSchema {
  name: string;
  primaryKey: DBCoreIndexSchema;
  indexes: DBCoreIndexSchema[];
}

export interface DBCoreIndexSchema {
  isPrimaryKey?: boolean;
  /** True if and only if keyPath is an array */
  compound?: boolean;
  /** Name of the index, or null for primary key */
  name: string | null;
  /** KeyPath, or undefined for outbound primary keys. */
  keyPath?: string | string[];
  /** Auto-generated primary key (does not apply to secondary indexes) */
  autoIncrement?: boolean;
  /** Whether index is unique. Also true if index is primary key. */
  unique?: boolean;
  /** Whether index is multiEntry. */
  multiEntry?: boolean;
}

export interface DBCore<TQuery=KeyRange> {
  // Transaction and Object Store
  transaction(req: DBCoreTransactionRequest): DBCoreTransaction;

  // Mutating methods
  write(req: DBCoreInsertRequest | DBCoreUpsertRequest): Promise<DBCoreWriteResponse>;
  delete(req: DBCDeleteRequest): Promise<void>;
  deleteRange(req: DBCoreDeleteRangeRequest): Promise<void>;

  // Query methods
  get(req: DBCoreGetRequest): Promise<any[]>;
  query(req: DBCoreQueryRequest<TQuery>): Promise<DBCoreQueryResponse>;
  openCursor(req: DBCoreOpenCursorRequest<TQuery>): Promise<DBCoreCursor | null>;
  count(req: DBCoreCountRequest<TQuery>): Promise<number>;

  // Utility methods
  cmp(a: any, b: any) : number;
  //rangeIncludes(range: KeyRange): (key: Key) => boolean;
  //comparer(table: string, index: string | null): (a: any, b: any) => number;
  readonly schema: DBCoreSchema;
}
