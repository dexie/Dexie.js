import { IDBObjectStore } from '../interfaces/indexed-db';
import { IndexableType } from '../types/indexable-type';
import { ModifyError, BulkError, errnames, exceptions, fullNameExceptions, mapError } from '../errors';
import { Table } from '../interfaces/table';
import { TableSchema } from '../interfaces/table-schema';
import { TableHooks } from '../interfaces/table-hooks';
import { PSD, newScope, wrap, rejection } from '../Promise';
import Events from '../Events';
import { hookCreatingChain, nop, pureFunctionChain, mirror, hookUpdatingChain, hookDeletingChain } from '../chaining-functions';
import { TransactionImpl } from './transaction-impl';
import { DexieImpl } from './dexie-impl';
import { tempTransaction } from '../functions/temp-transaction';
import { eventRejectHandler, hookedEventRejectHandler, hookedEventSuccessHandler, BulkErrorHandlerCatchAll, eventSuccessHandler } from '../functions/event-wrappers';
import { WhereClauseImpl } from './where-clause-impl';
import { CollectionImpl } from './collection-impl';
import { isArray, keys, getByKeyPath, hasOwn, setByKeyPath, deepClone, tryCatch, arrayToObject } from '../utils';
import { maxKey, maxString } from '../globals/constants';
import { combine } from '../functions/combine';
import Promise from "../interfaces/promise-extended";

export class TableImpl<T, TKey extends IndexableType> implements Table<T, TKey> {
  _tx?: TransactionImpl;
  _db: DexieImpl;
  name: string;
  schema: TableSchema;
  hook: TableHooks<T, TKey>;

  constructor(db: DexieImpl, name: string, tableSchema: TableSchema, optionalTrans?: TransactionImpl) {
    this._tx = optionalTrans;
    this._db = db;
    this.name = name;
    this.schema = tableSchema;
    this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
      "creating": [hookCreatingChain, nop],
      "reading": [pureFunctionChain, mirror],
      "updating": [hookUpdatingChain, nop],
      "deleting": [hookDeletingChain, nop]
    }) as TableHooks<T, TKey>;
  }

  private _trans(mode: IDBTransactionMode, fn, writeLocked?: boolean | string) {
    var trans = this._tx || PSD.trans;
    return trans && trans.db === this._db ?
      trans === PSD.trans ?
        trans._promise(mode, fn, writeLocked) :
        newScope(() => trans._promise(mode, fn, writeLocked), { trans: trans, transless: PSD.transless || PSD }) :
      tempTransaction(this._db, mode, [this.name], fn);
  }

  private _idbstore(
    mode: IDBTransactionMode,
    fn: (
      resolve,
      reject,
      idbstore: IDBObjectStore,
      trans: TransactionImpl) => any,
    writeLocked?: boolean | string) {
    var tableName = this.name;
    function supplyIdbStore(resolve, reject, trans) {
      if (trans.storeNames.indexOf(tableName) === -1)
        throw new exceptions.NotFound("Table" + tableName + " not part of transaction");
      return fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
    }
    return this._trans(mode, supplyIdbStore, writeLocked);
  }

  /** Table.get()
   * 
   * http://dexie.org/docs/Table/Table.get()
   * 
   **/
  get(key: TKey): Promise<T>;
  get<R>(key: TKey, thenShortcut: (value: T) => R | PromiseLike<R>): Promise<R>;
  get(equalityCriterias: { [key: string]: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>; }): Promise<T>;
  get<R>(equalityCriterias: { [key: string]: string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][] | ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>; }, thenShortcut: (value: T) => R | PromiseLike<R>): Promise<R>;
  get(keyOrCrit: any, cb?: any) {
    if (keyOrCrit && keyOrCrit.constructor === Object)
      return this.where(keyOrCrit as { [key: string]: IndexableType }).first(cb);

    return this._idbstore('readonly', (resolve, reject, idbstore) => {
      const req = idbstore.get(keyOrCrit);
      req.onerror = eventRejectHandler(reject);
      req.onsuccess = wrap(() => {
        resolve(this.hook.reading.fire(req.result));
      }, reject);
    }).then(cb);
  }

  /** Table.where()
   * 
   * http://dexie.org/docs/Table/Table.where()
   * 
   **/
  where(index: string | string[]): WhereClauseImpl<T, TKey>;
  where(equalityCriterias: { [key: string]: IndexableType }): CollectionImpl<T, TKey>;
  where(indexOrCrit: any) {
    if (typeof indexOrCrit === 'string')
      return new WhereClauseImpl(this, indexOrCrit);
    if (isArray(indexOrCrit))
      return new WhereClauseImpl(this, `[${indexOrCrit.join('+')}]`);
    // indexOrCrit is an object map of {[keyPath]:value} 
    const keyPaths = keys(indexOrCrit);
    if (keyPaths.length === 1)
      // Only one critera. This was the easy case:
      return this
        .where(keyPaths[0])
        .equals(indexOrCrit[keyPaths[0]]);

    // Multiple criterias.
    // Let's try finding a compound index that matches all keyPaths in
    // arbritary order:
    const compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(ix =>
      ix.compound &&
      keyPaths.every(keyPath => ix.keyPath.indexOf(keyPath) >= 0) &&
      (ix.keyPath as string[]).every(keyPath => keyPaths.indexOf(keyPath) >= 0))[0];

    if (compoundIndex && maxKey !== maxString)
      // Cool! We found such compound index
      // and this browser supports compound indexes (maxKey !== maxString)!
      return this
        .where(compoundIndex.name)
        .equals((compoundIndex.keyPath as string[]).map(kp => indexOrCrit[kp]));

    if (!compoundIndex) console.warn(
      `The query ${JSON.stringify(indexOrCrit)} on ${this.name} would benefit of a ` +
      `compound index [${keyPaths.join('+')}]`);

    // Ok, now let's fallback to finding at least one matching index
    // and filter the rest.
    const { idxByName } = this.schema;
    const simpleIndex = keyPaths.reduce((r, keyPath) => [
      r[0] || idxByName[keyPath],
      r[0] || !idxByName[keyPath] ?
        combine(
          r[1],
          x => '' + getByKeyPath(x, keyPath) === // BUGBUG: Binary Keys may fail
            '' + indexOrCrit[keyPath])
        : r[1]
    ], [null, null]);

    const idx = simpleIndex[0];
    return idx ?
      this.where(idx.name).equals(indexOrCrit[idx.keyPath])
        .filter(simpleIndex[1]) :
      compoundIndex ?
        this.filter(simpleIndex[1]) : // Has compound but browser bad. Allow filter.
        this.where(keyPaths).equals(''); // No index at all. Fail lazily.
  }

  /** Table.filter()
   * 
   * http://dexie.org/docs/Table/Table.filter()
   * 
   **/
  filter(filterFunction: (obj: T) => boolean) {
    return this.toCollection().and(filterFunction);
  }

  /** Table.count()
   * 
   * http://dexie.org/docs/Table/Table.count()
   * 
   **/
  count(): Promise<number>;
  count<R>(thenShortcut: (value: number) => R | PromiseLike<R>): Promise<R>;
  count(thenShortcut?: any) {
    return this.toCollection().count(thenShortcut);
  }

  /** Table.offset()
   * 
   * http://dexie.org/docs/Table/Table.offset()
   * 
   **/
  offset(offset: number) {
    return this.toCollection().offset(offset);
  }

  /** Table.limit()
   * 
   * http://dexie.org/docs/Table/Table.limit()
   * 
   **/
  limit(numRows: number) {
    return this.toCollection().limit(numRows);
  }

  /** Table.each()
   * 
   * http://dexie.org/docs/Table/Table.each()
   * 
   **/
  each(callback: (obj: T, cursor: { key: IndexableType, primaryKey: TKey }) => any) {
    return this.toCollection().each(callback);
  }

  /** Table.toArray()
   * 
   * http://dexie.org/docs/Table/Table.toArray()
   * 
   **/
  toArray(): Promise<T[]>;
  toArray<R>(thenShortcut: (value: T[]) => R | PromiseLike<R>): Promise<R>;
  toArray(thenShortcut?: any) {
    return this.toCollection().toArray(thenShortcut);
  }

  /** Table.toCollection()
   * 
   * http://dexie.org/docs/Table/Table.toCollection()
   * 
   **/
  toCollection() {
    return new CollectionImpl<T, TKey>(new WhereClauseImpl<T, TKey>(this));
  }

  /** Table.orderBy()
   * 
   * http://dexie.org/docs/Table/Table.orderBy()
   * 
   **/
  orderBy(index: string | string[]) {
    return new CollectionImpl<T, TKey>(
      new WhereClauseImpl<T, TKey>(this, isArray(index) ?
        `[${index.join('+')}]` :
        index));
  }

  /** Table.reverse()
   * 
   * http://dexie.org/docs/Table/Table.reverse()
   * 
   **/
  reverse(): CollectionImpl<T, TKey> {
    return this.toCollection().reverse();
  }

  /** Table.mapToClass()
   * 
   * http://dexie.org/docs/Table/Table.mapToClass()
   * 
   **/
  mapToClass(constructor: Function) {
    this.schema.mappedClass = constructor;
    // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
    // no matter which method to use for reading (Table.get() or Table.where(...)... )
    const readHook = obj => {
      if (!obj) return obj; // No valid object. (Value is null). Return as is.
      // Create a new object that derives from constructor:
      const res = Object.create(constructor.prototype);
      // Clone members:
      for (var m in obj) if (hasOwn(obj, m)) try { res[m] = obj[m]; } catch (_) { }
      return res;
    };

    if (this.schema.readHook) {
      this.hook.reading.unsubscribe(this.schema.readHook);
    }
    this.schema.readHook = readHook;
    this.hook("reading", readHook);
    return constructor;
  }

  /** Table.add()
   * 
   * http://dexie.org/docs/Table/Table.add()
   * 
   **/
  add(obj: T, key?: TKey) {
    const creatingHook = this.hook.creating.fire;
    return this._idbstore('readwrite', (resolve, reject, idbstore, trans) => {
      const hookCtx = { onsuccess: null, onerror: null };
      if (creatingHook !== nop) {
        const effectiveKey = (key != null) ? key : (idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined);
        const keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
        if (effectiveKey == null && keyToUse != null) { // Using "==" and "!=" to check for either null or undefined!
          if (idbstore.keyPath)
            setByKeyPath(obj, idbstore.keyPath, keyToUse);
          else
            key = keyToUse;
        }
      }
      try {
        const req = (key != null ?
          idbstore.add(obj, key) :
          idbstore.add(obj)
        ) as IDBRequest & { _hookCtx?};

        req._hookCtx = hookCtx;
        req.onerror = hookedEventRejectHandler(reject);
        req.onsuccess = hookedEventSuccessHandler(result => {
          // TODO: Remove these two lines in next major release (3.0?)
          // It's no good practice to have side effects on provided parameters
          const keyPath = idbstore.keyPath;
          if (keyPath) setByKeyPath(obj, keyPath, result);
          resolve(result);
        });
      } catch (e) {
        if (hookCtx.onerror) hookCtx.onerror(e);
        throw e;
      }
    });
  }

  /** Table.update()
   * 
   * http://dexie.org/docs/Table/Table.update()
   * 
   **/
  update(keyOrObject: TKey | T, modifications: { [keyPath: string]: any; }): Promise<number> {
    if (typeof modifications !== 'object' || isArray(modifications))
      throw new exceptions.InvalidArgument("Modifications must be an object.");
    if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
      // object to modify. Also modify given object with the modifications:
      keys(modifications).forEach(keyPath => {
        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
      });
      const key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
      if (key === undefined) return rejection(new exceptions.InvalidArgument(
        "Given object does not contain its primary key"));
      return this.where(":id").equals(key).modify(modifications);
    } else {
      // key to modify
      return this.where(":id").equals(keyOrObject).modify(modifications);
    }
  }

  /** Table.put()
   * 
   * http://dexie.org/docs/Table/Table.put()
   * 
   **/
  put(obj: T, key?: TKey): Promise<TKey> {
    const creatingHook = this.hook.creating.fire,
      updatingHook = this.hook.updating.fire;
    if (creatingHook !== nop || updatingHook !== nop) {
      //
      // People listens to when("creating") or when("updating") events!
      // We must know whether the put operation results in an CREATE or UPDATE.
      //
      const keyPath = this.schema.primKey.keyPath;
      const effectiveKey = (key !== undefined) ? key : (keyPath && getByKeyPath(obj, keyPath));
      if (effectiveKey == null)  // "== null" means checking for either null or undefined.
        return this.add(obj);

      // Since key is optional, make sure we get it from obj if not provided

      // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
      // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
      obj = deepClone(obj);
      return this._trans('readwrite', () =>
        this.where(":id").equals(effectiveKey).modify(function (this: { value: T }) {
          // Replace extisting value with our object
          // CRUD event firing handled in Collection.modify()
          this.value = obj;
        }).then(count => count === 0 ? this.add(obj, key) : effectiveKey),
        "locked"); // Lock needed because operation is splitted into modify() and add().
    } else {
      // Use the standard IDB put() method.
      return this._idbstore('readwrite', (resolve, reject, idbstore) => {
        const req = key !== undefined ?
          idbstore.put(obj, key) :
          idbstore.put(obj);

        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(function (ev) {
          const keyPath = idbstore.keyPath;
          if (keyPath) setByKeyPath(obj, keyPath, ev.target.result);
          resolve(req.result);
        });
      });
    }
  }

  /** Table.delete()
   * 
   * http://dexie.org/docs/Table/Table.delete()
   * 
   **/
  delete(key: TKey) {
    if (this.hook.deleting.subscribers.length) {
      // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
      // call the CRUD event. Only Collection.delete() will know whether an object was actually deleted.
      return this.where(":id").equals(key).delete();
    } else {
      // No one listens. Use standard IDB delete() method.
      return this._idbstore('readwrite', function (resolve, reject, idbstore) {
        const req = idbstore.delete(key);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(() => {
          resolve(req.result);
        });
      });
    }
  }

  /** Table.clear()
   * 
   * http://dexie.org/docs/Table/Table.clear()
   * 
   **/
  clear() {
    if (this.hook.deleting.subscribers.length) {
      // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
      // call the CRUD event. Only Collection.delete() will knows which objects that are actually deleted.
      return this.toCollection().delete();
    } else {
      return this._idbstore('readwrite', (resolve, reject, idbstore) => {
        const req = idbstore.clear();
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(() => {
          resolve(req.result);
        });
      });
    }
  }

  /** Table.bulkAdd()
   * 
   * http://dexie.org/docs/Table/Table.bulkAdd()
   * 
   **/
  bulkAdd(objects: T[], keys?: ReadonlyArray<IndexableType>): Promise<TKey> {
    const creatingHook = this.hook.creating.fire;
    return this._idbstore('readwrite', function (resolve, reject, idbstore, trans) {
      if (!idbstore.keyPath && !this.schema.primKey.auto && !keys)
        throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
      if (idbstore.keyPath && keys)
        throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (keys && keys.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
      if (objects.length === 0) return resolve(); // Caller provided empty list.
      function done(result) {
        if (errorList.length === 0) resolve(result);
        else reject(new BulkError(`${this.name}.bulkAdd(): ${errorList.length} of ${numObjs} operations failed`, errorList));
      }
      let req,
        errorList = [],
        errorHandler,
        successHandler,
        numObjs = objects.length;
      if (creatingHook !== nop) {
        //
        // There are subscribers to hook('creating')
        // Must behave as documented.
        //
        const keyPath = idbstore.keyPath;
        let hookCtx;

        errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
        successHandler = hookedEventSuccessHandler(null);

        tryCatch(() => {
          for (let i = 0, l = objects.length; i < l; ++i) {
            hookCtx = { onerror: null, onsuccess: null };
            let key = keys && keys[i];
            let obj = objects[i];
            const effectiveKey = keys ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined;
            const keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
            if (effectiveKey == null && keyToUse != null) {
              if (keyPath) {
                obj = deepClone(obj);
                setByKeyPath(obj, keyPath, keyToUse);
              } else {
                key = keyToUse;
              }
            }
            req = key != null ?
              idbstore.add(obj, key) :
              idbstore.add(obj);
            req._hookCtx = hookCtx;
            if (i < l - 1) {
              req.onerror = errorHandler;
              if (hookCtx.onsuccess)
                req.onsuccess = successHandler;
            }
          }
        }, err => {
          hookCtx.onerror && hookCtx.onerror(err);
          throw err;
        });

        req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
        req.onsuccess = hookedEventSuccessHandler(done);
      } else {
        //
        // Standard Bulk (no 'creating' hook to care about)
        //
        errorHandler = BulkErrorHandlerCatchAll(errorList);
        for (var i = 0, l = objects.length; i < l; ++i) {
          req = keys ? idbstore.add(objects[i], keys[i]) : idbstore.add(objects[i]);
          req.onerror = errorHandler;
        }
        // Only need to catch success or error on the last operation
        // according to the IDB spec.
        req.onerror = BulkErrorHandlerCatchAll(errorList, done);
        req.onsuccess = eventSuccessHandler(done);
      }
    });
  }

  bulkPut(objects: T[], keys?: ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>): Promise<TKey> {
    return this._idbstore('readwrite', (resolve, reject, idbstore) => {
      if (!idbstore.keyPath && !this.schema.primKey.auto && !keys)
        throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
      if (idbstore.keyPath && keys)
        throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (keys && keys.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
      if (objects.length === 0) return resolve(); // Caller provided empty list.
      const done = (result?) => {
        if (errorList.length === 0) resolve(result);
        else reject(new BulkError(`${this.name}.bulkPut(): ${errorList.length} of ${numObjs} operations failed`, errorList));
      };
      let req,
        errorList = [],
        errorHandler,
        numObjs = objects.length,
        table = this;
      if (this.hook.creating.fire === nop && this.hook.updating.fire === nop) {
        //
        // Standard Bulk (no 'creating' or 'updating' hooks to care about)
        //
        errorHandler = BulkErrorHandlerCatchAll(errorList);
        for (var i = 0, l = objects.length; i < l; ++i) {
          req = keys ? idbstore.put(objects[i], keys[i]) : idbstore.put(objects[i]);
          req.onerror = errorHandler;
        }
        // Only need to catch success or error on the last operation
        // according to the IDB spec.
        req.onerror = BulkErrorHandlerCatchAll(errorList, done);
        req.onsuccess = eventSuccessHandler(done);
      } else {
        var effectiveKeys = keys || idbstore.keyPath && objects.map(o => getByKeyPath(o, idbstore.keyPath));
        // Generate map of {[key]: object}
        // BUGBUG: May fail for binary keys! FIXTHIS!
        var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, (key, i) => key != null && [key, objects[i]]);
        var promise = !effectiveKeys ?

          // Auto-incremented key-less objects only without any keys argument.
          table.bulkAdd(objects) :

          // Keys provided. Either as inbound in provided objects, or as a keys argument.
          // Begin with updating those that exists in DB:
          table.where(':id').anyOf(effectiveKeys.filter(key => key != null))
            .modify(function (this: { value: T, primKey: TKey }) {
              this.value = objectLookup[this.primKey];
              objectLookup[this.primKey] = null; // Mark as "don't add this"
            }).catch(ModifyError, e => {
              errorList = e.failures; // No need to concat here. These are the first errors added.
            }).then(() => {
              // Now, let's examine which items didnt exist so we can add them:
              var objsToAdd = [],
                keysToAdd = keys && [];
              // Iterate backwards. Why? Because if same key was used twice, just add the last one.
              for (var i = effectiveKeys.length - 1; i >= 0; --i) {
                var key = effectiveKeys[i];
                if (key == null || objectLookup[key as string]) {
                  objsToAdd.push(objects[i]);
                  keys && keysToAdd.push(key);
                  if (key != null) objectLookup[key as string] = null; // Mark as "dont add again"
                }
              }
              // The items are in reverse order so reverse them before adding.
              // Could be important in order to get auto-incremented keys the way the caller
              // would expect. Could have used unshift instead of push()/reverse(),
              // but: http://jsperf.com/unshift-vs-reverse
              objsToAdd.reverse();
              keys && keysToAdd.reverse();
              return table.bulkAdd(objsToAdd, keysToAdd);
            }).then(lastAddedKey => {
              // Resolve with key of the last object in given arguments to bulkPut():
              var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
              return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
            });

        promise.then(done).catch(BulkError, e => {
          // Concat failure from ModifyError and reject using our 'done' method.
          errorList = errorList.concat(e.failures);
          done();
        }).catch(reject);
      }
    }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
  }

  bulkDelete(keys: ReadonlyArray<string | number | Date | ArrayBuffer | ArrayBufferView | DataView | void[][]>): Promise<void> {
    throw new Error("Method not implemented.");
  }

}