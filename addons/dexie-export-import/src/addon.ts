import Dexie from "dexie";
import { exportDB, ExportOptions } from "./export";
import { ImportOptions, importInto } from "./import";


export default function dexieExportImportAddon (db: Dexie) {
  db.export = function (this: Dexie, options) {
    return exportDB(this, options);
  }
  db.import = function (this: Dexie, blob, options) {
    return importInto(blob, this, options);
  }
}
