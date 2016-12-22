import Dexie from 'dexie';
import { CREATE, DELETE, UPDATE } from './change_types';
import bulkUpdate from './bulk-update';

export default function initApplyChanges(db) {
  return function applyChanges(changes, offset) {
    const length = changes.length;
    // This is the base case for the recursion
    if (offset >= length) return Dexie.Promise.resolve(null);
    const firstChange = changes[offset];
    let i, change;
    for (i=offset + 1; i < length; ++i) {
      change = changes[i];
      if (change.type !== firstChange.type ||
          change.table !== firstChange.table)
        break;
    }
    const table = db.table(firstChange.table);
    const specifyKeys = !table.schema.primKey.keyPath;
    const changesToApply = changes.slice(offset, i);
    const changeType = firstChange.type;
    const bulkPromise =
        changeType === CREATE ?
            table.bulkPut(changesToApply.map(c => c.obj), specifyKeys ?
                changesToApply.map(c => c.key) : undefined) :
            changeType === UPDATE ?
                bulkUpdate(table, changesToApply) :
                changeType === DELETE ?
                    table.bulkDelete(changesToApply.map(c => c.key)) :
                    Dexie.Promise.resolve(null);

    return bulkPromise.then(()=>applyChanges(changes, i));
  };
}
