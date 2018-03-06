import { stringifyKey } from '../../../functions/stringify-key';
import { BloomFilter } from '../L8-expression/bloomfilter';

// For public interface

export type Key = any;

export interface KeyRange {
  readonly lower: Key | undefined;
  readonly lowerOpen: boolean;
  readonly upper: Key | undefined;
  readonly upperOpen: boolean;
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

export interface KeyRangeQuery {
  trans: Transaction;
  table: string;
  index: string;
  limit?: number;
  want?: "primaryKeys" | "keys" | "values" | "keyPairs";
  unique?: boolean;
  reverse?: boolean;
  range: KeyRange;
}

export interface Cursor<TResult=any> {
  readonly key: Key;
  readonly primaryKey: Key;
  readonly value?: any;
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
  unique?: boolean;
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
  getAll(query: KeyRangeQuery): Promise<any[]>;
  openCursor(query: KeyRangeQuery): Promise<Cursor | null>;
  count(query: KeyRangeQuery): Promise<number>;

  // Utility methods
  cmp(a: any, b: any) : number;
  rangeIncludes(range: KeyRange): (key: Key) => boolean;
  //comparer(table: string, index: string | null): (a: any, b: any) => number;
  readonly schema: Schema;
}

/* TODO! Tänk om!

  1. Låt återigen add och put bli write()
  2. Splitta upp delete mellan delete och deleteRanges.
  3. Sammanfoga get, getAll och openCursor till en och samma subscribe-liknande metod.
  4. Låt cmp vara beroende av ett ObjectStore och ett optionellt (nullable) index namn så
     att man kan skapa ett middleware som gör skillnad 
  Summa summarum, encapsulering:
    Middleware för value- och key transformering bör troligen ligga på ganska hög nivå,
    alltså högre än expression-motorn, så förenklas expression-motorns ansvar.

    För att encapsulera värden,
      proxa write() 

    För att reviva värden, 
      proxa query och skicka in en proxy Observer som ändrar eventuella värden, detta
      ...utan att förstå sig på queryt!

    För att encapsulera keys
      write:
        values - getByKeyPath(), setByKeyPath()
        keys - as they are
      query:
        expression:
          keyrange: lower, upper
          anyOf: alla keys
          equals...: the key
          AND: rekursivt
          OR: rekursivt 
        ej: orderBy: den talar bara om vilket index den ska ordna efter.
        ej: pageToken för den är black-box för utsidan.

    För att reviva keys:
      query:
        observer:
          keys
          primaryKeys
          values


*/