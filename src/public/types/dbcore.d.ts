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
  mode: DBCoreTransactionMode;
}

export type DBCoreTransactionMode = 'readonly' | 'readwrite';

export type MutateRequest = AddRequest | PutRequest | DeleteRequest | DeleteRangeRequest;

export interface MutateResponse {
  numFailures: number,
  failures: {[operationNumber: number]: Error};
  lastResult: Key;
  results?: Key[]; // Present on AddRequest and PutRequest if request.wantResults is truthy.
}

export interface AddRequest {
  type: 'add';
  trans: DBCoreTransaction;
  values: any[];
  keys?: Key[];
  wantResults?: boolean;
}

export interface PutRequest {
  type: 'put';
  trans: DBCoreTransaction;
  values: any[];
  keys?: Key[];
  wantResults?: boolean;
}

export interface DeleteRequest {
  type: 'delete';
  trans: DBCoreTransaction;
  keys: Key[];
}

export interface DeleteRangeRequest {
  type: 'deleteRange';
  trans: DBCoreTransaction;
  range: KeyRange;
}

export interface DBCoreGetManyRequest {
  trans: DBCoreTransaction;
  keys: Key[];
}

export interface DBCoreGetRequest {
  trans: DBCoreTransaction;
  key: Key;  
}

export interface DBCoreQuery {
  index: DBCoreIndex;//keyPath: null | string | string[]; // null represents primary key. string a property, string[] several properties.
  range: KeyRange;
}

export interface DBCoreQueryRequest<TQuery=DBCoreQuery> {
  trans: DBCoreTransaction;
  values?: boolean;
  limit?: number;
  query: TQuery;
}

export interface DBCoreQueryResponse {
  result: any[];
}

export interface DBCoreOpenCursorRequest<TQuery=DBCoreQuery> {
  trans: DBCoreTransaction;
  values?: boolean;
  unique?: boolean;
  reverse?: boolean;
  query: TQuery;
}

export interface DBCoreCountRequest<TQuery=DBCoreQuery> {
  trans: DBCoreTransaction;
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
  /** True if this index represents the primary key and is not inbound (http://dexie.org/docs/inbound) */
  readonly outbound?: boolean; 
  /** True if and only if keyPath is an array (http://dexie.org/docs/Compound-Index) */
  readonly compound?: boolean;
  /** keyPath, null for primary key, string for single-property indexes, Array<string> for compound indexes */
  readonly keyPath: null | string | string[];
  /** Auto-generated primary key (does not apply to secondary indexes) */
  readonly autoIncrement?: boolean;
  /** Whether index is unique. Also true if index is primary key. */
  readonly unique?: boolean;
  /** Whether index is multiEntry. */
  readonly multiEntry?: boolean;
  /** Extract (using keyPath) a key from given value (object) */
  readonly extractKey: (value: any) => Key;
}

export interface DBCore<TQuery=DBCoreQuery> {
  stack: "dbcore";
  // Transaction and Object Store
  transaction(req: DBCoreTransactionRequest): DBCoreTransaction;

  // Utility methods
  cmp(a: any, b: any) : number;
  //rangeIncludes(range: KeyRange): (key: Key) => boolean;
  //comparer(table: string, index: string | null): (a: any, b: any) => number;
  //readonly schema: DBCoreSchema;
  readonly MIN_KEY: Key;
  readonly MAX_KEY: Key;
  readonly schema: DBCoreSchema;
  table(name: string): DBCoreTable<TQuery>;
}

export interface DBCoreTable<TQuery=DBCoreQuery> {
  readonly name: string;
  readonly schema: DBCoreTableSchema;

  mutate(req: MutateRequest): Promise<MutateResponse>;
  get(req: DBCoreGetRequest): Promise<any>;
  getMany(req: DBCoreGetManyRequest): Promise<any[]>;
  query(req: DBCoreQueryRequest<TQuery>): Promise<DBCoreQueryResponse>;
  openCursor(req: DBCoreOpenCursorRequest<TQuery>): Promise<DBCoreCursor | null>;
  count(req: DBCoreCountRequest<TQuery>): Promise<number>;
}
