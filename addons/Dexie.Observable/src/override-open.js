export default function initOverrideOpen(db, SyncNode, crudMonitor) {
  return function overrideOpen(origOpen) {
    return function () {
      //
      // Make sure to subscribe to "creating", "updating" and "deleting" hooks for all observable tables that were created in the stores() method.
      //
      Object.keys(db._allTables).forEach(tableName => {
        let table = db._allTables[tableName];
        if (table.schema.observable) {
          crudMonitor(table);
        }
        if (table.name === "_syncNodes") {
          table.mapToClass(SyncNode);
        }
      });
      return origOpen.apply(this, arguments);
    }
  };
}
