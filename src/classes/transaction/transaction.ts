import { Transaction as ITransaction } from '../../public/types/transaction';
import { DexiePromise, wrap, rejection } from "../../helpers/promise";
import { DbSchema } from '../../public/types/db-schema';
import { assert, hasOwn } from '../../functions/utils';
import { PSD, usePSD } from '../../helpers/promise';
import { Dexie } from '../dexie';
import { exceptions } from '../../errors';
import { safariMultiStoreFix } from '../../functions/quirks';
import { preventDefault } from '../../functions/event-wrappers';
import { newScope } from '../../helpers/promise';
import * as Debug from '../../helpers/debug';
import { Table } from '../table';
import { globalEvents } from '../../globals/global-events';

/** Transaction
 * 
 * http://dexie.org/docs/Transaction/Transaction
 * 
 **/
export class Transaction implements ITransaction {
  db: Dexie;
  active: boolean;
  mode: IDBTransactionMode;
  idbtrans: IDBTransaction;
  storeNames: string[];
  on: any;
  parent?: Transaction;
  schema: DbSchema;
  _memoizedTables: {[tableName: string]: Table};

  _reculock: number;
  _blockedFuncs: { 0: () => any, 1: any }[];
  _resolve: () => void;
  _reject: (Error) => void;
  _waitingFor: DexiePromise; // for waitFor()
  _waitingQueue: Function[]; // for waitFor()
  _spinCount: number; // Just for debugging waitFor()
  _completion: DexiePromise;

  //
  // Transaction internal methods (not required by API users, but needed internally and eventually by dexie extensions)
  //

  /** Transaction._lock()
   * 
   * Internal method.
   */
  _lock() {
    assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
    // Temporary set all requests into a pending queue if they are called before database is ready.
    ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
    if (this._reculock === 1 && !PSD.global) PSD.lockOwnerFor = this;
    return this;
  }

  /** Transaction._unlock()
   * 
   * Internal method.
   */
  _unlock() {
    assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
    if (--this._reculock === 0) {
      if (!PSD.global) PSD.lockOwnerFor = null;
      while (this._blockedFuncs.length > 0 && !this._locked()) {
        var fnAndPSD = this._blockedFuncs.shift();
        try { usePSD(fnAndPSD[1], fnAndPSD[0]); } catch (e) { }
      }
    }
    return this;
  }

  /** Transaction._lock()
   * 
   * Internal method.
   */
  _locked() {
    // Checks if any write-lock is applied on this transaction.
    // To simplify the Dexie API for extension implementations, we support recursive locks.
    // This is accomplished by using "Promise Specific Data" (PSD).
    // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
    // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
    //         * callback given to the Promise() constructor  (function (resolve, reject){...})
    //         * callbacks given to then()/catch()/finally() methods (function (value){...})
    // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
    // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
    // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
    return this._reculock && PSD.lockOwnerFor !== this;
  }

  /** Transaction.create()
   * 
   * Internal method.
   * 
   */
  create(idbtrans?: IDBTransaction) {
    if (!this.mode) return this;
    const idbdb = this.db.idbdb;
    const dbOpenError = this.db._state.dbOpenError;
    assert(!this.idbtrans);
    if (!idbtrans && !idbdb) {
      switch (dbOpenError && dbOpenError.name) {
        case "DatabaseClosedError":
          // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
          throw new exceptions.DatabaseClosed(dbOpenError);
        case "MissingAPIError":
          // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
          throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
        default:
          // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
          throw new exceptions.OpenFailed(dbOpenError);
      }
    }
    if (!this.active) throw new exceptions.TransactionInactive();
    assert(this._completion._state === null); // Completion Promise must still be pending.

    idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode) as IDBTransaction;
    idbtrans.onerror = wrap(ev => {
      preventDefault(ev);// Prohibit default bubbling to window.error
      this._reject(idbtrans.error);
    });
    idbtrans.onabort = wrap(ev => {
      preventDefault(ev);
      this.active && this._reject(new exceptions.Abort(idbtrans.error));
      this.active = false;
      this.on("abort").fire(ev);
    });
    idbtrans.oncomplete = wrap(() => {
      this.active = false;
      this._resolve();
      if ('mutatedParts' in idbtrans) {
        globalEvents.txcommitted.fire(idbtrans["mutatedParts"]);
      }
    });
    return this;
  }

  /** Transaction._promise()
   * 
   * Internal method.
   */
  _promise(
    mode: IDBTransactionMode,
    fn: (resolve, reject, trans: Transaction) => PromiseLike<any> | void,
    bWriteLock?: string | boolean): DexiePromise
  {
    if (mode === 'readwrite' && this.mode !== 'readwrite')
      return rejection(new exceptions.ReadOnly("Transaction is readonly"));

    if (!this.active)
      return rejection(new exceptions.TransactionInactive());

    if (this._locked()) {
      return new DexiePromise((resolve, reject) => {
        this._blockedFuncs.push([() => {
          this._promise(mode, fn, bWriteLock).then(resolve, reject);
        }, PSD]);
      });

    } else if (bWriteLock) {
      return newScope(() => {
        var p = new DexiePromise((resolve, reject) => {
          this._lock();
          const rv = fn(resolve, reject, this);
          if (rv && rv.then) rv.then(resolve, reject);
        });
        p.finally(() => this._unlock());
        p._lib = true;
        return p;
      });

    } else {
      var p = new DexiePromise((resolve, reject) => {
        var rv = fn(resolve, reject, this);
        if (rv && rv.then) rv.then(resolve, reject);
      });
      p._lib = true;
      return p;
    }
  }

  /** Transaction._root()
   * 
   * Internal method. Retrieves the root transaction in the tree of sub transactions.
   */
  _root() {
    return this.parent ? this.parent._root() : this;
  }

  /** Transaction.waitFor()
   * 
   * Internal method. Can be accessed from the public API through
   * Dexie.waitFor(): http://dexie.org/docs/Dexie/Dexie.waitFor()
   * 
   **/
  waitFor(promiseLike: PromiseLike<any>) {
    // Always operate on the root transaction (in case this is a sub stransaction)
    var root = this._root();
    // For stability reasons, convert parameter to promise no matter what type is passed to waitFor().
    // (We must be able to call .then() on it.)
    const promise = DexiePromise.resolve(promiseLike);
    if (root._waitingFor) {
      // Already called waitFor(). Wait for both to complete.
      root._waitingFor = root._waitingFor.then(() => promise);
    } else {
      // We're not in waiting state. Start waiting state.
      root._waitingFor = promise;
      root._waitingQueue = [];
      // Start interacting with indexedDB until promise completes:
      var store = root.idbtrans.objectStore(root.storeNames[0]);
      (function spin() {
        ++root._spinCount; // For debugging only
        while (root._waitingQueue.length) (root._waitingQueue.shift())();
        if (root._waitingFor) store.get(-Infinity).onsuccess = spin;
      }());
    }
    var currentWaitPromise = root._waitingFor;
    return new DexiePromise((resolve, reject) => {
      promise.then(
        res => root._waitingQueue.push(wrap(resolve.bind(null, res))),
        err => root._waitingQueue.push(wrap(reject.bind(null, err)))
      ).finally(() => {
        if (root._waitingFor === currentWaitPromise) {
          // No one added a wait after us. Safe to stop the spinning.
          root._waitingFor = null;
        }
      });
    });
  }  

  /** Transaction.abort()
   * 
   * http://dexie.org/docs/Transaction/Transaction.abort()
   */
  abort() {
    this.active && this._reject(new exceptions.Abort());
    this.active = false;
  }

  /** Transaction.table()
   * 
   * http://dexie.org/docs/Transaction/Transaction.table()
   */
  table(tableName: string) {
    const memoizedTables = (this._memoizedTables || (this._memoizedTables = {}));
    if (hasOwn(memoizedTables, tableName))
      return memoizedTables[tableName];
    const tableSchema = this.schema[tableName];
    if (!tableSchema) {
      throw new exceptions.NotFound("Table " + tableName + " not part of transaction");        
    }

    const transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
    transactionBoundTable.core = this.db.core.table(tableName);
    memoizedTables[tableName] = transactionBoundTable;
    return transactionBoundTable;
  }
}
