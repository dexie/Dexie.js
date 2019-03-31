import { IDatabaseEnumerator } from "../../helpers/database-enumerator";

export interface DexieDOMDependencies {
  indexedDB: IDBFactory;
  IDBKeyRange: typeof IDBKeyRange;
  databaseEnumerator: IDatabaseEnumerator;
}
