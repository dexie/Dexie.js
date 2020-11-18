import Dexie from 'dexie';
import { ExportOptions, exportDB } from './export';
import { importDB, peakImportFile, ImportOptions, importInto, StaticImportOptions } from './import';
import { DexieExportJsonMeta } from './json-structure';

export { exportDB, ExportOptions};
export { importDB, importInto, peakImportFile, ImportOptions, DexieExportJsonMeta};

//
// Extend Dexie interface (typescript-wise)
//
declare module 'dexie' {
  // Extend methods on db
  interface Dexie {
    export(options?: ExportOptions): Promise<Blob>;
    import(blob: Blob, options?: ImportOptions): Promise<void>;
  }
  interface DexieConstructor {
    import(blob: Blob, options?: StaticImportOptions): Promise<Dexie>;
  }
}

//
// Extend Dexie interface (runtime wise)
//

Dexie.prototype.export = function (this: Dexie, options?: ExportOptions) {
  return exportDB(this, options);
};
Dexie.prototype.import = function (this: Dexie, blob: Blob, options?: ImportOptions) {
  return importInto(this, blob, options);
};
Dexie.import = (blob: Blob, options?: StaticImportOptions) => importDB(blob, options);

export default ()=>{
  throw new Error("This addon extends Dexie.prototype globally and does not have be included in Dexie constructor's addons options.")
};
