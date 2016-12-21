import Dexie from 'dexie';

export default function combineCreateAndUpdate(prevChange, nextChange) {
  var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
  Object.keys(nextChange.mods).forEach(function (keyPath) {
    Dexie.setByKeyPath(clonedChange.obj, keyPath, nextChange.mods[keyPath]);
  });
  return clonedChange;
}
