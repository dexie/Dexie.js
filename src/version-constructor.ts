import { Dexie } from './dexie';
import { makeClassConstructor } from './functions/make-class-constructor';
import { Version } from './version';

export interface VersionConstructor {
  new(versionNumber: number): Version;
  prototype: Version;
}

export function createVersionConstructor(db: Dexie) {
  return makeClassConstructor<VersionConstructor>(
    Version.prototype,

    function Version(this: Version, versionNumber: number) {
      this.db = db;
      this._cfg = {
        version: versionNumber,
        storesSource: null,
        dbschema: {},
        tables: {},
        contentUpgrade: null
      };
      this.stores({}); // Derive earlier schemas by default.
    });

}
