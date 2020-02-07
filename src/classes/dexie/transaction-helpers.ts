import { TransactionMode } from '../../public/types/transaction-mode';
import { exceptions } from '../../errors';
import { flatten, isAsyncFunction } from '../../functions/utils';
import { Dexie } from './dexie';
import { Transaction } from '../transaction';
import { awaitIterator } from '../../helpers/yield-support';
import Promise, {
  PSD,
  NativePromise,
  decrementExpectedAwaits,
  rejection,
  incrementExpectedAwaits
} from '../../helpers/promise';

export function extractTransactionArgs(mode: TransactionMode, _tableArgs_, scopeFunc) {
  // Let table arguments be all arguments between mode and last argument.
  var i = arguments.length;
  if (i < 2) throw new exceptions.InvalidArgument("Too few arguments");
  // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
  // and clone arguments except the first one into local var 'args'.
  var args = new Array(i - 1);
  while (--i) args[i - 1] = arguments[i];
  // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
  scopeFunc = args.pop();
  var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
  return [mode, tables, scopeFunc];
}

export function enterTransactionScope(
  db: Dexie,
  mode: IDBTransactionMode,
  storeNames: string[],
  parentTransaction: Transaction | undefined,
  scopeFunc: ()=>PromiseLike<any> | any
) {
  return Promise.resolve().then(() => {
    // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
    const transless = PSD.transless || PSD;
    // Our transaction.
    //return new Promise((resolve, reject) => {
    const trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
    // Let the transaction instance be part of a Promise-specific data (PSD) value.
    const zoneProps = {
      trans: trans,
      transless: transless
    };

    if (parentTransaction) {
      // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
      trans.idbtrans = parentTransaction.idbtrans;
    } else {
      trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
    }

    // Support for native async await.
    const scopeFuncIsAsync = isAsyncFunction(scopeFunc);
    if (scopeFuncIsAsync) {
      incrementExpectedAwaits();
    }

    let returnValue;
    const promiseFollowed = Promise.follow(() => {
      // Finally, call the scope function with our table and transaction arguments.
      returnValue = scopeFunc.call(trans, trans);
      if (returnValue) {
        if (scopeFuncIsAsync) {
          // scopeFunc is a native async function - we know for sure returnValue is native promise.
          var decrementor = decrementExpectedAwaits.bind(null, null);
          returnValue.then(decrementor, decrementor);
        } else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
          // scopeFunc returned an iterator with throw-support. Handle yield as await.
          returnValue = awaitIterator(returnValue);
        }
      }
    }, zoneProps);
    return (returnValue && typeof returnValue.then === 'function' ?
      // Promise returned. User uses promise-style transactions.
      Promise.resolve(returnValue).then(x => trans.active ?
        x // Transaction still active. Continue.
        : rejection(new exceptions.PrematureCommit(
          "Transaction committed too early. See http://bit.ly/2kdckMn")))
      // No promise returned. Wait for all outstanding promises before continuing. 
      : promiseFollowed.then(() => returnValue)
    ).then(x => {
      // sub transactions don't react to idbtrans.oncomplete. We must trigger a completion:
      if (parentTransaction) trans._resolve();
      // wait for trans._completion
      // (if root transaction, this means 'complete' event. If sub-transaction, we've just fired it ourselves)
      return trans._completion.then(() => x);
    }).catch(e => {
      trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
      return rejection(e);
    });
  });
}
