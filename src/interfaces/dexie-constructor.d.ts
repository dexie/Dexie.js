import { Dexie } from "./dexie";
import { Transaction } from "./transaction";
import { ThenShortcut } from "../types/then-shortcut";
import { TableSchema } from "./table-schema";
import { IndexSpec } from "./index-spec";
import { ExceptionSet, DexieErrorConstructor, ModifyErrorConstructor, BulkErrorConstructor } from "../errors";

export interface DexieConstructor extends ExceptionSet {
  new(databaseName: string, options?: {
    addons?: Array<(db: Dexie) => void>,
    autoOpen?: boolean,
    indexedDB?: IDBFactory,
    IDBKeyRange?: {new(): IDBKeyRange}
  }) : Dexie;

  addons: Array<(db: Dexie) => void>;
  version: number;
  semVer: string;
  currentTransaction: Transaction;
  waitFor<T> (promise: PromiseLike<T> | T) : Promise<T>;
  waitFor<T> (promise: PromiseLike<T> | T, timeoutMilliseconds: number) : Promise<T>;

  getDatabaseNames(): Promise<string[]>;
  getDatabaseNames<R>(thenShortcut: ThenShortcut<string[],R>): Promise<R>;

  override<F> (origFunc:F, overridedFactory: (fn:any)=>any) : F; // ?
  getByKeyPath(obj: Object, keyPath: string): any;
  setByKeyPath(obj: Object, keyPath: string, value: any): void;
  delByKeyPath(obj: Object, keyPath: string): void;
  shallowClone<T> (obj: T): T;
  deepClone<T>(obj: T): T;
  asap(fn: Function) : void; //?
  maxKey: Array<Array<void>> | string;
  minKey: number;
  exists(dbName: string) : Promise<boolean>;
  delete(dbName: string): Promise<void>;
  dependencies: {
    indexedDB: IDBFactory,
    IDBKeyRange: IDBKeyRange
  };
  default: Dexie;

  Promise: PromiseConstructor; //?
  TableSchema: {new():TableSchema}; //?
  IndexSpec: {new():IndexSpec}; //?
  Events: any; // Too complex to define correctly right now. ??

  errnames: {[P in keyof ExceptionSet]: P};
  DexieError: DexieErrorConstructor;
  ModifyError: ModifyErrorConstructor;
  BulkError: BulkErrorConstructor;
}
