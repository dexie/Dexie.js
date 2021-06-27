import { CREATE, DELETE, UPDATE } from './change_types';
import bulkUpdate from './bulk-update';

export default function initApplyChanges(db) {
  return function applyChanges(changes) {
    let collectedChanges = {};
    changes.forEach((change) => {
      if (!collectedChanges.hasOwnProperty(change.table)) {
        collectedChanges[change.table] = { [CREATE]: [], [DELETE]: [], [UPDATE]: [] };
      }
      collectedChanges[change.table][change.type].push(change);
    });
    let table_names = Object.keys(collectedChanges);
    let tables = table_names.map((table) => db.table(table));

    return db.transaction("rw", tables, () => {
      table_names.forEach((table_name) => {
        const table = db.table(table_name);
        const specifyKeys = !table.schema.primKey.keyPath;
        const createChangesToApply = collectedChanges[table_name][CREATE];
        const deleteChangesToApply = collectedChanges[table_name][DELETE];
        const updateChangesToApply = collectedChanges[table_name][UPDATE];
        if (createChangesToApply.length > 0)
          table.bulkPut(createChangesToApply.map(c => c.obj), specifyKeys ?
            createChangesToApply.map(c => c.key) : undefined);
        if (updateChangesToApply.length > 0)
          bulkUpdate(table, updateChangesToApply);
        if (deleteChangesToApply.length > 0)
          table.bulkDelete(deleteChangesToApply.map(c => c.key));
      });
    });
  };
}
