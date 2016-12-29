import Dexie from 'dexie';

export default function initWakeupObservers(db, Observable, localStorage) {
  return function wakeupObservers(lastWrittenRevision) {
    // Make sure Observable.latestRevision[db.name] is still below our value, now when some time has elapsed and other db instances in same window possibly could have made changes too.
    if (Observable.latestRevision[db.name] < lastWrittenRevision) {
      // Set the static property lastRevision[db.name] to the revision of the last written change.
      Observable.latestRevision[db.name] = lastWrittenRevision;
      // Wakeup ourselves, and any other db instances on this window:
      Dexie.ignoreTransaction(function () {
        Observable.on('latestRevisionIncremented').fire(db.name, lastWrittenRevision);
      });
      // Observable.on.latestRevisionIncremented will only wakeup db's in current window.
      // We need a storage event to wakeup other windwos.
      // Since indexedDB lacks storage events, let's use the storage event from WebStorage just for
      // the purpose to wakeup db instances in other windows.
      if (localStorage) localStorage.setItem('Dexie.Observable/latestRevision/' + db.name, lastWrittenRevision); // In IE, this will also wakeup our own window. However, onLatestRevisionIncremented will work around this by only running once per revision id.
    }
  };
}
