import { DexieInternal, DbState } from "../interfaces/dexie-internal";
import { PSD, rejection, newScope } from "../Promise";
import { DexieOptions } from "../interfaces/dexie-constructor";
import { exceptions } from "../errors";
import { nop } from "../chaining-functions";
import { TransactionImpl } from "../classes/transaction-impl";

/* Generate a temporary transaction when db operations are done outside a transaction scope.
*/
export function tempTransaction (
  db: DexieInternal,
  mode: IDBTransactionMode,
  storeNames: string[],
  fn: (resolve, reject, trans: TransactionImpl) => any)
  // Last argument is "writeLocked". But this doesnt apply to oneshot direct db operations, so we ignore it.
{
  if (!db._i.openComplete && (!PSD.letThrough)) {
    if (!db._i.isBeingOpened) {
      if (!db._i.autoOpen)
        return rejection(new exceptions.DatabaseClosed());
      db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
    }
    return db._i.dbReadyPromise.then(() => tempTransaction(db, mode, storeNames, fn));
  } else {
    var trans = db._createTransaction(mode, storeNames, db._dbSchema);
    try { trans.create(); } catch (ex) { return rejection(ex); }
    return trans._promise(mode, (resolve, reject) => {
      return newScope(() => { // OPTIMIZATION POSSIBLE? newScope() not needed because it's already done in _promise.
        PSD.trans = trans;
        return fn(resolve, reject, trans);
      });
    }).then(result => {
      // Instead of resolving value directly, wait with resolving it until transaction has completed.
      // Otherwise the data would not be in the DB if requesting it in the then() operation.
      // Specifically, to ensure that the following expression will work:
      //
      //   db.friends.put({name: "Arne"}).then(function () {
      //       db.friends.where("name").equals("Arne").count(function(count) {
      //           assert (count === 1);
      //       });
      //   });
      //
      return trans._completion.then(() => result);
    });/*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
          trans._reject(err);
          return rejection(err);
      });*/
  }
}
