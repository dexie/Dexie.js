import Dexie from 'dexie';

const Promise = Dexie.Promise;

export default function initIntercomm(db, Observable, SyncNode, mySyncNode, localStorage) {
//
// Intercommunication between nodes
//
// Enable inter-process communication between browser windows using localStorage storage event (is registered in Dexie.Observable)

  var requestsWaitingForReply = {};

  /**
   * @param {string} type Type of message
   * @param message Message to send
   * @param {number} destinationNode ID of destination node
   * @param {{wantReply: boolean, isFailure: boolean, requestId: number}} options If {wantReply: true}, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
   */
  db.observable.sendMessage = function (type, message, destinationNode, options) {
    /// <param name="type" type="String">Type of message</param>
    /// <param name="message">Message to send</param>
    /// <param name="destinationNode" type="Number">ID of destination node</param>
    /// <param name="options" type="Object" optional="true">{wantReply: Boolean, isFailure: Boolean, requestId: Number}. If wantReply, the returned promise will complete with the reply from remote. Otherwise it will complete when message has been successfully sent.</param>
    options = options || {};
    if (!mySyncNode.node)
      return options.wantReply ?
          Promise.reject(new Dexie.DatabaseClosedError()) :
          Promise.resolve(); // If caller doesn't want a reply, it won't catch errors either.

    var msg = {message: message, destinationNode: destinationNode, sender: mySyncNode.node.id, type: type};
    Dexie.extend(msg, options); // wantReply: wantReply, success: !isFailure, requestId: ...
    return Dexie.ignoreTransaction(()=> {
      var tables = ["_intercomm"];
      if (options.wantReply) tables.push("_syncNodes"); // If caller wants a reply, include "_syncNodes" in transaction to check that there's a receiver there. Otherwise, new master will get it.
      var promise = db.transaction('rw', tables, () => {
        if (options.wantReply) {
          // Check that there is a receiver there to take the request.
          return db._syncNodes.where('id').equals(destinationNode).count(receiverAlive => {
            if (receiverAlive)
              return db._intercomm.add(msg);
            else // If we couldn't find a node -> send to master
              return db._syncNodes.where('isMaster').above(0).first(function (masterNode) {
                msg.destinationNode = masterNode.id;
                return db._intercomm.add(msg)
              });
          });
        } else {
          // If caller doesn't need a response, we don't have to make sure that it gets one.
          return db._intercomm.add(msg);
        }
      }).then(messageId => {
        var rv = null;
        if (options.wantReply) {
          rv = new Promise(function (resolve, reject) {
            requestsWaitingForReply[messageId.toString()] = {resolve: resolve, reject: reject};
          });
        }
        if (localStorage) {
          localStorage.setItem("Dexie.Observable/intercomm/" + db.name, messageId.toString());
        }
        Observable.on.intercomm.fire(db.name);
        return rv;
      });

      if (!options.wantReply) {
        promise.catch(()=> {
        });
        return;
      } else {
        // Forward rejection to caller if it waits for reply.
        return promise;
      }
    });
  };

  // Send a message to all local _syncNodes
  db.observable.broadcastMessage = function (type, message, bIncludeSelf) {
    if (!mySyncNode.node) return;
    var mySyncNodeId = mySyncNode.node.id;
    Dexie.ignoreTransaction(()=> {
      db._syncNodes.toArray(nodes => {
        return Promise.all(nodes
            .filter(node => node.type === 'local' && (bIncludeSelf || node.id !== mySyncNodeId))
            .map(node => db.observable.sendMessage(type, message, node.id)));
      }).catch(()=> {
      });
    });
  };

  function consumeIntercommMessages() {
    // Check if we got messages:
    if (!mySyncNode.node) return Promise.reject(new Dexie.DatabaseClosedError());

    return Dexie.ignoreTransaction(()=> {
      return db.transaction('rw', '_intercomm', function() {
        return db._intercomm.where({destinationNode: mySyncNode.node.id}).toArray(messages => {
          messages.forEach(msg => consumeMessage(msg));
          return db._intercomm.where('id').anyOf(messages.map(msg => msg.id)).delete();
        });
      });
    });
  }

  function consumeMessage(msg) {
    if (msg.type === 'response') {
      // This is a response. Lookup pending request and fulfill its promise.
      var request = requestsWaitingForReply[msg.requestId.toString()];
      if (request) {
        if (msg.isFailure) {
          request.reject(msg.message.error);
        } else {
          request.resolve(msg.message.result);
        }
        delete requestsWaitingForReply[msg.requestId.toString()];
      }
    } else {
      // This is a message or request. Fire the event and add an API for the subscriber to use if reply is requested
      msg.resolve = function (result) {
        db.observable.sendMessage('response', {result: result}, msg.sender, {requestId: msg.id});
      };
      msg.reject = function (error) {
        db.observable.sendMessage('response', {error: error.toString()}, msg.sender, {isFailure: true, requestId: msg.id});
      };
      db.on.message.fire(msg);
    }
  }

  // Listener for 'intercomm' events
  // Gets fired when we get a 'storage' event from local storage or when sendMessage is called
  // 'storage' is used to communicate between tabs (sendMessage changes the localStorage to trigger the event)
  // sendMessage is used to communicate in the same tab and to trigger a storage event
  function onIntercomm(dbname) {
    // When storage event trigger us to check
    if (dbname === db.name) {
      consumeIntercommMessages().catch('DatabaseClosedError', ()=> {});
    }
  }

  return {
    onIntercomm,
    consumeIntercommMessages
  };
}
