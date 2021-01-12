import { BulkError, exceptions } from '../../errors';
import { Table as ITable } from '../../public/types/table';
import { TableSchema } from '../../public/types/table-schema';
import { TableHooks } from '../../public/types/table-hooks';
import { DexiePromise as Promise, PSD, newScope, wrap, rejection, beginMicroTickScope, endMicroTickScope } from '../../helpers/promise';
import { Transaction } from '../transaction';
import { Dexie } from '../dexie';
import { tempTransaction } from '../../functions/temp-transaction';
import { Collection } from '../collection';
import { isArray, keys, getByKeyPath, hasOwn, setByKeyPath, deepClone, tryCatch, arrayToObject, extend } from '../../functions/utils';
import { maxString } from '../../globals/constants';
import { combine } from '../../functions/combine';
import { PromiseExtended } from "../../public/types/promise-extended";
import { IndexableType } from '../../public/types/indexable-type';
import { debug } from '../../helpers/debug';
import { DBCoreTable } from '../../public/types/dbcore';
import { AnyRange } from '../../dbcore/keyrange';
import { workaroundForUndefinedPrimKey } from '../../functions/workaround-undefined-primkey';

/** class Table
 * 
 * http://dexie.org/docs/Table/Table
 */
export class Table implements ITable<any, IndexableType> {
  db: Dexie;
  _tx?: Transaction;
  name: string;
  schema: TableSchema;
  hook: TableHooks;
  core: DBCoreTable;

  _trans(
    mode: IDBTransactionMode,
    fn: (idbtrans: IDBTransaction, dxTrans: Transaction) => PromiseLike<any> | void,
    writeLocked?: boolean | string) : PromiseExtended<any>
  {
    const trans: Transaction = this._tx || PSD.trans;
    const tableName = this.name;
    
    function checkTableInTransaction(resolve, reject, trans: Transaction) {
      if (!trans.schema[tableName])
        throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
      return fn(trans.idbtrans, trans);
    }
    // Surround all in a microtick scope.
    // Reason: Browsers (modern Safari + older others)
    // still as of 2018-10-10 has problems keeping a transaction
    // alive between micro ticks. Safari because if transaction
    // is created but not used in same microtick, it will go
    // away. That specific issue could be solved in DBCore
    // by opening the transaction just before using it instead.
    // But older Firefoxes and IE11 (with Promise polyfills)
    // will still have probs.
    // The beginMicrotickScope()/endMicrotickScope() works
    // in cooperation with Dexie.Promise to orchestrate
    // the micro-ticks in endMicrotickScope() rather than
    // in native engine.
    const wasRootExec = beginMicroTickScope();
    try {
      return trans && trans.db === this.db ?
        trans === PSD.trans ?
          trans._promise(mode, checkTableInTransaction, writeLocked) :
          newScope(() => trans._promise(mode, checkTableInTransaction, writeLocked), { trans: trans, transless: PSD.transless || PSD }) :
        tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
    } finally {
      if (wasRootExec) endMicroTickScope();
    }
  }

  /** Table.get()
   * 
   * http://dexie.org/docs/Table/Table.get()
   * 
   **/
  get(keyOrCrit, cb?) {
    if (keyOrCrit && keyOrCrit.constructor === Object)
      return this.where(keyOrCrit as { [key: string]: IndexableType }).first(cb);

    return this._trans('readonly', (trans) => {
      return this.core.get({trans, key: keyOrCrit})
        .then(res => this.hook.reading.fire(res));
    }).then(cb);
  }

  /** Table.where()
   * 
   * http://dexie.org/docs/Table/Table.where()
   * 
   **/
  where(indexOrCrit: string | string[] | { [key: string]: IndexableType }) {
    if (typeof indexOrCrit === 'string')
      return new this.db.WhereClause(this, indexOrCrit);
    if (isArray(indexOrCrit))
      return new this.db.WhereClause(this, `[${indexOrCrit.join('+')}]`);
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

    if (compoundIndex && this.db._maxKey !== maxString)
      // Cool! We found such compound index
      // and this browser supports compound indexes (maxKey !== maxString)!
      return this
        .where(compoundIndex.name)
        .equals((compoundIndex.keyPath as string[]).map(kp => indexOrCrit[kp]));

    if (!compoundIndex && debug) console.warn(
      `The query ${JSON.stringify(indexOrCrit)} on ${this.name} would benefit of a ` +
      `compound index [${keyPaths.join('+')}]`);

    // Ok, now let's fallback to finding at least one matching index
    // and filter the rest.
    const { idxByName } = this.schema;
    const idb = this.db._deps.indexedDB;

    function equals (a, b) {
      try {
        return idb.cmp(a,b) === 0; // Works with all indexable types including binary keys.
      } catch (e) {
        return false;
      }
    }

    const [idx, filterFunction] = keyPaths.reduce(([prevIndex, prevFilterFn], keyPath) => {
      const index = idxByName[keyPath];
      const value = indexOrCrit[keyPath];
      return [
        prevIndex || index, // idx::=Pick index of first matching keypath
        prevIndex || !index ? // filter::=null if not needed, otherwise combine function filter
          combine(
            prevFilterFn,
            index && index.multi ?
              x => {
                const prop = getByKeyPath(x, keyPath);
                return isArray(prop) && prop.some(item => equals(value, item));
              } : x => equals(value, getByKeyPath(x, keyPath)))
          : prevFilterFn
      ];
    }, [null, null]);

    return idx ?
      this.where(idx.name).equals(indexOrCrit[idx.keyPath])
        .filter(filterFunction) :
      compoundIndex ?
        this.filter(filterFunction) : // Has compound but browser bad. Allow filter.
        this.where(keyPaths).equals(''); // No index at all. Fail lazily with "[a+b+c] is not indexed"
  }

  /** Table.filter()
   * 
   * http://dexie.org/docs/Table/Table.filter()
   * 
   **/
  filter(filterFunction: (obj: any) => boolean) {
    return this.toCollection().and(filterFunction);
  }

  /** Table.count()
   * 
   * http://dexie.org/docs/Table/Table.count()
   * 
   **/
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
  each(callback: (obj: any, cursor: { key: IndexableType, primaryKey: IndexableType }) => any) {
    return this.toCollection().each(callback);
  }

  /** Table.toArray()
   * 
   * http://dexie.org/docs/Table/Table.toArray()
   * 
   **/
  toArray(thenShortcut?: any) {
    return this.toCollection().toArray(thenShortcut);
  }

  /** Table.toCollection()
   * 
   * http://dexie.org/docs/Table/Table.toCollection()
   * 
   **/
  toCollection() {
    return new this.db.Collection(new this.db.WhereClause(this));
  }

  /** Table.orderBy()
   * 
   * http://dexie.org/docs/Table/Table.orderBy()
   * 
   **/
  orderBy(index: string | string[]) {
    return new this.db.Collection(
      new this.db.WhereClause(this, isArray(index) ?
        `[${index.join('+')}]` :
        index));
  }

  /** Table.reverse()
   * 
   * http://dexie.org/docs/Table/Table.reverse()
   * 
   **/
  reverse(): Collection {
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

  /** @deprecated */
  defineClass() {
    function Class (content){
      extend(this, content);
    };
    return this.mapToClass(Class);
  }

  /** Table.add()
   * 
   * http://dexie.org/docs/Table/Table.add()
   * 
   **/
  add(obj, key?: IndexableType): PromiseExtended<IndexableType> {
    const {auto, keyPath} = this.schema.primKey;
    let objToAdd = obj;
    if (keyPath && auto) {
      objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
    }
    return this._trans('readwrite', trans => {
      return this.core.mutate({trans, type: 'add', keys: key != null ? [key] : null, values: [objToAdd]});
    }).then(res => res.numFailures ? Promise.reject(res.failures[0]) : res.lastResult)
    .then(lastResult => {
      if (keyPath) {
        // This part should be here for backward compatibility.
        // If ever feeling too bad about this, please wait to a new major before removing it,
        // and document the change thoroughly.
        try{setByKeyPath(obj, keyPath, lastResult);}catch(_){};
      }
      return lastResult;
    });
  }

  /** Table.update()
   * 
   * http://dexie.org/docs/Table/Table.update()
   * 
   **/
  update(keyOrObject, modifications: { [keyPath: string]: any; } | ((obj: any, ctx:{value: any, primKey: IndexableType}) => void | boolean)): PromiseExtended<number> {
    if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
      const key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
      if (key === undefined) return rejection(new exceptions.InvalidArgument(
        "Given object does not contain its primary key"));
      // object to modify. Also modify given object with the modifications:
      // This part should be here for backward compatibility.
      // If ever feeling too bad about mutating given object, please wait to a new major before removing it,
      // and document the change thoroughly.
      try {
        if (typeof modifications !== "function") {
          keys(modifications).forEach(keyPath => {
            setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
          });
        } else {
          // Now since we support function argument, we should have a similar behavior here as well
          // (as long as we do this mutability stuff on the given object)
          modifications(keyOrObject, {value: keyOrObject, primKey: key});
        }
      } catch {
        // Maybe given object was frozen.
        // This part is not essential. Just move on as nothing happened...
      }
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
  put(obj, key?: IndexableType): PromiseExtended<IndexableType> {
    const {auto, keyPath} = this.schema.primKey;
    let objToAdd = obj;
    if (keyPath && auto) {
      objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
    }
    return this._trans(
      'readwrite',
      trans => this.core.mutate({trans, type: 'put', values: [objToAdd], keys: key != null ? [key] : null}))
    .then(res => res.numFailures ? Promise.reject(res.failures[0]) : res.lastResult)
    .then(lastResult => {
      if (keyPath) {
        // This part should be here for backward compatibility.
        // If ever feeling too bad about this, please wait to a new major before removing it,
        // and document the change thoroughly.
        try{setByKeyPath(obj, keyPath, lastResult);}catch(_){};
      }
      return lastResult;
    });
  }

  /** Table.delete()
   * 
   * http://dexie.org/docs/Table/Table.delete()
   * 
   **/
  delete(key: IndexableType): PromiseExtended<void> {
    return this._trans('readwrite',
      trans => this.core.mutate({trans, type: 'delete', keys: [key]}))
    .then(res => res.numFailures ? Promise.reject(res.failures[0]) : undefined);
  }

  /** Table.clear()
   * 
   * http://dexie.org/docs/Table/Table.clear()
   * 
   **/
  clear() {
    return this._trans('readwrite',
      trans => this.core.mutate({trans, type: 'deleteRange', range: AnyRange}))
        .then(res => res.numFailures ? Promise.reject(res.failures[0]) : undefined);
  }

  /** Table.bulkGet()
   * 
   * http://dexie.org/docs/Table/Table.bulkGet()
   * 
   * @param keys 
   */
  bulkGet(keys: IndexableType[]) {
    return this._trans('readonly', trans => {
      return this.core.getMany({
        keys,
        trans
      }).then(result => result.map(res => this.hook.reading.fire(res)));
    });
  }

  /** Table.bulkAdd()
   * 
   * http://dexie.org/docs/Table/Table.bulkAdd()
   * 
   **/
  bulkAdd(
    objects: any[],
    keysOrOptions?: ReadonlyArray<IndexableType> | { allKeys?: boolean },
    options?: { allKeys?: boolean }
  ) {    
    const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
    options = options || (keys ? undefined : keysOrOptions as { allKeys?: boolean });
    const wantResults = options ? options.allKeys : undefined;

    return this._trans('readwrite', trans => {
      const {auto, keyPath} = this.schema.primKey;
      if (keyPath && keys)
        throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (keys && keys.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");

      const numObjects = objects.length; // Pick length here to allow garbage collection of objects later
      let objectsToAdd = keyPath && auto ?
        objects.map(workaroundForUndefinedPrimKey(keyPath)) :
        objects;
      return this.core.mutate(
        {trans, type: 'add', keys: keys as IndexableType[], values: objectsToAdd, wantResults}
      )
        .then(({numFailures, results,lastResult, failures}) => {
          const result = wantResults ? results : lastResult;
          if (numFailures === 0) return result;
          throw new BulkError(
            `${this.name}.bulkAdd(): ${numFailures} of ${numObjects} operations failed`, failures);
        });
    });
  }

  /** Table.bulkPut()
   * 
   * http://dexie.org/docs/Table/Table.bulkPut()
   * 
   **/
  bulkPut(
    objects: any[],
    keysOrOptions?: ReadonlyArray<IndexableType> | { allKeys?: boolean },
    options?: { allKeys?: boolean }
  ) {   
    const keys = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
    options = options || (keys ? undefined : keysOrOptions as { allKeys?: boolean });
    const wantResults = options ? options.allKeys : undefined;

    return this._trans('readwrite', trans => {
      const {auto, keyPath} = this.schema.primKey;
      if (keyPath && keys)
        throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (keys && keys.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");

      const numObjects = objects.length; // Pick length here to allow garbage collection of objects later
      let objectsToPut = keyPath && auto ?
        objects.map(workaroundForUndefinedPrimKey(keyPath)) :
        objects;

      return this.core.mutate(
        {trans, type: 'put', keys: keys as IndexableType[], values: objectsToPut, wantResults}
      )
        .then(({numFailures, results, lastResult, failures}) => {
          const result = wantResults ? results : lastResult;
          if (numFailures === 0) return result;
          throw new BulkError(
            `${this.name}.bulkPut(): ${numFailures} of ${numObjects} operations failed`, failures);
        });
    });
  }

  /** Table.bulkDelete()
   * 
   * http://dexie.org/docs/Table/Table.bulkDelete()
   * 
   **/
  bulkDelete(keys: ReadonlyArray<IndexableType>): PromiseExtended<void> {
    const numKeys = keys.length;
    return this._trans('readwrite', trans => {
      return this.core.mutate({trans, type: 'delete', keys: keys as IndexableType[]});
    }).then(({numFailures, lastResult, failures}) => {
      if (numFailures === 0) return lastResult;
      throw new BulkError(
        `${this.name}.bulkDelete(): ${numFailures} of ${numKeys} operations failed`, failures);
    });
  }
}
