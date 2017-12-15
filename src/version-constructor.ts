import { Dexie } from './dexie';
import { makeClassConstructor } from './functions/make-class-constructor';

export interface VersionConstructor {
  new () : Version;
  prototype: Version;
}

export function createVersionConstructor (db: Dexie) {
  return makeClassConstructor<VersionConstructor>(
    Version.prototype,
    function Version (this: Version) {

    });
}
