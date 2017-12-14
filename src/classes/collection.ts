import { Collection as ICollection } from "../../api/collection";
import { WhereClause } from "./where-clause";
import { Dexie } from "./dexie";
import { Table } from "./table";
import { IDBValidKey } from "../../api/indexeddb";
import { PromiseExtended } from "../../api/promise-extended";
import { iter, isPlainKeyRange, getIndexOrStore, addReplayFilter, addFilter, addMatchFilter } from "../functions/collection-helpers";
import { IDBObjectStore, IDBCursor } from '../../api/indexeddb';
import { rejection } from "../Promise";
import { combine } from "../functions/combine";
import { extend, hasOwn, deepClone, getObjectDiff, keys, setByKeyPath, getByKeyPath, shallowClone, tryCatch } from "../utils";
import { eventRejectHandler, eventSuccessHandler, hookedEventRejectHandler, hookedEventSuccessHandler } from "../functions/event-wrappers";
import { hasGetAll } from "../globals/lazy-globals";
import { mirror, nop } from "../chaining-functions";
import { ModifyError } from "../errors";
import { hangsOnDeleteLargeKeyRange } from "../globals/constants";
import { ascending } from "../functions/compare-functions";
import { bulkDelete } from "../functions/bulk-delete";
import { ThenShortcut } from "../../api/then-shortcut";

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
    range: IDBKeyRange;
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

  _read(fn, cb?) {
    var ctx = this._ctx;
    return ctx.error ?
      ctx.table._trans(null, rejection.bind(null, ctx.error)) :
      ctx.table._idbstore('readonly', fn).then(cb);
  }

  _write(fn) {
    var ctx = this._ctx;
    return ctx.error ?
      ctx.table._trans(null, rejection.bind(null, ctx.error)) :
      ctx.table._idbstore('readwrite', fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
  }

  _addAlgorithm(fn) {
    var ctx = this._ctx;
    ctx.algorithm = combine(ctx.algorithm, fn);
  }

  _iterate(
    fn: (item, cursor: IDBCursor, advance: Function) => void,
    resolve,
    reject,
    idbstore: IDBObjectStore) {
    return iter(this._ctx, fn, resolve, reject, idbstore);
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
  each(fn: (obj, cursor: IDBCursor) => any): PromiseExtended<void> {
    var ctx = this._ctx;

    return this._read((resolve, reject, idbstore) => {
      iter(ctx, fn, resolve, reject, idbstore);
    });
  }

  /** Collection.count()
   * 
   * http://dexie.org/docs/Collection/Collection.count()
   * 
   **/
  count(cb?) {
    var ctx = this._ctx;

    if (isPlainKeyRange(ctx, true)) {
      // This is a plain key range. We can use the count() method if the index.
      return this._read(function (resolve, reject, idbstore) {
        var idx = getIndexOrStore(ctx, idbstore);
        var req = (ctx.range ? idx.count(ctx.range) : idx.count());
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = function (e) {
          resolve(Math.min(e.target.result, ctx.limit));
        };
      }, cb);
    } else {
      // Algorithms, filters or expressions are applied. Need to count manually.
      var count = 0;
      return this._read(function (resolve, reject, idbstore) {
        iter(ctx, function () { ++count; return false; }, function () { resolve(count); }, reject, idbstore);
      }, cb);
    }
  }

  /** Collection.sortBy()
   * 
   * http://dexie.org/docs/Collection/Collection.sortBy()
   * 
   **/
  sortBy(keyPath: string): PromiseExtended<any[]>;
  sortBy<R>(keyPath: string, thenShortcut: ThenShortcut<any[], R>) : PromiseExtended<R>;
  sortBy(keyPath: string, cb?: ThenShortcut<any[], any>) {
    /// <param name="keyPath" type="String"></param>
    var parts = keyPath.split('.').reverse(),
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
  toArray(cb?) {
    var ctx = this._ctx;
    return this._read(function (resolve, reject, idbstore) {
      if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
        // Special optimation if we could use IDBObjectStore.getAll() or
        // IDBKeyRange.getAll():
        var readingHook = ctx.table.hook.reading.fire;
        var idxOrStore = getIndexOrStore(ctx, idbstore);
        var req = ctx.limit < Infinity ?
          idxOrStore.getAll(ctx.range, ctx.limit) :
          idxOrStore.getAll(ctx.range);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = readingHook === mirror ?
          eventSuccessHandler(resolve) :
          eventSuccessHandler(res => {
            try { resolve(res.map(readingHook)); } catch (e) { reject(e); }
          });
      } else {
        // Getting array through a cursor.
        var a = [];
        iter(ctx, function (item) { a.push(item); }, function arrayComplete() {
          resolve(a);
        }, reject, idbstore);
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
    var ctx = this._ctx;
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
  primaryKeys(cb?) {
    var ctx = this._ctx;
    if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
      // Special optimation if we could use IDBObjectStore.getAllKeys() or
      // IDBKeyRange.getAllKeys():
      return this._read((resolve, reject, idbstore) => {
        var idxOrStore = getIndexOrStore(ctx, idbstore);
        var req = ctx.limit < Infinity ?
          idxOrStore.getAllKeys(ctx.range, ctx.limit) :
          idxOrStore.getAllKeys(ctx.range);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = eventSuccessHandler(resolve);
      }).then(cb);
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
    addFilter(this._ctx, function (cursor) {
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
  modify(changes) {
    var ctx = this._ctx,
      hook = ctx.table.hook,
      updatingHook = hook.updating.fire,
      deletingHook = hook.deleting.fire;

    return this._write((resolve, reject, idbstore, trans) => {
      var modifyer;
      if (typeof changes === 'function') {
        // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
        if (updatingHook === nop && deletingHook === nop) {
          // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
          modifyer = changes;
        } else {
          // People want to know exactly what is being modified or deleted.
          // Let modifyer be a proxy function that finds out what changes the caller is actually doing
          // and call the hooks accordingly!
          modifyer = function (item) {
            var origItem = deepClone(item); // Clone the item first so we can compare laters.
            if (changes.call(this, item, this) === false) return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
            if (!hasOwn(this, "value")) {
              // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
              deletingHook.call(this, this.primKey, item, trans);
            } else {
              // No deletion. Check what was changed
              var objectDiff = getObjectDiff(origItem, this.value);
              var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
              if (additionalChanges) {
                // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                item = this.value;
                keys(additionalChanges).forEach(function (keyPath) {
                  setByKeyPath(item, keyPath, additionalChanges[keyPath]);  // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                });
              }
            }
          };
        }
      } else if (updatingHook === nop) {
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
      } else {
        // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
        // allow it to add additional modifications to make.
        var origChanges = changes;
        changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
        modifyer = function (item) {
          var anythingModified = false;
          var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
          if (additionalChanges) extend(changes, additionalChanges);
          keys(changes).forEach(function (keyPath) {
            var val = changes[keyPath];
            if (getByKeyPath(item, keyPath) !== val) {
              setByKeyPath(item, keyPath, val);
              anythingModified = true;
            }
          });
          if (additionalChanges) changes = shallowClone(origChanges); // Restore original changes for next iteration
          return anythingModified;
        };
      }

      var count = 0;
      var successCount = 0;
      var iterationComplete = false;
      var failures = [];
      var failKeys = [];
      var currentKey = null;

      function modifyItem(item, cursor) {
        currentKey = cursor.primaryKey;
        var thisContext = {
          primKey: cursor.primaryKey,
          value: item,
          onsuccess: null,
          onerror: null
        };

        function onerror(e) {
          failures.push(e);
          failKeys.push(thisContext.primKey);
          checkFinished();
          return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
        }

        if (modifyer.call(thisContext, item, thisContext) !== false) { // If a callback explicitely returns false, do not perform the update!
          var bDelete = !hasOwn(thisContext, "value");
          ++count;
          tryCatch(function () {
            var req = (bDelete ? cursor.delete() : cursor.update(thisContext.value));
            req._hookCtx = thisContext;
            req.onerror = hookedEventRejectHandler(onerror);
            req.onsuccess = hookedEventSuccessHandler(function () {
              ++successCount;
              checkFinished();
            });
          }, onerror);
        } else if (thisContext.onsuccess) {
          // Hook will expect either onerror or onsuccess to always be called!
          thisContext.onsuccess(thisContext.value);
        }
      }

      function doReject(e?) {
        if (e) {
          failures.push(e);
          failKeys.push(currentKey);
        }
        return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
      }

      function checkFinished() {
        if (iterationComplete && successCount + failures.length === count) {
          if (failures.length > 0)
            doReject();
          else
            resolve(successCount);
        }
      }
      this.clone().raw()._iterate(modifyItem, function () {
        iterationComplete = true;
        checkFinished();
      }, doReject, idbstore);
    });
  }

  /** Collection.delete()
   * 
   * http://dexie.org/docs/Collection/Collection.delete()
   * 
   **/
  delete() {
    var ctx = this._ctx,
      range = ctx.range,
      deletingHook = ctx.table.hook.deleting.fire,
      hasDeleteHook = deletingHook !== nop;
    if (!hasDeleteHook &&
      isPlainKeyRange(ctx) &&
      ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || !range)) // if no range, we'll use clear().
    {
      // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
      // For chromium, this is the way most optimized version.
      // For IE/Edge, this could hang the indexedDB engine and make operating system instable
      // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
      return this._write((resolve, reject, idbstore) => {
        // Our API contract is to return a count of deleted items, so we have to count() before delete().
        var onerror = eventRejectHandler(reject),
          countReq = (range ? idbstore.count(range) : idbstore.count());
        countReq.onerror = onerror;
        countReq.onsuccess = () => {
          var count = countReq.result;
          tryCatch(() => {
            var delReq = (range ? idbstore.delete(range) : idbstore.clear());
            delReq.onerror = onerror;
            delReq.onsuccess = () => resolve(count);
          }, err => reject(err));
        };
      });
    }

    // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
    // Divide into chunks to not starve RAM.
    // If has delete hook, we will have to collect not just keys but also objects, so it will use
    // more memory and need lower chunk size.
    const CHUNKSIZE = hasDeleteHook ? 2000 : 10000;

    return this._write((resolve, reject, idbstore, trans) => {
      var totalCount = 0;
      // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
      var collection = this
        .clone({
          keysOnly: !ctx.isMatch && !hasDeleteHook
        }) // load just keys (unless filter() or and() or deleteHook has subscribers)
        .distinct() // In case multiEntry is used, never delete same key twice because resulting count
        // would become larger than actual delete count.
        .limit(CHUNKSIZE)
        .raw(); // Don't filter through reading-hooks (like mapped classes etc)

      var keysOrTuples = [];

      // We're gonna do things on as many chunks that are needed.
      // Use recursion of nextChunk function:
      const nextChunk = () => collection.each(hasDeleteHook ? (val, cursor) => {
        // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
        // so that the hook can be called with its values in bulkDelete().
        keysOrTuples.push([cursor.primaryKey, cursor.value]);
      } : (val, cursor) => {
        // No one subscribes to hook('deleting'). Collect only primary keys:
        keysOrTuples.push(cursor.primaryKey);
      }).then(() => {
        // Chromium deletes faster when doing it in sort order.
        hasDeleteHook ?
          keysOrTuples.sort((a, b) => ascending(a[0], b[0])) :
          keysOrTuples.sort(ascending);
        return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);

      }).then(() => {
        var count = keysOrTuples.length;
        totalCount += count;
        keysOrTuples = [];
        return count < CHUNKSIZE ? totalCount : nextChunk();
      });

      resolve(nextChunk());
    });
  }
}


