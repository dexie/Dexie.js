import Promise from './promise';
import { Dexie } from '../classes/dexie/dexie';
import { Table } from '../public/types/table';
import { nop } from '../functions/chaining-functions';
import { PromiseExtended } from '../public/types/promise-extended';
import { DBNAMES_DB } from '../globals/constants';

export let databaseEnumerator: DatabaseEnumerator;

export interface DatabaseEnumerator {
  getDatabaseNames (): PromiseExtended<string[]>;
  add (name: string): undefined | PromiseExtended;
  remove (name: string): undefined | PromiseExtended;
}

export function DatabaseEnumerator (indexedDB: IDBFactory & {databases?: ()=>Promise<{name: string}[]>}) : DatabaseEnumerator {
  const hasDatabasesNative = indexedDB && typeof indexedDB.databases === 'function';
  let dbNamesTable: Table<{name: string}, string>;

  if (!hasDatabasesNative) {
    const db = new Dexie (DBNAMES_DB, {addons: []});
    db.version(1).stores({dbnames: 'name'});
    dbNamesTable = db.table<{name: string}, string>('dbnames');
  }

  return {
    getDatabaseNames () {
      return hasDatabasesNative
        ?
          // Use Promise.resolve() to wrap the native promise into a Dexie promise,
          // to keep PSD zone.
          Promise.resolve(indexedDB.databases()).then(infos => infos
            // Select name prop of infos:
            .map(info => info.name)
            // Filter out DBNAMES_DB as previous Dexie or browser version would not have included it in the result.
            .filter(name => name !== DBNAMES_DB)
          )
        :
          // Use dexie's manually maintained list of database names:
          dbNamesTable.toCollection().primaryKeys();
    },

    add (name: string) : PromiseExtended<any> | undefined {
      return !hasDatabasesNative && name !== DBNAMES_DB && dbNamesTable.put({name}).catch(nop);
    },

    remove (name: string) : PromiseExtended<any> | undefined {
      return !hasDatabasesNative && name !== DBNAMES_DB && dbNamesTable.delete(name).catch(nop);
    }
  };
}

export function initDatabaseEnumerator(indexedDB: IDBFactory) {
  try {
    databaseEnumerator = DatabaseEnumerator(indexedDB);
  } catch (e) {}
}

