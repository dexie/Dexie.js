import Dexie from 'dexie';

export default function initOnStorage(Observable) {
  return function onStorage(event) {
    // We use the onstorage event to trigger onLatestRevisionIncremented since we will wake up when other windows modify the DB as well!
    if (event.key.indexOf("Dexie.Observable/") === 0) { // For example "Dexie.Observable/latestRevision/FriendsDB"
      var parts = event.key.split('/');
      var prop = parts[1];
      var dbname = parts[2];
      if (prop === 'latestRevision') {
        var rev = parseInt(event.newValue, 10);
        if (!isNaN(rev) && rev > Observable.latestRevision[dbname]) {
          Observable.latestRevision[dbname] = rev;
          Dexie.ignoreTransaction(function () {
            Observable.on('latestRevisionIncremented').fire(dbname, rev);
          });
        }
      } else if (prop.indexOf("deadnode:") === 0) {
        var nodeID = parseInt(prop.split(':')[1], 10);
        if (event.newValue) {
          Observable.on.suicideNurseCall.fire(dbname, nodeID);
        }
      } else if (prop === 'intercomm') {
        if (event.newValue) {
          Observable.on.intercomm.fire(dbname);
        }
      }
    }
  };
}
