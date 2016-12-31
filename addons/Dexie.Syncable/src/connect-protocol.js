import Dexie from 'dexie';

import initEnqueue from './enqueue';
import initSaveToUncommittedChanges from './save-to-uncommitted-changes';
import initFinallyCommitAllChanges from './finally-commit-all-changes';
import initGetLocalChangesForNode from './get-local-changes-for-node/get-local-changes-for-node';
import {Statuses} from './statuses';

const Promise = Dexie.Promise;

export default function initConnectProtocol(db, protocolInstance, dbAliveID, options, rejectConnectPromise) {
  const enqueue = initEnqueue(db);
  var hasMoreToGive = {hasMoreToGive: true};

  function stillAlive() {
    // A better method than doing db.isOpen() because the same db instance may have been reopened, but then this sync call should be dead
    // because the new instance should be considered a fresh instance and will have another local node.
    return db._localSyncNode && db._localSyncNode.id === dbAliveID;
  }

  return function connectProtocol(node, activePeer) {
    /// <param name="node" type="db.observable.SyncNode"></param>
    const getLocalChangesForNode = initGetLocalChangesForNode(db, hasMoreToGive, protocolInstance.partialsThreshold);

    const url = activePeer.url;

    function changeStatusTo(newStatus) {
      if (node.status !== newStatus) {
        node.status = newStatus;
        node.save().then(()=> {
          db.syncable.on.statusChanged.fire(newStatus, url);
          // Also broadcast message to other nodes about the status
          db.observable.broadcastMessage("syncStatusChanged", {newStatus: newStatus, url: url}, false);
        }).catch('DatabaseClosedError', ()=> {
        });
      }
    }

    activePeer.on('disconnect', function (newStatus) {
      if (!isNaN(newStatus)) changeStatusTo(newStatus);
    });

    var connectedContinuation;
    changeStatusTo(Statuses.CONNECTING);
    return doSync();

    function doSync() {
      // Use enqueue() to ensure only a single promise execution at a time.
      return enqueue(doSync, function () {
        // By returning the Promise returned by getLocalChangesForNode() a final catch() on the sync() method will also catch error occurring in entire sequence.
        return getLocalChangesForNode_autoAckIfEmpty(node, sendChangesToProvider);
      }, dbAliveID);
    }

    function sendChangesToProvider(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
      // Create a final Promise for the entire sync() operation that will resolve when provider calls onSuccess().
      // By creating finalPromise before calling protocolInstance.sync() it is possible for provider to call onError() immediately if it wants.
      var finalSyncPromise = new Promise(function (resolve, reject) {
        rejectConnectPromise.p = function (err) {
          reject(err);
        };
        Dexie.asap(function () {
          try {
            protocolInstance.sync(
                node.syncContext,
                url,
                options,
                remoteBaseRevision,
                node.appliedRemoteRevision,
                changes,
                partial,
                applyRemoteChanges,
                onChangesAccepted,
                function (continuation) {
                  resolve(continuation);
                },
                onError);
          } catch (ex) {
            onError(ex, Infinity);
          }

          function onError(error, again) {
            reject(error);
            if (stillAlive()) {
              if (!isNaN(again) && again < Infinity) {
                setTimeout(function () {
                  if (stillAlive()) {
                    changeStatusTo(Statuses.SYNCING);
                    doSync().catch('DatabaseClosedError', abortTheProvider);
                  }
                }, again);
                changeStatusTo(Statuses.ERROR_WILL_RETRY, error);
                if (connectedContinuation && connectedContinuation.disconnect) connectedContinuation.disconnect();
                connectedContinuation = null;
              } else {
                abortTheProvider(error); // Will fire ERROR on statusChanged event.
              }
            }
          }
        });
      });

      return finalSyncPromise.then(function () {
        // Resolve caller of db.syncable.connect() with undefined. Not with continuation!
        return undefined;
      }).finally(()=> {
        // In case error happens after connect, don't try reject the connect promise anymore.
        // This is important. A Dexie unit test that verifies unhandled rejections will fail when Dexie.Syncable addon
        // is active and this happens. It would fire unhandledrejection but that we do not want.
        rejectConnectPromise.p = null;
      });

      function onChangesAccepted() {
        Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
          Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
        });
        // We dont know if onSuccess() was called by provider yet. If it's already called, finalPromise.then() will execute immediately,
        // otherwise it will execute when finalSyncPromise resolves.
        finalSyncPromise.then(continueSendingChanges);
        return node.save();
      }
    }

    function abortTheProvider(error) {
      activePeer.disconnect(Statuses.ERROR, error);
    }

    function getLocalChangesForNode_autoAckIfEmpty(node, cb) {
      return getLocalChangesForNode(node, function autoAck(changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
        if (changes.length === 0 && 'myRevision' in nodeModificationsOnAck && nodeModificationsOnAck.myRevision !== node.myRevision) {
          Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
            Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
          });
          node.save().catch('DatabaseClosedError', ()=> {
          });
          return getLocalChangesForNode(node, autoAck);
        } else {
          return cb(changes, remoteBaseRevision, partial, nodeModificationsOnAck);
        }
      });
    }

    function applyRemoteChanges(remoteChanges, remoteRevision, partial/*, clear*/) {
      const saveToUncommittedChanges = initSaveToUncommittedChanges(db, node);
      const finallyCommitAllChanges = initFinallyCommitAllChanges(db, node);

      return enqueue(applyRemoteChanges, function () {
        if (!stillAlive()) return Promise.reject(new Dexie.DatabaseClosedError());
        // FIXTHIS: Check what to do if clear() is true!
        return (partial ? saveToUncommittedChanges(remoteChanges, remoteRevision) : finallyCommitAllChanges(remoteChanges, remoteRevision))
            .catch(function (error) {
              abortTheProvider(error);
              return Promise.reject(error);
            });
      }, dbAliveID);
    }

    //
    //
    //  Continuation Patterns Follows
    //
    //

    function continueSendingChanges(continuation) {
      if (!stillAlive()) { // Database was closed.
        if (continuation.disconnect)
          continuation.disconnect();
        return;
      }

      connectedContinuation = continuation;
      activePeer.on('disconnect', function () {
        if (connectedContinuation) {
          if (connectedContinuation.react) {
            try {
              // react pattern must provide a disconnect function.
              connectedContinuation.disconnect();
            } catch (e) {
            }
          }
          connectedContinuation = null; // Stop poll() pattern from polling again and abortTheProvider() from being called twice.
        }
      });

      if (continuation.react) {
        continueUsingReactPattern(continuation);
      } else {
        continueUsingPollPattern(continuation);
      }
    }

    //  React Pattern (eager)
    function continueUsingReactPattern(continuation) {
      var changesWaiting, // Boolean
          isWaitingForServer; // Boolean


      function onChanges() {
        if (connectedContinuation) {
          changeStatusTo(Statuses.SYNCING);
          if (isWaitingForServer)
            changesWaiting = true;
          else {
            reactToChanges();
          }
        }
      }

      db.on('changes', onChanges);

      activePeer.on('disconnect', function () {
        db.on.changes.unsubscribe(onChanges);
      });

      function reactToChanges() {
        if (!connectedContinuation) return;
        changesWaiting = false;
        isWaitingForServer = true;
        getLocalChangesForNode_autoAckIfEmpty(node, function (changes, remoteBaseRevision, partial, nodeModificationsOnAck) {
          if (!connectedContinuation) return;
          if (changes.length > 0) {
            continuation.react(changes, remoteBaseRevision, partial, function onChangesAccepted() {
              Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
                Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
              });
              node.save().catch('DatabaseClosedError', ()=> {
              });
              // More changes may be waiting:
              reactToChanges();
            });
          } else {
            isWaitingForServer = false;
            if (changesWaiting) {
              // A change jumped in between the time-spot of quering _changes and getting called back with zero changes.
              // This is an expreemely rare scenario, and eventually impossible. But need to be here because it could happen in theory.
              reactToChanges();
            } else {
              changeStatusTo(Statuses.ONLINE);
            }
          }
        }).catch(ex => {
          console.error(`Got ${ex.message} caught by reactToChanges`);
          abortTheProvider(ex);
        });
      }

      reactToChanges();
    }

    //  Poll Pattern
    function continueUsingPollPattern() {

      function syncAgain() {
        getLocalChangesForNode_autoAckIfEmpty(node, function (changes, remoteBaseRevision, partial, nodeModificationsOnAck) {

          protocolInstance.sync(node.syncContext, url, options, remoteBaseRevision, node.appliedRemoteRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError);

          function onChangesAccepted() {
            Object.keys(nodeModificationsOnAck).forEach(function (keyPath) {
              Dexie.setByKeyPath(node, keyPath, nodeModificationsOnAck[keyPath]);
            });
            node.save().catch('DatabaseClosedError', ()=> {
            });
          }

          function onSuccess(continuation) {
            if (!connectedContinuation) {
              // Got disconnected before succeeding. Quit.
              return;
            }
            connectedContinuation = continuation;
            if (partial) {
              // We only sent partial changes. Need to do another round asap.
              syncAgain();
            } else {
              // We've sent all changes now (in sync!)
              if (!isNaN(continuation.again) && continuation.again < Infinity) {
                // Provider wants to keep polling. Set Status to ONLINE.
                changeStatusTo(Statuses.ONLINE);
                setTimeout(function () {
                  if (connectedContinuation) {
                    changeStatusTo(Statuses.SYNCING);
                    syncAgain();
                  }
                }, continuation.again);
              } else {
                // Provider seems finished polling. Since we are never going to poll again,
                // disconnect provider and set status to OFFLINE until another call to db.syncable.connect().
                activePeer.disconnect(Statuses.OFFLINE);
              }
            }
          }

          function onError(error, again) {
            if (!isNaN(again) && again < Infinity) {
              if (connectedContinuation) {
                setTimeout(function () {
                  if (connectedContinuation) {
                    changeStatusTo(Statuses.SYNCING);
                    syncAgain();
                  }
                }, again);
                changeStatusTo(Statuses.ERROR_WILL_RETRY);
              } // else status is already changed since we got disconnected.
            } else {
              abortTheProvider(error); // Will fire ERROR on onStatusChanged.
            }
          }
        }).catch(abortTheProvider);
      }

      if (hasMoreToGive.hasMoreToGive) {
        syncAgain();
      } else if (connectedContinuation && !isNaN(connectedContinuation.again) && connectedContinuation.again < Infinity) {
        changeStatusTo(Statuses.ONLINE);
        setTimeout(function () {
          if (connectedContinuation) {
            changeStatusTo(Statuses.SYNCING);
            syncAgain();
          }
        }, connectedContinuation.again);
      } else {
        // Provider seems finished polling. Since we are never going to poll again,
        // disconnect provider and set status to OFFLINE until another call to db.syncable.connect().
        activePeer.disconnect(Statuses.OFFLINE);
      }
    }
  };
}
