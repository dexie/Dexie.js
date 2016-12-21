import Dexie from 'dexie';

export default function combineUpdateAndUpdate(prevChange, nextChange) {
  var clonedChange = Dexie.deepClone(prevChange); // Clone object before modifying since the earlier change in db.changes[] would otherwise be altered.
  Object.keys(nextChange.mods).forEach(function (keyPath) {
    // If prev-change was changing a parent path of this keyPath, we must update the parent path rather than adding this keyPath
    var hadParentPath = false;
    Object.keys(prevChange.mods).filter(function (parentPath) { return keyPath.indexOf(parentPath + '.') === 0; }).forEach(function (parentPath) {
      Dexie.setByKeyPath(clonedChange.mods[parentPath], keyPath.substr(parentPath.length + 1), nextChange.mods[keyPath]);
      hadParentPath = true;
    });
    if (!hadParentPath) {
      // Add or replace this keyPath and its new value
      clonedChange.mods[keyPath] = nextChange.mods[keyPath];
    }
    // In case prevChange contained sub-paths to the new keyPath, we must make sure that those sub-paths are removed since
    // we must mimic what would happen if applying the two changes after each other:
    Object.keys(prevChange.mods).filter(function (subPath) { return subPath.indexOf(keyPath + '.') === 0; }).forEach(function (subPath) {
      delete clonedChange.mods[subPath];
    });
  });
  return clonedChange;
}
