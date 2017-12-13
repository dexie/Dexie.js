import { Dexie } from "./dexie";
import { DexieOptions } from "./dexie-constructor";

export interface DbReadyState {
  dbOpenError: any;
  isBeingOpened: boolean;
  onReadyBeingFired: boolean;
  openComplete: boolean;
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
  _i: DbReadyState & DexieOptions & WebDependencies;
}
