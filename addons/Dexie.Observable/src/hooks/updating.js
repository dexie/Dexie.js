import Dexie from 'dexie';

import {UPDATE} from '../change_types';

export default function initUpdatingHook(db, tableName) {
  return function updatingHook(mods, primKey, oldObj, trans) {
    /// <param name="trans" type="db.Transaction"></param>
    // mods may contain property paths with undefined as value if the property
    // is being deleted. Since we cannot persist undefined we need to act
    // like those changes is setting the value to null instead.
    var modsWithoutUndefined = {};
    // As of current Dexie version (1.0.3) hook may be called even if it wouldn't really change.
    // Therefore we may do that kind of optimization here - to not add change entries if
    // there's nothing to change.
    var anythingChanged = false;
    var newObj = Dexie.deepClone(oldObj);
    for (var propPath in mods) {
      var mod = mods[propPath];
      if (typeof mod === 'undefined') {
        Dexie.delByKeyPath(newObj, propPath);
        modsWithoutUndefined[propPath] = null; // Null is as close we could come to deleting a property when not allowing undefined.
        anythingChanged = true;
      } else {
        var currentValue = Dexie.getByKeyPath(oldObj, propPath);
        if (mod !== currentValue && JSON.stringify(mod) !== JSON.stringify(currentValue)) {
          Dexie.setByKeyPath(newObj, propPath, mod);
          modsWithoutUndefined[propPath] = mod;
          anythingChanged = true;
        }
      }
    }
    if (anythingChanged) {
      var change = {
        source: trans.source || null, // If a "source" is marked on the transaction, store it. Useful for observers that want to ignore their own changes.
        table: tableName,
        key: primKey,
        type: UPDATE,
        mods: modsWithoutUndefined,
        oldObj: oldObj,
        obj: newObj
      };
      var promise = db._changes.add(change); // Just so we get the correct revision order of the update...
      this.onsuccess = function () {
        promise._then(function (rev) {
          trans._lastWrittenRevision = Math.max(trans._lastWrittenRevision, rev);
        });
      };
      this.onerror = function () {
        // If the main operation fails, make sure to regret the change.
        promise._then(function (rev) {
          // Will only happen if app code catches the main operation error to prohibit transaction from aborting.
          db._changes.delete(rev);
        });
      };
    }
  };
}
