import { Dexie } from './dexie';
import { makeClassConstructor } from './functions/make-class-constructor';
import { Collection } from './collection';
import { WhereClause } from './where-clause';

export interface CollectionConstructor {
  new(whereClause?: WhereClause | null, keyRangeGenerator?: () => IDBKeyRange): Collection;
  prototype: Collection;
}

export function createCollectionConstructor(db: Dexie) {
  return makeClassConstructor<CollectionConstructor>(
    Collection.prototype,

    function Collection(
      this: Collection,
      whereClause?: WhereClause | null,
      keyRangeGenerator?: () => IDBKeyRange)
    {
      this.db = db;
      let keyRange = null, error = null;
      if (keyRangeGenerator) try {
        keyRange = keyRangeGenerator();
      } catch (ex) {
        error = ex;
      }

      const whereCtx = whereClause._ctx;
      const table = whereCtx.table;
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
        valueMapper: table.hook.reading.fire
      };
    }
  );
}
