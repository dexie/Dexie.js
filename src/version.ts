import { Version as IVersion } from './public/types/version';
import { DbSchema } from './public/types/db-schema';
import { extend, keys } from './functions/utils';
import { Dexie } from './dexie';
import { Transaction } from './transaction';
import { removeTablesApi, setApiOnPlace } from './functions/schema-helpers';

/** class Version
 * 
 * http://dexie.org/docs/Version/Version
 */
export class Version implements IVersion {
  db: Dexie;
  _cfg: {
    version: number,
    storesSource: { [tableName: string]: string | null },
    dbschema: DbSchema,
    tables: {},
    contentUpgrade: null
  }

  _parseStoresSpec(arg0: any, arg1: any): any {
    throw new Error("Method not implemented.");
  }

  stores(stores: { [key: string]: string; }): IVersion {
    const db = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
    const versions = db._versions;

    // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
    var storesSpec = {};
    versions.forEach(version => { // 'versions' is always sorted by lowest version first.
      extend(storesSpec, version._cfg.storesSource);
    });

    const dbschema = (this._cfg.dbschema = {});
    this._parseStoresSpec(storesSpec, dbschema);
    // Update the latest schema to this version
    db._dbSchema = dbschema;
    // Update APIs
    removeTablesApi(db, [db._allTables, db, Transaction.prototype]);
    setApiOnPlace(db, [db._allTables, db, Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
    db._storeNames = keys(dbschema);
    return this;
  }

  upgrade(fn: (trans: Transaction) => void): IVersion {
    throw new Error("Method not implemented.");
  }
}