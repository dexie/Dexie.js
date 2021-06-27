import {DELETE} from '../change_types';

export default function initDeletingHook(db, tableName) {
  return function deletingHook(primKey, obj, trans) {
    /// <param name="trans" type="db.Transaction"></param>
    var promise = db._changes.add({
      source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
      table: tableName,
      key: primKey,
      type: DELETE,
      oldObj: obj
    }).then(function (rev) {
      trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
      return rev;
    })
        .catch((e) => {
          console.log(obj)
          console.log(e.stack)
        })
    this.onerror = function () {
      // If the main operation fails, make sure to regret the change.
      // Using _then because if promise is already fullfilled, the standard then() would
      // do setTimeout() and we would loose the transaction.
      promise._then(function (rev) {
        // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
        db._changes.delete(rev);
      });
    };
  };
}
