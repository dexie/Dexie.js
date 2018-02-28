import { stringifyKey } from '../../../functions/stringify-key';

// For public interface

export type Key = any;

export interface KeyRange {
  readonly lower: Key | undefined;
  readonly lowerOpen: boolean;
  readonly upper: Key | undefined;
  readonly upperOpen: boolean;
}

export const KeyRange = {
  only (key: Key): KeyRange {
    return {lower: key, upper: key, lowerOpen: false, upperOpen: false};
  },
  whatever (): KeyRange {
    return {lower: undefined, upper: undefined, lowerOpen: false, upperOpen: false};
  },
  isSingleValued({lower, upper}: KeyRange) {
    return lower !== undefined && upper !== undefined && stringifyKey(lower) === stringifyKey(upper);
  }
  /*never(): KeyRange {// ??? IndexedDB will through for this. Need to check for it.
    return {lower: Infinity, upper: Infinity, lowerOpen: true, upperOpen: true};
  }*/
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

export interface Cursor {
  readonly key: Key;
  readonly primaryKey: Key;
  readonly value?: any;
  continue(key?: any): void;
  continuePrimaryKey(key: Key, primaryKey: Key): void;
  advance(count: number): void;
  close(): void;
  fail(error: Error): void;
}

export interface OpenCursorResponse {
  cursor: Cursor;
  iterate(onNext: ()=>void): Promise<void>
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
  openCursor(query: KeyRangeQuery): Promise<OpenCursorResponse>;
  count(query: KeyRangeQuery): Promise<number>;

  // Utility methods
  cmp(a: any, b: any) : number;
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