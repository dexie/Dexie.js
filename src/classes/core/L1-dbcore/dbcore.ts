import { stringifyKey } from '../../../functions/stringify-key';
import { BloomFilter } from '../L8-expression/bloomfilter';

// For public interface

export type Key = any;

export interface KeyRange {
  readonly lower: Key | undefined;
  readonly lowerOpen?: boolean;
  readonly upper: Key | undefined;
  readonly upperOpen?: boolean;
  //includes (key: Key) : boolean;
}

/*export interface KeyRangeFactory {
  bound(lower: Key, upper: Key, lowerOpen?: boolean, upperOpen?: boolean): KeyRange;
  lowerBound(lower: Key, open?: boolean): KeyRange;
  upperBound(upper: Key, open?: boolean): KeyRange;
  only(key: Key): KeyRange;
}*/

/* TODO: Don't use stringifyKey. Use cmp. Need to remove this const and where it is called, do
   it another way! */
export const KeyRange = {
  isSingleValued({lower, upper}: KeyRange) {
    return lower !== undefined && upper !== undefined && stringifyKey(lower) === stringifyKey(upper);
  }
}


export interface Transaction {
  abort(): void;
}

export interface TransactionRequest {
  tables: string[];
  mode: 'readonly' | 'readwrite';
}

export interface InsertRequest {
  op: 'insert';
  trans: Transaction;
  table: string;
  values: any[];
  keys?: Key[];
}

export interface UpsertRequest {
  op: 'upsert';
  trans: Transaction;
  table: string;
  values: any[];
  keys?: Key[];
}

export interface WriteResponse {
  lastKey: Key;
  failures: WriteFailure[];
}

export interface WriteFailure {
  reason: Error;
  pos: number;
}

export interface DeleteRequest {
  trans: Transaction;
  table: string;
  keys: Key[];
}

export interface DeleteRangeRequest {
  trans: Transaction;
  table: string;
  range: KeyRange;
}

export interface GetRequest {
  trans: Transaction;
  table: string;
  keys: Key[];
}

export interface QueryBase {
  trans: Transaction;
  table: string;
  index?: string | null;
}

export interface GetAllQuery extends QueryBase {
  range?: KeyRange;
  values?: boolean;
  limit?: number;
}

export interface OpenCursorQuery extends QueryBase {
  range?: KeyRange;
  values?: boolean;
  unique?: boolean;
  reverse?: boolean;
}

export interface CountQuery extends QueryBase {
  range?: KeyRange;
}

export interface Cursor<TResult=any> {
  readonly key: Key;
  readonly primaryKey: Key;
  readonly value?: any;
  readonly done?: boolean;
  continue(key?: any): void;
  continuePrimaryKey(key: Key, primaryKey: Key): void;
  advance(count: number): void;
  start(onNext: ()=>void, key?: Key, primaryKey?: Key): Promise<TResult>
  stop(value?: TResult | Promise<TResult>): void;
  fail(error: Error): void;
}

export interface Schema {
  name: string;
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  primaryKey: IndexSchema;
  indexes: IndexSchema[];
}

export interface IndexSchema {
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

export interface DBCore {
  // Transaction and Object Store
  transaction(req: TransactionRequest): Transaction;

  // Mutating methods
  write(req: InsertRequest | UpsertRequest): Promise<WriteResponse>;
  delete(req: DeleteRequest): Promise<void>;
  deleteRange(req: DeleteRangeRequest): Promise<void>;

  // Query methods
  get(req: GetRequest): Promise<any[]>;
  getAll(query: GetAllQuery): Promise<any[]>;
  openCursor(query: OpenCursorQuery): Promise<Cursor | null>;
  count(query: CountQuery): Promise<number>;

  // Utility methods
  cmp(a: any, b: any) : number;
  rangeIncludes(range: KeyRange): (key: Key) => boolean;
  //comparer(table: string, index: string | null): (a: any, b: any) => number;
  readonly schema: Schema;
}
