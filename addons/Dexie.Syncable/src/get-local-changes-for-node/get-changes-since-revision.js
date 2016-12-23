import {CREATE, UPDATE} from '../change_types';
import mergeChange from '../merge-change';

export default function initGetChangesSinceRevision(db, node, hasMoreToGive) {
  return function getChangesSinceRevision(revision, maxChanges, maxRevision, cb) {
    /// <param name="cb" value="function(changes, partial, nodeModificationsOnAck) {}">Callback that will retrieve next chunk of changes and a boolean telling if it's a partial result or not. If truthy, result is partial and there are more changes to come. If falsy, these changes are the final result.</param>
    var changeSet = {};
    var numChanges = 0;
    var partial = false;
    var ignoreSource = node.id;
    var nextRevision = revision;
    return db.transaction('r', db._changes, function () {
      var query = db._changes.where('rev').between(revision, maxRevision, false, true);
      return query.until(() => {
        if (numChanges === maxChanges) {
          partial = true;
          return true;
        }
      }).each(function (change) {
        // Note the revision in nextRevision:
        nextRevision = change.rev;
        // change.source is set based on currentTransaction.source
        if (change.source === ignoreSource) return;
        // Our _changes table contains more info than required (old objs, source etc). Just make sure to include the necessary info:
        var changeToSend = {
          type: change.type,
          table: change.table,
          key: change.key
        };
        if (change.type === CREATE)
          changeToSend.obj = change.obj;
        else if (change.type === UPDATE)
          changeToSend.mods = change.mods;

        var id = change.table + ":" + change.key;
        var prevChange = changeSet[id];
        if (!prevChange) {
          // This is the first change on this key. Add it unless it comes from the source that we are working against
          changeSet[id] = changeToSend;
          ++numChanges;
        } else {
          // Merge the oldchange with the new change
          var nextChange = changeToSend;
          var mergedChange = mergeChange(prevChange, nextChange);
          changeSet[id] = mergedChange;
        }
      });
    }).then(function () {
      var changes = Object.keys(changeSet).map(function (key) {
        return changeSet[key];
      });
      hasMoreToGive.hasMoreToGive = partial;
      return cb(changes, partial, {myRevision: nextRevision});
    });
  };
}
