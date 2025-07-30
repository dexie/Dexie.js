import { Version as IVersion } from '../../public/types/version';
import { DbSchema } from '../../public/types/db-schema';
import { extend, keys } from '../../functions/utils';
import { Dexie } from '../dexie';
import { Transaction } from '../transaction';
import { removeTablesApi, setApiOnPlace, parseIndexSyntax } from './schema-helpers';
import { exceptions } from '../../errors';
import { createTableSchema } from '../../helpers/table-schema';
import { nop, promisableChain } from '../../functions/chaining-functions';
import { IndexSpec } from '../../public/types/index-spec';
import { TableSchema } from '../../public/types/table-schema';

/** class Version
 *
 * https://dexie.org/docs/Version/Version
 */
export class Version implements IVersion {
  db: Dexie;
  _cfg: {
    version: number;
    storesSource: { [tableName: string]: string | null };
    dbschema: DbSchema;
    tables: {};
    contentUpgrade: Function | null;
  };

  _createTableSchema(
    name: string,
    primKey: IndexSpec,
    indexes: IndexSpec[]
  ): TableSchema {
    return createTableSchema(name, primKey, indexes);
  }

  _parseIndexSyntax(primKeyAndIndexes: string): IndexSpec[] {
    return parseIndexSyntax(primKeyAndIndexes);
  }

  _parseStoresSpec(
    stores: { [tableName: string]: string | null },
    outSchema: DbSchema
  ): any {
    keys(stores).forEach((tableName) => {
      if (stores[tableName] !== null) {
        let indexes = this._parseIndexSyntax(stores[tableName]);

        const primKey = indexes.shift();
        if (!primKey) {
          // {table: ':Y'} not supported.
          throw new exceptions.Schema(
            'Invalid schema for table ' + tableName + ': ' + stores[tableName]
          );
        }

        primKey.unique = true;
        if (primKey.multi)
          throw new exceptions.Schema('Primary key cannot be multiEntry*');
        indexes.forEach((idx) => {
          if (idx.auto)
            throw new exceptions.Schema(
              'Only primary key can be marked as autoIncrement (++)'
            );
          if (!idx.keyPath)
            throw new exceptions.Schema(
              'Index must have a name and cannot be an empty string'
            );
        });
        const tblSchema = this._createTableSchema(
          tableName,
          primKey,
          indexes
        );
        outSchema[tableName] = tblSchema;
      }
    });
  }

  stores(stores: { [key: string]: string | null }): this {
    const db = this.db;
    this._cfg.storesSource = this._cfg.storesSource
      ? extend(this._cfg.storesSource, stores)
      : stores;
    const versions = db._versions;

    // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
    const storesSpec: { [key: string]: string } = {};
    let dbschema: DbSchema = {};
    versions.forEach((version) => {
      // 'versions' is always sorted by lowest version first.
      extend(storesSpec, version._cfg.storesSource);
      dbschema = version._cfg.dbschema = {};
      version._parseStoresSpec(storesSpec, dbschema);
    });
    // Update the latest schema to this version
    db._dbSchema = dbschema;
    // Update APIs
    removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
    setApiOnPlace(
      db,
      [db._allTables, db, db.Transaction.prototype, this._cfg.tables],
      keys(dbschema),
      dbschema
    );
    db._storeNames = keys(dbschema);
    return this;
  }

  upgrade(
    upgradeFunction: (trans: Transaction) => PromiseLike<any> | void
  ): this {
    this._cfg.contentUpgrade = promisableChain(
      this._cfg.contentUpgrade || nop,
      upgradeFunction
    );
    return this;
  }
}
