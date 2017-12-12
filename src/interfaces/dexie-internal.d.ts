import { Dexie } from "./dexie";
import { DexieOptions } from "./dexie-constructor";

export interface DbState {
  dbOpenError: any;
  isBeingOpened: boolean;
  onReadyBeingFired: boolean;
  openComplete: boolean;
  autoSchema: boolean;
}

export interface DbReadyPromises {
  dbReadyResolve: ()=>void;
  dbReadyPromise: Promise<any>;
  cancelOpen: ()=>void;
  openCanceller: Promise<any>;
}

export interface WebDependencies {
  indexedDB?: IDBFactory,
  IDBKeyRange?: {new(): IDBKeyRange}
}

export interface DexieInternal extends Dexie {
  _i: DbState & DbReadyPromises & DexieOptions & WebDependencies;
}
