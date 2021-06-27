export default function overrideParseStoresSpec(origFunc) {
  return function(stores, dbSchema) {
    // Create the _changes and _syncNodes tables
    stores["_changes"] = "++rev";
    stores["_syncNodes"] = "++id,myRevision,lastHeartBeat,&url,isMaster,type,status";
    stores["_intercomm"] = "++id,destinationNode";
    stores["_uncommittedChanges"] = "++id,node"; // For remote syncing when server returns a partial result.
    // Call default implementation. Will populate the dbSchema structures.
    origFunc.call(this, stores, dbSchema);
    // Allow UUID primary keys using $$ prefix on primary key or indexes
    Object.keys(dbSchema).forEach(function(tableName) {
      var schema = dbSchema[tableName];
      if (schema.primKey.name.indexOf('$$') === 0) {
        schema.primKey.uuid = true;
        schema.primKey.name = schema.primKey.name.substr(2);
        schema.primKey.keyPath = schema.primKey.keyPath.substr(2);
      }
    });
    // Now mark all observable tables
    Object.keys(dbSchema).forEach(function(tableName) {
      // Marked observable tables with "observable" in their TableSchema.
      if (tableName.indexOf('_') !== 0 && tableName.indexOf('$') !== 0) {
        dbSchema[tableName].observable = true;
      }
    });
  };
}
