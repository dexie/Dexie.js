import { ExportOptions, ExportProgress, exportDB } from './export';
import { importDB, peakImportFile, ImportOptions, importInto, StaticImportOptions } from './import';
import { DexieExportJsonMeta } from './json-structure';
export { exportDB, ExportOptions, ExportProgress };
export { importDB, importInto, peakImportFile, ImportOptions, DexieExportJsonMeta };
declare module 'dexie' {
    interface Dexie {
        export(options?: ExportOptions): Promise<Blob>;
        import(blob: Blob, options?: ImportOptions): Promise<void>;
    }
    interface DexieConstructor {
        import(blob: Blob, options?: StaticImportOptions): Promise<Dexie>;
    }
}
declare const _default: () => never;
export default _default;
