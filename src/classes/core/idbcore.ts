// For public interface

export type Key = any;

export interface KeyRange {
  readonly lower: Key;
  readonly lowerOpen: boolean;
  readonly upper: Key;
  readonly upperOpen: boolean;
}

export interface Transaction {
  abort(): void;
}

export interface TransactionRequest {
  tables: string[];
  mode: 'readonly' | 'readwrite';
}

/*export interface GetAllQuery {
  index: string | null;
  range: KeyRange;
  limit: number;
  wantKeys?: boolean;
}

export interface OpenCursorQuery {
  index: string | null;
  range: KeyRange;
  reverse?: boolean;
  unique?: boolean;
  wantKeysOnly?: boolean;
  observer: CursorObserver;
}*/

export interface CursorObserver {
  onInitCursor?(cursor: Cursor);
  onNext(cursor: Cursor);
  onError(e: Error);
  onDone();
}

export interface Cursor {
  readonly direction: string;
  readonly key: Key;
  readonly primaryKey: Key;
  readonly value?: any;
  continue(key?: any): void;
  continuePrimaryKey(key: Key, primaryKey: Key): void;
  advance(count: number): void;
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

export interface RangeQuery {
  trans: Transaction;
  table: string;
  index: string;
  range: KeyRange;
  limit?: number;
  wantKeys?: boolean; // ignored for count()
  unique?: boolean; // incompatible with getAll() and count()
  reverse?: boolean; // incompatible with getAll(). Ignored for count().
}

export type Schema = {
  [tableName: string]: {
    name: string;
    primKey: {
      keyPath: string | Array<string>;
      auto?: boolean;
      compound?: boolean;
    };
    indexes: Array<{
      name: string;
      keyPath: string | Array<string>;
      unique?: boolean;
      multi?: boolean;
      compound?: boolean;
    }>;
    idxByName: {
      [name: string]: {
        name?: string;
        keyPath?: string | Array<string>
        unique?: boolean;
        multi?: boolean;
        auto?: boolean;
        compound?: boolean;
      }
    };
    readHook?: (x: any) => any
  }
};

export interface IDBCore {
  // Transaction and Object Store
  transaction(req: TransactionRequest): Transaction;

  // Mutating methods
  write(req: InsertRequest | UpsertRequest): Promise<WriteResponse>;
  delete(req: DeleteRequest): Promise<void>;
  deleteRange(req: DeleteRangeRequest): Promise<void>;

  // Query methods
  get(req: GetRequest): Promise<any[]>;
  getAll(query: RangeQuery): Promise<any[]>;
  openCursor(query: RangeQuery, observer: CursorObserver): void;
  count(query: RangeQuery): Promise<number>;

  // Utility methods
  comparer(table: string, index: string | null): (a: any, b: any) => number;
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