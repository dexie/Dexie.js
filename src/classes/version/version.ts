import { Version as IVersion } from '../../public/types/version';
import { DbSchema } from '../../public/types/db-schema';
import { extend, keys } from '../../functions/utils';
import { Dexie } from '../dexie';
import { Transaction } from '../transaction';
import { removeTablesApi, setApiOnPlace, parseIndexSyntax } from './schema-helpers';
import { exceptions } from '../../errors';
import { createTableSchema } from '../../helpers/table-schema';

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
    contentUpgrade: Function | null
  }

  _parseStoresSpec(stores: { [tableName: string]: string | null }, outSchema: DbSchema): any {
    keys(stores).forEach(tableName => {
      if (stores[tableName] !== null) {
          var indexes = parseIndexSyntax(stores[tableName]);
          var primKey = indexes.shift();
          if (primKey.multi) throw new exceptions.Schema("Primary key cannot be multi-valued");
          indexes.forEach(idx => {
              if (idx.auto) throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
              if (!idx.keyPath) throw new exceptions.Schema("Index must have a name and cannot be an empty string");
          });
          outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
      }
    });
  }

  stores(stores: { [key: string]: string | null; }): IVersion {
    const db = this.db;
    this._cfg.storesSource = this._cfg.storesSource ?
      extend(this._cfg.storesSource, stores) :
      stores;
    const versions = db._versions;

    // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
    const storesSpec: { [key: string]: string; } = {};
    let dbschema = {};
    versions.forEach(version => { // 'versions' is always sorted by lowest version first.
      extend(storesSpec, version._cfg.storesSource);
      dbschema = (version._cfg.dbschema = {});
      version._parseStoresSpec(storesSpec, dbschema);
    });
    // Update the latest schema to this version
    db._dbSchema = dbschema;
    // Update APIs
    removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
    setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
    db._storeNames = keys(dbschema);
    return this;
  }

  upgrade(upgradeFunction: (trans: Transaction) => PromiseLike<any> | void): Version {
    this._cfg.contentUpgrade = upgradeFunction;
    return this;
  }
}
