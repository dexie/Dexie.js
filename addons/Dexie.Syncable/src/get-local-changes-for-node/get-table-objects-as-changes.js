import {CREATE} from '../change_types';
import getBaseRevisionAndMaxClientRevision from './get-base-revision-and-max-client-revision';

export default function initGetTableObjectsAsChanges(db, node, MAX_CHANGES_PER_CHUNK, getChangesSinceRevision, hasMoreToGive, cb) {
  return function getTableObjectsAsChanges(state, changes, collection) {
    /// <param name="state" value="{tablesToUpload:[''],currentTable:'_changes',currentKey:null,localBaseRevision:0}"></param>
    /// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
    /// <param name="collection" type="db.Collection"></param>
    var limitReached = false;
    return collection.until(function () {
      if (changes.length === MAX_CHANGES_PER_CHUNK) {
        limitReached = true;
        return true;
      }
    }).each(function (item, cursor) {
      changes.push({
        type: CREATE,
        table: state.currentTable,
        key: cursor.key,
        obj: cursor.value
      });
      state.currentKey = cursor.key;
    }).then(function () {
      if (limitReached) {
        // Limit reached. Send partial result.
        hasMoreToGive.hasMoreToGive = true;
        return cb(changes, null, true, {dbUploadState: state});
      } else {
        // Done iterating this table. Check if there are more tables to go through:
        if (state.tablesToUpload.length === 0) {
          // Done iterating all tables
          // Now append changes occurred during our dbUpload:
          var brmcr = getBaseRevisionAndMaxClientRevision(node);
          return getChangesSinceRevision(state.localBaseRevision, MAX_CHANGES_PER_CHUNK - changes.length, brmcr.maxClientRevision, function (additionalChanges, partial, nodeModificationsOnAck) {
            changes = changes.concat(additionalChanges);
            nodeModificationsOnAck.dbUploadState = null;
            return cb(changes, brmcr.remoteBaseRevision, partial, nodeModificationsOnAck);
          });
        } else {
          // Not done iterating all tables. Continue on next table:
          state.currentTable = state.tablesToUpload.shift();
          return getTableObjectsAsChanges(state, changes, db.table(state.currentTable).orderBy(':id'));
        }
      }
    });
  };
}
