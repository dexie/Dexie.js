import { Dexie } from '../dexie';
import { makeClassConstructor } from '../../functions/make-class-constructor';
import { Version } from './version';

export interface VersionConstructor {
  new(versionNumber: number): Version;
  prototype: Version;
}

/** Generates a Version constructor bound to given Dexie instance.
 * 
 * The purpose of having dynamically created constructors, is to allow
 * addons to extend classes for a certain Dexie instance without affecting
 * other db instances.
 */
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
    });

}
