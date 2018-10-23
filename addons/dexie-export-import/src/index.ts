import { ExportOptions } from './export';
import { ImportOptions } from './import';

export {exportDB, ExportOptions} from './export';
export {importDB, importInto, ImportOptions} from './import';

//
// Extend Dexie interface
//
declare module 'dexie' {
  // Extend methods on db
  interface Dexie {
    export(options?: ExportOptions): Promise<Blob>;
    import(blob: Blob, options?: ImportOptions): Promise<void>;
  }
}

export * from './addon';
