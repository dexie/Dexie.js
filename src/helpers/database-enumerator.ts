import Promise from './promise';
import { slice } from '../functions/utils';
import { eventRejectHandler } from '../functions/event-wrappers';
import { Dexie } from '../classes/dexie/dexie';
import { Table } from '../public/types/table';
import { nop } from '../functions/chaining-functions';
import { PromiseExtended } from '../public/types/promise-extended';
import { DBNAMES_DB } from '../globals/constants';
import { _dexieOptions } from '../public/types/dexie-constructor';

export let databaseEnumerator: IDatabaseEnumerator;

export interface IDatabaseEnumerator {
  getDatabaseNames (): PromiseExtended<string[]>;
  add (name: string): undefined | PromiseExtended;
  remove (name: string): undefined | PromiseExtended;
}

export function databaseEnumeratorFactory (indexedDB: IDBFactory & {getDatabaseNames?, webkitGetDatabaseNames?}) : IDatabaseEnumerator {
  const getDatabaseNamesNative = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
  let db: Dexie | undefined;
  let dbNamesTable: Table<{name: string}, string>;
  
  if (!getDatabaseNamesNative) {
    const opts: _dexieOptions = { addons: [], indexedDB: indexedDB, _isDBNamesDB: true }
    db = new Dexie (DBNAMES_DB, opts);
    db.version(1).stores({dbnames: 'name'});
    dbNamesTable = db.table<{name: string}, string>('dbnames');
  }

  const returnVar: IDatabaseEnumerator = {
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
  if (!getDatabaseNamesNative){
    db._deps.databaseEnumerator = returnVar;
  }
  return returnVar;
}

export function setDatabaseEnumerator(indexedDB: IDBFactory) {
  try {
    databaseEnumerator = databaseEnumeratorFactory(indexedDB);
  } catch (e) {}
}

