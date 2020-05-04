import { Dexie } from '../../classes/dexie';
import { makeClassConstructor } from '../../functions/make-class-constructor';
import { Collection } from './collection';
import { WhereClause } from '../where-clause/where-clause';
import { AnyRange } from '../../dbcore/keyrange';
import { DBCoreKeyRange } from '../../public/types/dbcore';
import { mirror } from '../../functions/chaining-functions';

/** Constructs a Collection instance. */
export interface CollectionConstructor {
  new(whereClause?: WhereClause | null, keyRangeGenerator?: () => DBCoreKeyRange): Collection;
  prototype: Collection;
}

/** Generates a Collection constructor bound to given Dexie instance.
 * 
 * The purpose of having dynamically created constructors, is to allow
 * addons to extend classes for a certain Dexie instance without affecting
 * other db instances.
 */
export function createCollectionConstructor(db: Dexie) {
  return makeClassConstructor<CollectionConstructor>(
    Collection.prototype,

    function Collection(
      this: Collection,
      whereClause?: WhereClause | null,
      keyRangeGenerator?: () => DBCoreKeyRange)
    {
      this.db = db;
      let keyRange = AnyRange, error = null;
      if (keyRangeGenerator) try {
        keyRange = keyRangeGenerator();
      } catch (ex) {
        error = ex;
      }

      const whereCtx = whereClause._ctx;
      const table = whereCtx.table;
      const readingHook = table.hook.reading.fire;
      this._ctx = {
        table: table,
        index: whereCtx.index,
        isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
        range: keyRange,
        keysOnly: false,
        dir: "next",
        unique: "",
        algorithm: null,
        filter: null,
        replayFilter: null,
        justLimit: true, // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
        isMatch: null,
        offset: 0,
        limit: Infinity,
        error: error, // If set, any promise must be rejected with this error
        or: whereCtx.or,
        valueMapper: readingHook !== mirror ? readingHook : null
      };
    }
  );
}
