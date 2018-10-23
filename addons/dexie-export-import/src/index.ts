import Dexie from 'dexie';
import { ExportOptions, exportDB } from './export';
import { importDB, ImportOptions, importInto } from './import';

export { exportDB, ExportOptions};
export { importDB, importInto, ImportOptions};

//
// Extend Dexie interface (typescript-wise)
//
declare module 'dexie' {
  // Extend methods on db
  interface Dexie {
    export(options?: ExportOptions): Promise<Blob>;
    import(blob: Blob, options?: ImportOptions): Promise<void>;
  }
}

//
// Extend Dexie interface (runtime wise)
//

Dexie.prototype.export = function (this: Dexie, options?: ExportOptions) {
  return exportDB(this, options);
}
Dexie.prototype.import = function (this: Dexie, blob: Blob, options?: ImportOptions) {
  return importInto(this, blob, options);
}

export default ()=>{
  throw new Error("This addon extends Dexie.prototype globally and does not have be included in Dexie constructor's addons options.")
};
