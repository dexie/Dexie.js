export default function initOverrideCreateTransaction(db, wakeupObservers) {
  return function overrideCreateTransaction(origFunc) {
    return function (mode, storenames, dbschema, parent) {
      if (db.dynamicallyOpened()) return origFunc.apply(this, arguments); // Don't observe dynamically opened databases.
      var addChanges = false;
      if (mode === 'readwrite' && storenames.some(function (storeName) {
            return dbschema[storeName] && dbschema[storeName].observable;
          })) {
        // At least one included store is a observable store. Make sure to also include the _changes store.
        addChanges = true;
        storenames = storenames.slice(0); // Clone
        if (storenames.indexOf("_changes") === -1)
          storenames.push("_changes"); // Otherwise, firefox will hang... (I've reported the bug to Mozilla@Bugzilla)
      }
      // Call original db._createTransaction()
      var trans = origFunc.call(this, mode, storenames, dbschema, parent);
      // If this transaction is bound to any observable table, make sure to add changes when transaction completes.
      if (addChanges) {
        trans._lastWrittenRevision = 0;
        trans.on('complete', function () {
          if (trans._lastWrittenRevision) {
            // Changes were written in this transaction.
            if (!parent) {
              // This is root-level transaction, i.e. a physical commit has happened.
              // Delay-trigger a wakeup call:
              if (wakeupObservers.timeoutHandle) clearTimeout(wakeupObservers.timeoutHandle);
              wakeupObservers.timeoutHandle = setTimeout(function () {
                delete wakeupObservers.timeoutHandle;
                wakeupObservers(trans._lastWrittenRevision);
              }, 25);
            } else {
              // This is just a virtual commit of a sub transaction.
              // Wait with waking up observers until root transaction has committed.
              // Make sure to mark root transaction so that it will wakeup observers upon commit.
              var rootTransaction = (function findRootTransaction(trans) {
                return trans.parent ? findRootTransaction(trans.parent) : trans;
              })(parent);
              rootTransaction._lastWrittenRevision = Math.max(
                  trans._lastWrittenRevision,
                  rootTransaction.lastWrittenRevision || 0);
            }
          }
        });
        // Derive "source" property from parent transaction by default
        if (trans.parent && trans.parent.source) trans.source = trans.parent.source;
      }
      return trans;
    };
  };
}
