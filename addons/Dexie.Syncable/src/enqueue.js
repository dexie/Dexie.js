import Dexie from 'dexie';

export default function initEnqueue(db) {
  return function enqueue(context, fn, instanceID) {
    function _enqueue() {
      if (!context.ongoingOperation) {
        context.ongoingOperation = Dexie.ignoreTransaction(function () {
          return Dexie.vip(function () {
            return fn();
          });
        }).finally(()=> {
          delete context.ongoingOperation;
        });
      } else {
        context.ongoingOperation = context.ongoingOperation.then(function () {
          return enqueue(context, fn, instanceID);
        });
      }
      return context.ongoingOperation;
    }

    if (!instanceID) {
      // Caller wants to enqueue it until database becomes open.
      if (db.isOpen()) {
        return _enqueue();
      } else {
        return Dexie.Promise.reject(new Dexie.DatabaseClosedError());
      }
    } else if (db._localSyncNode && instanceID === db._localSyncNode.id) {
      // DB is already open but queue doesn't want it to be queued if database has been closed (request bound to current instance of DB)
      return _enqueue();
    } else {
      return Dexie.Promise.reject(new Dexie.DatabaseClosedError());
    }
  };
}
