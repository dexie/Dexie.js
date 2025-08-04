import { DbSchema, Dexie, ExtendableVersion, IndexSpec, TableSchema } from 'dexie';
import { createYjsMiddleware } from './createYjsMiddleware';
import { createYDocProperty } from './createYDocProperty';
import { periodicGC } from './periodicGC';

const YJS_MIDDLEWARE_NAME = 'yjsMiddleware';

export interface YDexieOptions {
  gc?: boolean; // Enable or disable garbage collection for Y.js documents.
}

export { compressYDocs } from './compressYDocs';
export { DexieYProvider } from './DexieYProvider';
export * from './types';

export default function yDexie(dbOrOptions: Dexie | YDexieOptions) {
  // This function is a placeholder for the y-dexie addon.
  // It can be used to initialize or configure the addon as needed.
  if (!('transaction' in dbOrOptions)) {
    // If db is an options object, create a configured yDexie addon that
    // could be passed to the addons array of Dexie constructor.
    const options = dbOrOptions;
    // Return a configured Dexie addon function.
    return (db: Dexie) => configurableYDexie(db, options);
  } else {
    // If db is a Dexie instance, it is being called as an addon.
    // Do default configuration.
    return configurableYDexie(dbOrOptions, {});
  }
}

function configurableYDexie(db: Dexie, options: YDexieOptions) {
  db.Table = class Table extends (db.Table as (new() => Dexie.Table<any>)) {
    mapToClass(constructor: Function) {
      if (this.schema.yProps) {
        constructor = class extends (constructor as any) {};
        this.schema.yProps.forEach(({prop, updatesTable}) => {
          Object.defineProperty(constructor.prototype, prop, createYDocProperty(db, this, prop, updatesTable));
        });
      }
      const result = super.mapToClass(constructor);
      this.schema.mappedClass = constructor; // Also done in super.mapToClass but we need to set the user-provided class, not our altered class.
      return result;
    }
  };

  db.Version = class Version extends (db.Version as (new() => ExtendableVersion)) {
    _createTableSchema(
      name: string,
      primKey: IndexSpec,
      indexes: IndexSpec[]
    ): TableSchema {
      const yProps = indexes.filter(
        (idx) => idx.type === 'Y' || idx.type === 'Y.Doc'
      );
      indexes = indexes.filter((idx) => !yProps.includes(idx)); // Y marks just the Y.Doc type and is not an index
      const tableSchema = super._createTableSchema(
        name,
        primKey,
        indexes
      ) as TableSchema;
      if (yProps.length > 0) {
        tableSchema.yProps = yProps.map((idx) => ({
          prop: idx.name,
          updatesTable: `$${name}.${idx.name}_updates`,
        }));
      }
      return tableSchema;
    }

    _parseStoresSpec(
      stores: { [tableName: string]: string | null },
      outSchema: DbSchema
    ): void {
      // Implementation for parsing stores spec
      // This is a placeholder; actual implementation would go here
      super._parseStoresSpec(stores, outSchema);

      // Generate update tables for Y.js properties
      Object.keys(stores).forEach((tableName) => {
        const tblSchema = outSchema[tableName];
        if (tblSchema) {
          for (const yProp of tblSchema.yProps || []) {
            super._parseStoresSpec(
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

    stores(schema: { [tableName: string]: string | null }) {
      const db = this.db as Dexie;
      // This method is used to define the schema for the database.
      // It allows you to specify the tables and their indexes.
      const result = super.stores(schema);
      const dbschema = db._dbSchema;
      Object.keys(dbschema).forEach((tableName) => {
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
        db.use({
          stack: 'dbcore',
          name: YJS_MIDDLEWARE_NAME,
          level: 50,
          create: createYjsMiddleware(dbschema),
        });
      } else {
        db.unuse({ stack: 'dbcore', name: YJS_MIDDLEWARE_NAME });
      }

      return result;
    }
  };

  if (options?.gc !== false) {
    periodicGC(db);
  }
}
