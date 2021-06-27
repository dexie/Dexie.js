import Dexie from 'dexie';

import {CREATE} from '../change_types';
import {createUUID} from '../utils';

export default function initCreatingHook(db, table) {
  return function creatingHook(primKey, obj, trans) {
    /// <param name="trans" type="db.Transaction"></param>
    var rv = undefined;
    if (primKey === undefined && table.schema.primKey.uuid) {
      primKey = rv = createUUID();
      if (table.schema.primKey.keyPath) {
        Dexie.setByKeyPath(obj, table.schema.primKey.keyPath, primKey);
      }
    }

    var change = {
      source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
      table: table.name,
      key: primKey === undefined ? null : primKey,
      type: CREATE,
      obj: obj
    };

    var promise = db._changes.add(change).then(function (rev) {
      trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
      return rev;
    });

    // Wait for onsuccess so that we have the primKey if it is auto-incremented and update the change item if so.
    this.onsuccess = function (resultKey) {
      if (primKey != resultKey)
        promise._then(function () {
          change.key = resultKey;
          db._changes.put(change);
        });
    };

    this.onerror = function () {
      // If the main operation fails, make sure to regret the change
      promise._then(function (rev) {
        // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
        db._changes.delete(rev);
      });
    };

    return rv;
  };
}
