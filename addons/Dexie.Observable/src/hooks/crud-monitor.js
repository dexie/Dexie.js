import initCreatingHook from './creating';
import initUpdatingHook from './updating';
import initDeletingHook from './deleting';

export default function initCrudMonitor(db) {
//
// The Creating/Updating/Deleting hook will make sure any change is stored to the changes table
//
  return function crudMonitor(table) {
    /// <param name="table" type="db.Table"></param>
    if (table.hook._observing) return;
    table.hook._observing = true;

    const tableName = table.name;
    table.hook('creating').subscribe(initCreatingHook(db, table));

    table.hook('updating').subscribe(initUpdatingHook(db, tableName));

    table.hook('deleting').subscribe(initDeletingHook(db, tableName));
  };
}
