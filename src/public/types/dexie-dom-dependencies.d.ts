import { IDBFactory, IDBKeyRangeConstructor } from "./indexeddb";

export interface DexieDOMDependencies {
  indexedDB: IDBFactory;
  IDBKeyRange: IDBKeyRangeConstructor;
}
