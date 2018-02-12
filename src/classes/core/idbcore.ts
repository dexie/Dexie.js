// For public interface

export type Key = any;

export interface KeyRange {
  readonly lower: Key;
  readonly lowerOpen: boolean;
  readonly upper: Key;
  readonly upperOpen: boolean;
}

export interface Transaction {
  mode: 'readonly' | 'readwrite';
  objectStoreNames: string;
  abort(): void;
  objectStore(name: string) : ObjectStore;
}

export interface ObjectStore {
  autoIncrement: boolean;
  keyPath: string | string[];
  name: string;
  transaction: Transaction;
}

export interface BulkResponse {
  lastKey: Key;
  failures: BulkFailure[];
}

export interface BulkFailure {
  reason: Error;
  pos: number;
}

export interface GetAllQuery {
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
}

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

export interface IDBCore {
  // Transaction and Object Store
  transaction(storeNames: string[], mode: 'readonly' | 'readwrite'): Transaction;

  // Mutating methods
  add (store: ObjectStore, values: any[], keys?: Key[]) : Promise<BulkResponse>;
  put (store: ObjectStore, values: any[], keys?: Key[]) : Promise<BulkResponse>;
  delete (store: ObjectStore, keys: (Key | KeyRange)[]) : Promise<void>;

  // Query methods
  get (store: ObjectStore, keys: Key[]): Promise<any[]>;
  getAll (store: ObjectStore, req: GetAllQuery) : Promise<any[]>;
  openCursor (store: ObjectStore, req: OpenCursorQuery) : void;

  // Utility methods
  cmp (a:any, b:any): number;
}
