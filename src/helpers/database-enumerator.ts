import { Dexie } from "../classes/dexie/dexie";
import { Table } from "../public/types/table";
import { DBNAMES_DB } from "../globals/constants";
import { DexieDOMDependencies } from "../public/types/dexie-dom-dependencies";
import { nop } from "../functions/chaining-functions";

type IDBKeyNamesVar = typeof IDBKeyRange;

function getDbNamesTable(indexedDB: IDBFactory, IDBKeyRange: IDBKeyNamesVar) {
  let dbNamesDB = indexedDB["_dbNamesDB"];
  if (!dbNamesDB) {
    dbNamesDB = indexedDB["_dbNamesDB"] = new Dexie(DBNAMES_DB, {
      addons: [],
      indexedDB,
      IDBKeyRange,
    });
    dbNamesDB.version(1).stores({ dbnames: "name" });
  }
  return dbNamesDB.table("dbnames") as Table<{ name: string }, string>;
}

function hasDatabasesNative(
  indexedDB: IDBFactory & { databases?: () => Promise<{ name: string }[]> }
): indexedDB is IDBFactory & { databases: () => Promise<{ name: string }[]> } {
  return indexedDB && typeof indexedDB.databases === "function";
}

export function getDatabaseNames({
  indexedDB,
  IDBKeyRange,
}: DexieDOMDependencies) {
  return hasDatabasesNative(indexedDB)
    ? Promise.resolve(indexedDB.databases()).then((infos) =>
        infos
          // Select name prop of infos:
          .map((info) => info.name)
          // Filter out DBNAMES_DB as previous Dexie or browser version would not have included it in the result.
          .filter((name) => name !== DBNAMES_DB)
      )
    : getDbNamesTable(indexedDB, IDBKeyRange).toCollection().primaryKeys();
}

export function _onDatabaseCreated(
  { indexedDB, IDBKeyRange }: DexieDOMDependencies,
  name: string
) {
  !hasDatabasesNative(indexedDB) &&
    name !== DBNAMES_DB &&
    getDbNamesTable(indexedDB, IDBKeyRange).put({name}).catch(nop);
}

export function _onDatabaseDeleted(
  { indexedDB, IDBKeyRange }: DexieDOMDependencies,
  name: string
) {
  !hasDatabasesNative(indexedDB) &&
    name !== DBNAMES_DB &&
    getDbNamesTable(indexedDB, IDBKeyRange).delete(name).catch(nop);
}
