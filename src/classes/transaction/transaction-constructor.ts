import { Dexie } from '../dexie';
import { makeClassConstructor } from '../../functions/make-class-constructor';
import { Transaction } from './transaction';
import { DbSchema } from '../../public/types/db-schema';
import Events from '../../helpers/Events';
import Promise, { rejection } from '../../helpers/promise';

export interface TransactionConstructor<T extends Transaction=Transaction> {
  new (
    mode: IDBTransactionMode,
    storeNames: string[],
    dbschema: DbSchema,
    parent?: Transaction) : T;
  prototype: T;
}

/** Generates a Transaction constructor bound to given Dexie instance.
 * 
 * The purpose of having dynamically created constructors, is to allow
 * addons to extend classes for a certain Dexie instance without affecting
 * other db instances.
 */
export function createTransactionConstructor(db: Dexie) {
  return makeClassConstructor<TransactionConstructor<Transaction>>(
    Transaction.prototype,
    function Transaction (
      this: Transaction,
      mode: IDBTransactionMode,
      storeNames: string[],
      dbschema: DbSchema,
      parent?: Transaction)
    {
      this.db = db;
      this.mode = mode;
      this.storeNames = storeNames;
      this.schema = dbschema;
      this.idbtrans = null;
      this.on = Events(this, "complete", "error", "abort");
      this.parent = parent || null;
      this.active = true;
      this._reculock = 0;
      this._blockedFuncs = [];
      this._resolve = null;
      this._reject = null;
      this._waitingFor = null;
      this._waitingQueue = null;
      this._spinCount = 0; // Just for debugging waitFor()
      this._completion = new Promise ((resolve, reject) => {
          this._resolve = resolve;
          this._reject = reject;
      });
      
      this._completion.then(
          ()=> {
              this.active = false;
              this.on.complete.fire();
          },
          e => {
              var wasActive = this.active;
              this.active = false;
              this.on.error.fire(e);
              this.parent ?
                  this.parent._reject(e) :
                  wasActive && this.idbtrans && this.idbtrans.abort();
              return rejection(e); // Indicate we actually DO NOT catch this error.
          });
    
    });
}
