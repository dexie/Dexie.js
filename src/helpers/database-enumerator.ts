import Promise from './promise';
import { slice } from '../functions/utils';
import { eventRejectHandler } from '../functions/event-wrappers';
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

export function DatabaseEnumerator (indexedDB: IDBFactory & {getDatabaseNames?, webkitGetDatabaseNames?}) : DatabaseEnumerator {
  const getDatabaseNamesNative = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
  let dbNamesTable: Table<{name: string}, string>;

  if (!getDatabaseNamesNative) {
    const db = new Dexie (DBNAMES_DB, {addons: []});
    db.version(1).stores({dbnames: 'name'});
    dbNamesTable = db.table<{name: string}, string>('dbnames');
  }

  return {
    getDatabaseNames () {
      return getDatabaseNamesNative ? new Promise((resolve, reject) => {
          const req = getDatabaseNamesNative.call(indexedDB);
          req.onsuccess = event => resolve(slice(event.target.result, 0))
          req.onerror = eventRejectHandler(reject);
      }) : dbNamesTable.toCollection().primaryKeys();
    },

    add (name: string) : PromiseExtended<any> | undefined {
      return !getDatabaseNamesNative && name !== DBNAMES_DB && dbNamesTable.put({name}).catch(nop);
    },

    remove (name: string) : PromiseExtended<any> | undefined {
      return !getDatabaseNamesNative && name !== DBNAMES_DB && dbNamesTable.delete(name).catch(nop);
    }
  };
}

export function initDatabaseEnumerator(indexedDB: IDBFactory) {
  try {
    databaseEnumerator = DatabaseEnumerator(indexedDB);
  } catch (e) {}
}

