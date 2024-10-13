import { Version as IVersion } from '../../public/types/version';
import { DbSchema } from '../../public/types/db-schema';
import { extend, keys } from '../../functions/utils';
import { Dexie } from '../dexie';
import { Transaction } from '../transaction';
import { removeTablesApi, setApiOnPlace, parseIndexSyntax } from './schema-helpers';
import { exceptions } from '../../errors';
import { createTableSchema } from '../../helpers/table-schema';
import { nop, promisableChain } from '../../functions/chaining-functions';
import { createYjsMiddleware } from '../../yjs/createYjsMiddleware';
import { getYLibrary } from '../../yjs/getYLibrary';

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

  _parseStoresSpec(
    stores: { [tableName: string]: string | null },
    outSchema: DbSchema
  ): any {
    keys(stores).forEach((tableName) => {
      if (stores[tableName] !== null) {
        let indexes = parseIndexSyntax(stores[tableName]);

        //
        // Support Y.js specific syntax
        //
        const yProps = indexes.filter((idx) => idx.type === 'Y').map((idx) => idx.name);
        indexes = indexes.filter((idx) => idx.type !== 'Y'); // Y marks just the Y.Doc type and is not an index
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
        const tblSchema = createTableSchema(
          tableName,
          primKey,
          indexes,
          yProps.length ? yProps : undefined
        );
        outSchema[tableName] = tblSchema;

        // Generate update tables for Y.js properties
        for (const yProp of tblSchema.yProps || []) {
          this._parseStoresSpec(
            // Add a table for each yProp containing document updates.
            // See interface YUpdateRow { i: number, k: IndexableType, u: Uint8Array, f?: number}
            // where
            //   i is the auto-incremented primary key of the update table,
            //   k is the primary key from the other table holding the document in a property.
            //   u is the update data from Y.js
            //   f is a flag indicating if the update comes from this client or another.
            // Index use cases:
            //   * Load entire document: Use index k
            //   * After object load, observe updates on a certain document since a given revision: Use index k or i since [k+i] is not supported before Firefox 126.
            //   * After initial sync, observe flagged updates since a given revision: Use index i and ignore unflagged.
            //     Could be using an index [f+i] but that wouldn't gain too much and Firefox before 126 doesnt support it.
            //     Local updates are flagged while remote updates are not.
            //      
            { [yProp.updatesTable]: '++i,k' },
            outSchema
          );
        }
      }
    });
  }

  stores(stores: { [key: string]: string | null }): IVersion {
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
    db._storeNames.forEach((tableName) => {
      if (dbschema[tableName].yProps) {
        // If a table as yProps, make sure to derive a class with generated Y properties.
        // This is done in the mapToClass method. In case user has called mapToClass already, respect mappedClass,
        // otherwise use Object as default to create a top-level class with the generated y properties.
        db.table(tableName).mapToClass(
          dbschema[tableName].mappedClass || Object
        );
      }
    });
    if (Object.values(dbschema).some((table) => table.yProps)) {
      db.use(createYjsMiddleware(dbschema, getYLibrary(db)));
    } else {
      db.unuse({ stack: 'dbcore', name: 'yjsMiddleware' });
    }
    return this;
  }

  upgrade(
    upgradeFunction: (trans: Transaction) => PromiseLike<any> | void
  ): Version {
    this._cfg.contentUpgrade = promisableChain(
      this._cfg.contentUpgrade || nop,
      upgradeFunction
    );
    return this;
  }
}
