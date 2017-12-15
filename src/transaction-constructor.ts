import { Dexie } from './dexie';
import { makeClassConstructor } from './functions/make-class-constructor';

export interface TransactionConstructor {
  new () : Transaction;
  prototype: Transaction;
}

export function createTransactionConstructor (db: Dexie) {
  return makeClassConstructor<TransactionConstructor>(
    Transaction.prototype,
    function Transaction (this: Transaction) {

    });
}
