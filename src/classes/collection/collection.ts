import { Collection as ICollection } from "../../public/types/collection";
import { Dexie } from "../dexie";
import { Table } from "../table";
import { IndexableType, IndexableTypeArrayReadonly } from "../../public/types/indexable-type";
import { PromiseExtended } from "../../public/types/promise-extended";
import { iter, isPlainKeyRange, getIndexOrStore, addReplayFilter, addFilter, addMatchFilter } from "./collection-helpers";
import { rejection } from "../../helpers/promise";
import { combine } from "../../functions/combine";
import { extend, hasOwn, deepClone, keys, setByKeyPath, getByKeyPath } from "../../functions/utils";
import { ModifyError } from "../../errors";
import { hangsOnDeleteLargeKeyRange } from "../../globals/constants";
import { ThenShortcut } from "../../public/types/then-shortcut";
import { Transaction } from '../transaction';
import { DBCoreCursor, DBCoreTransaction, DBCoreRangeType, DBCoreMutateResponse, DBCoreKeyRange } from '../../public/types/dbcore';

/** class Collection
 * 
 * http://dexie.org/docs/Collection/Collection
 */
export class Collection implements ICollection {
  db: Dexie;
  _ctx: {
    table: Table;
    index?: string | null;
    isPrimKey?: boolean;
    range: DBCoreKeyRange;
    keysOnly: boolean;
    dir: "next" | "prev";
    unique: "" | "unique";
    algorithm?: Function | null;
    filter?: Function | null;
    replayFilter: Function | null;
    justLimit: boolean; // True if a replayFilter is just a filter that performs a "limit" operation (or none at all)
    isMatch: Function | null;
    offset: number,
    limit: number,
    error: any, // If set, any promise must be rejected with this error
    or: Collection,
    valueMapper: (any) => any
  }
  
  _ondirectionchange?: Function;

  _read<T>(fn: (idbtrans: IDBTransaction, dxTrans: Transaction) => PromiseLike<T>, cb?): PromiseExtended<T> {
    var ctx = this._ctx;
    return ctx.error ?
      ctx.table._trans(null, rejection.bind(null, ctx.error)) :
      ctx.table._trans('readonly', fn).then(cb);
  }

  _write<T>(fn: (idbtrans: IDBTransaction, dxTrans: Transaction) => PromiseLike<T>): PromiseExtended<T> {
    var ctx = this._ctx;
    return ctx.error ?
      ctx.table._trans(null, rejection.bind(null, ctx.error)) :
      ctx.table._trans('readwrite', fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
  }

  _addAlgorithm(fn) {
    var ctx = this._ctx;
    ctx.algorithm = combine(ctx.algorithm, fn);
  }

  _iterate(
    fn: (item, cursor: DBCoreCursor, advance: Function) => void,
    coreTrans: DBCoreTransaction) : Promise<any>
  {
    return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
  }

  /** Collection.clone()
   * 
   * http://dexie.org/docs/Collection/Collection.clone()
   * 
   **/
  clone(props?) {
    var rv = Object.create(this.constructor.prototype),
      ctx = Object.create(this._ctx);
    if (props) extend(ctx, props);
    rv._ctx = ctx;
    return rv;
  }

  /** Collection.raw()
   * 
   * http://dexie.org/docs/Collection/Collection.raw()
   * 
   **/
  raw() {
    this._ctx.valueMapper = null;
    return this;
  }

  /** Collection.each()
   * 
   * http://dexie.org/docs/Collection/Collection.each()
   * 
   **/
  each(fn: (obj, cursor: DBCoreCursor) => any): PromiseExtended<void> {
    var ctx = this._ctx;

    return this._read(trans => iter(ctx, fn, trans, ctx.table.core));
  }

  /** Collection.count()
   * 
   * http://dexie.org/docs/Collection/Collection.count()
   * 
   **/
  count(cb?) {
    return this._read(trans => {
      const ctx = this._ctx;
      const coreTable = ctx.table.core;
      if (isPlainKeyRange(ctx, true)) {
        // This is a plain key range. We can use the count() method if the index.
        return coreTable.count({
          trans,
          query: {
            index: getIndexOrStore(ctx, coreTable.schema),
            range: ctx.range
          }
        }).then(count => Math.min(count, ctx.limit));
      } else {
        // Algorithms, filters or expressions are applied. Need to count manually.
        var count = 0;
        return iter(ctx, () => { ++count; return false; }, trans, coreTable)
        .then(()=>count);
      }
    }).then(cb);
  }

  /** Collection.sortBy()
   * 
   * http://dexie.org/docs/Collection/Collection.sortBy()
   * 
   **/
  sortBy(keyPath: string): PromiseExtended<any[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<any[], R>) : PromiseExtended<R>;
  sortBy(keyPath: string, cb?: ThenShortcut<any[], any>) {
    const parts = keyPath.split('.').reverse(),
      lastPart = parts[0],
      lastIndex = parts.length - 1;
    function getval(obj, i) {
      if (i) return getval(obj[parts[i]], i - 1);
      return obj[lastPart];
    }
    var order = this._ctx.dir === "next" ? 1 : -1;

    function sorter(a, b) {
      var aVal = getval(a, lastIndex),
        bVal = getval(b, lastIndex);
      return aVal < bVal ? -order : aVal > bVal ? order : 0;
    }
    return this.toArray(function (a) {
      return a.sort(sorter);
    }).then(cb);
  }

  /** Collection.toArray()
   * 
   * http://dexie.org/docs/Collection/Collection.toArray()
   * 
   **/
  toArray(cb?): PromiseExtended<any[]> {
    return this._read(trans => {
      var ctx = this._ctx;
      if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
        // Special optimation if we could use IDBObjectStore.getAll() or
        // IDBKeyRange.getAll():
        const {valueMapper} = ctx;
        const index = getIndexOrStore(ctx, ctx.table.core.schema);
        return ctx.table.core.query({
          trans,
          limit: ctx.limit,
          values: true,
          query: {
            index,
            range: ctx.range
          }
        }).then(({result}) => valueMapper ? result.map(valueMapper) : result);
      } else {
        // Getting array through a cursor.
        const a = [];
        return iter(ctx, item => a.push(item), trans, ctx.table.core).then(()=>a);
      }
    }, cb);
  }

  /** Collection.offset()
   * 
   * http://dexie.org/docs/Collection/Collection.offset()
   * 
   **/
  offset(offset: number) : Collection{
    var ctx = this._ctx;
    if (offset <= 0) return this;
    ctx.offset += offset; // For count()
    if (isPlainKeyRange(ctx)) {
      addReplayFilter(ctx, () => {
        var offsetLeft = offset;
        return (cursor, advance) => {
          if (offsetLeft === 0) return true;
          if (offsetLeft === 1) { --offsetLeft; return false; }
          advance(() => {
            cursor.advance(offsetLeft);
            offsetLeft = 0;
          });
          return false;
        };
      });
    } else {
      addReplayFilter(ctx, () => {
        var offsetLeft = offset;
        return () => (--offsetLeft < 0);
      });
    }
    return this;
  }

  /** Collection.limit()
   * 
   * http://dexie.org/docs/Collection/Collection.limit()
   * 
   **/
  limit(numRows: number) : Collection {
    this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
    addReplayFilter(this._ctx, () => {
      var rowsLeft = numRows;
      return function (cursor, advance, resolve) {
        if (--rowsLeft <= 0) advance(resolve); // Stop after this item has been included
        return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
      };
    }, true);
    return this;
  }

  /** Collection.until()
   * 
   * http://dexie.org/docs/Collection/Collection.until()
   * 
   **/
  until(filterFunction: (x) => boolean, bIncludeStopEntry?) {
    addFilter(this._ctx, function (cursor, advance, resolve) {
      if (filterFunction(cursor.value)) {
        advance(resolve);
        return bIncludeStopEntry;
      } else {
        return true;
      }
    });
    return this;
  }

  /** Collection.first()
   * 
   * http://dexie.org/docs/Collection/Collection.first()
   * 
   **/
  first(cb?) {
    return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
  }

  /** Collection.last()
   * 
   * http://dexie.org/docs/Collection/Collection.last()
   * 
   **/
  last(cb?) {
    return this.reverse().first(cb);
  }

  /** Collection.filter()
   * 
   * http://dexie.org/docs/Collection/Collection.filter()
   * 
   **/
  filter(filterFunction: (x) => boolean): Collection {
    /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
    addFilter(this._ctx, function (cursor) {
      return filterFunction(cursor.value);
    });
    // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
    // collection for a match without querying DB. Used by Dexie.Observable.
    addMatchFilter(this._ctx, filterFunction);
    return this;
  }

  /** Collection.and()
   * 
   * http://dexie.org/docs/Collection/Collection.and()
   * 
   **/
  and(filter: (x) => boolean) {
    return this.filter(filter);
  }

  /** Collection.or()
   * 
   * http://dexie.org/docs/Collection/Collection.or()
   * 
   **/
  or(indexName: string) {
    return new this.db.WhereClause(this._ctx.table, indexName, this);
  }

  /** Collection.reverse()
   * 
   * http://dexie.org/docs/Collection/Collection.reverse()
   * 
   **/
  reverse() {
    this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
    if (this._ondirectionchange) this._ondirectionchange(this._ctx.dir);
    return this;
  }

  /** Collection.desc()
   * 
   * http://dexie.org/docs/Collection/Collection.desc()
   * 
   **/
  desc() {
    return this.reverse();
  }

  /** Collection.eachKey()
   * 
   * http://dexie.org/docs/Collection/Collection.eachKey()
   * 
   **/
  eachKey(cb?) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    return this.each(function (val, cursor) { cb(cursor.key, cursor); });
  }

  /** Collection.eachUniqueKey()
   * 
   * http://dexie.org/docs/Collection/Collection.eachUniqueKey()
   * 
   **/
  eachUniqueKey(cb?) {
    this._ctx.unique = "unique";
    return this.eachKey(cb);
  }

  /** Collection.eachPrimaryKey()
   * 
   * http://dexie.org/docs/Collection/Collection.eachPrimaryKey()
   * 
   **/
  eachPrimaryKey(cb?) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
  }

  /** Collection.keys()
   * 
   * http://dexie.org/docs/Collection/Collection.keys()
   * 
   **/
  keys(cb?) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    var a = [];
    return this.each(function (item, cursor) {
      a.push(cursor.key);
    }).then(function () {
      return a;
    }).then(cb);
  }

  /** Collection.primaryKeys()
   * 
   * http://dexie.org/docs/Collection/Collection.primaryKeys()
   * 
   **/
  primaryKeys(cb?) : PromiseExtended<IndexableType[]> {
    var ctx = this._ctx;
    if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
      // Special optimation if we could use IDBObjectStore.getAllKeys() or
      // IDBKeyRange.getAllKeys():
      return this._read(trans => {
        var index = getIndexOrStore(ctx, ctx.table.core.schema);
        return ctx.table.core.query({
          trans,
          values: false,
          limit: ctx.limit,
          query: {
            index,
            range: ctx.range
          }});
      }).then(({result})=>result).then(cb);
    }
    ctx.keysOnly = !ctx.isMatch;
    var a = [];
    return this.each(function (item, cursor) {
      a.push(cursor.primaryKey);
    }).then(function () {
      return a;
    }).then(cb);
  }

  /** Collection.uniqueKeys()
   * 
   * http://dexie.org/docs/Collection/Collection.uniqueKeys()
   * 
   **/
  uniqueKeys(cb?) {
    this._ctx.unique = "unique";
    return this.keys(cb);
  }

  /** Collection.firstKey()
   * 
   * http://dexie.org/docs/Collection/Collection.firstKey()
   * 
   **/
  firstKey(cb?) {
    return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
  }

  /** Collection.lastKey()
   * 
   * http://dexie.org/docs/Collection/Collection.lastKey()
   * 
   **/
  lastKey(cb?) {
    return this.reverse().firstKey(cb);
  }

  /** Collection.distinct()
   * 
   * http://dexie.org/docs/Collection/Collection.distinct()
   * 
   **/
  distinct() {
    var ctx = this._ctx,
      idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
    if (!idx || !idx.multi) return this; // distinct() only makes differencies on multiEntry indexes.
    var set = {};
    addFilter(this._ctx, function (cursor: DBCoreCursor) {
      var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
      var found = hasOwn(set, strKey);
      set[strKey] = true;
      return !found;
    });
    return this;
  }

  //
  // Methods that mutate storage
  //

  /** Collection.modify()
   * 
   * http://dexie.org/docs/Collection/Collection.modify()
   * 
   **/
  modify(changes: { [keyPath: string]: any }) : PromiseExtended<number>
  modify(changes: (obj: any, ctx:{value: any, primKey: IndexableType}) => void | boolean): PromiseExtended<number> {
    var ctx = this._ctx;
    return this._write(trans => {
      var modifyer: (obj: any, ctx:{value: any, primKey: IndexableType}) => void | boolean
      if (typeof changes === 'function') {
        // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
        modifyer = changes;
      } else {
        // changes is a set of {keyPath: value} and no one is listening to the updating hook.
        var keyPaths = keys(changes);
        var numKeys = keyPaths.length;
        modifyer = function (item) {
          var anythingModified = false;
          for (var i = 0; i < numKeys; ++i) {
            var keyPath = keyPaths[i], val = changes[keyPath];
            if (getByKeyPath(item, keyPath) !== val) {
              setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
              anythingModified = true;
            }
          }
          return anythingModified;
        };
      }

      const coreTable = ctx.table.core;
      const {outbound, extractKey} = coreTable.schema.primaryKey;
      const limit = this.db._options.modifyChunkSize || 200;
      const {cmp} = this.db.core;
      const totalFailures = [];
      let successCount = 0;
      const failedKeys: IndexableType[] = [];
      const applyMutateResult = (expectedCount: number, res: DBCoreMutateResponse) => {
        const {failures, numFailures} = res;
        successCount += expectedCount - numFailures;
        for (let pos of keys(failures)) {
          totalFailures.push(failures[pos]);
        }
      }
      return this.clone().primaryKeys().then(keys => {

        const nextChunk = (offset: number) => {
          const count = Math.min(limit, keys.length - offset);
          return coreTable.getMany({
            trans,
            keys: keys.slice(offset, offset + count),
            cache: "immutable" // Optimize for 2 things:
            // 1) observability-middleware can track changes better.
            // 2) hooks middleware don't have to query the existing values again when tracking changes.
            // We can use "immutable" because we promise to not touch the values we retrieve here!
          }).then(values => {
            const addValues = [];
            const putValues = [];
            const putKeys = outbound ? [] : null;
            const deleteKeys = [];
            for (let i=0; i<count; ++i) {
              const origValue = values[i];
              const ctx = {
                value: deepClone(origValue),
                primKey: keys[offset+i]
              };
              if (modifyer.call(ctx, ctx.value, ctx) !== false) {
                if (ctx.value == null) {
                  // Deleted
                  deleteKeys.push(keys[offset+i]);
                } else if (!outbound && cmp(extractKey(origValue), extractKey(ctx.value)) !== 0) {
                  // Changed primary key of inbound
                  deleteKeys.push(keys[offset+i]);
                  addValues.push(ctx.value)
                } else {
                  // Changed value
                  putValues.push(ctx.value);
                  if (outbound) putKeys.push(keys[offset+i]);
                }
              }
            }
            
            return Promise.resolve(addValues.length > 0 &&
              coreTable.mutate({trans, type: 'add', values: addValues})
                .then(res => {
                  for (let pos in res.failures) {
                    // Remove from deleteKeys the key of the object that failed to change its primary key
                    deleteKeys.splice(parseInt(pos), 1);
                  }
                  applyMutateResult(addValues.length, res);
                })
            ).then(()=>putValues.length > 0 &&
                coreTable.mutate({trans, type: 'put', keys: putKeys, values: putValues})
                  .then(res=>applyMutateResult(putValues.length, res))
            ).then(()=>deleteKeys.length > 0 &&
                coreTable.mutate({trans, type: 'delete', keys: deleteKeys})
                  .then(res=>applyMutateResult(deleteKeys.length, res))
            ).then(()=>{
              return keys.length > offset + count && nextChunk(offset + limit);
            });
          });
        }

        return nextChunk(0).then(()=>{
          if (totalFailures.length > 0)
            throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys as IndexableTypeArrayReadonly);

          return keys.length;
        });
      });

    });
  }

  /** Collection.delete()
   * 
   * http://dexie.org/docs/Collection/Collection.delete()
   * 
   **/
  delete() : PromiseExtended<number> {
    var ctx = this._ctx,
      range = ctx.range;
      //deletingHook = ctx.table.hook.deleting.fire,
      //hasDeleteHook = deletingHook !== nop;
    if (isPlainKeyRange(ctx) &&
      ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || range.type === DBCoreRangeType.Any)) // if no range, we'll use clear().
    {
      // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
      // For chromium, this is the way most optimized version.
      // For IE/Edge, this could hang the indexedDB engine and make operating system instable
      // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
      return this._write(trans => {
        // Our API contract is to return a count of deleted items, so we have to count() before delete().
        const {primaryKey} = ctx.table.core.schema;
        const coreRange = range;
        return ctx.table.core.count({trans, query: {index: primaryKey, range: coreRange}}).then(count => {
          return ctx.table.core.mutate({trans, type: 'deleteRange', range: coreRange})
          .then(({failures, lastResult, results, numFailures}) => {
            if (numFailures) throw new ModifyError("Could not delete some values",
              Object.keys(failures).map(pos => failures[pos]),
              count - numFailures);
            return count - numFailures;
          });
        });
      });
    }

    return this.modify((value, ctx) => ctx.value = null);
  }
}


