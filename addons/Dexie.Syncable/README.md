# Dexie.Syncable.js

Enables two-way synchronization with remote database.

**NOTE: This addon is still in alpha development**

### Install
```
npm install dexie --save
npm install dexie-observable --save
npm install dexie-syncable --save
```

### Use
```js
import Dexie from 'dexie';
import 'dexie-syncable'; // will import dexie-observable as well.

// Use Dexie as normally - but you can also register your sync protocols though
// Dexie.Syncable.registerSyncProtocol() api as well as using the db.syncable api
// as documented here.

```

### Dependency Tree

 * **Dexie.Syncable.js**
   * [Dexie.Observable.js](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Observable.js)
     * [Dexie.js](https://github.com/dfahlander/Dexie.js/wiki/Dexie.js)
       * [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
   * _An implementation of [ISyncProtocol](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol)_
 
### Tutorial

#### 1. Include Required Sources
In your HTML, make sure to include Dexie.js, Dexie.Observable.js, Dexie.Syncable.js and an implementation of [ISyncProtocol](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol).

    <html><head>
        <script src="dexie.min.js"></script>
        <script src="dexie-observable.min.js"></script>
        <script src="dexie-syncable.min.js"></script>
        <script src="WebSocketSyncProtocol.js"></script> <!-- Example implementation of ISyncProtocol -->
        ...
    </head><body>
    </body></html>

#### 2. Use UUID based Primary Keys ($$)
Two way replication requires not to use auto-incremented keys if any sync node should be able to create objects no matter offline or online. Dexie.Syncable comes with a new syntax when defining your store schemas: the double-dollar prefix ($$). Similary to the ++ prefix in Dexie (meaining auto-incremented primary key), the double-dollar prefix means that the key will be given a universally unique identifier (UUID), in string format (For example "9cc6768c-358b-4d21-ac4d-58cc0fddd2d6").

    var db = new Dexie("MySyncedDB");
    db.version(1).stores({
        friends: "$$oid,name,shoeSize",
        pets: "$$oid,name,kind"
    });

#### 3. Connect to Server
You must specify the URL of the server you want to keep in-sync with. This has to be done once in the entire database life-time, but doing it on every startup is ok as well, since it wont affect already connected URLs.

    // This example uses the WebSocketSyncProtocol included in earlier steps.
    db.syncable.connect ("websocket", "https://syncserver.com/sync");
    db.syncable.on('statusChanged', function (newStatus, url) {
        console.log ("Sync Status changed: " + Dexie.Syncable.StatusTexts[newStatus]);
    });

#### 4. Use Your Database
Query and modify your database as if it was a simple Dexie instance. Any changes will be replicated to server and and change on server or other window will replicate back to you.

    db.transaction('rw', db.friends, function (friends) {
        friends.add({name: "Arne", shoeSize: 47});
        friends.where(shoeSize).above(40).each(function (friend) {
            console.log("Friend with shoeSize over 40: " + friend.name);
        });
    });

_NOTE: Transactions only provide the Atomicity part of the [ACID](http://en.wikipedia.org/wiki/ACID) properties when using 2-way syncronization. This is due to that the syncronization phase may result in that another change could override the changes. However, it's still meaningfull to use the transaction() since method for atomicity. Atomicity is guaranteed not only locally but also when synced to the server, meaning that a part of the changes will never commit on the server until all changes from the transaction has been synced. In practice, you cannot increment a counter in the database (for example) and expect it to be consistent, but you can be guaranteed that if you add a sequence of objects, all or none of them will replicate._

### API Reference

#### Static Members

[Dexie.Syncable.registerSyncProtocol (name, protocolInstance)](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.registerSyncProtocol())
Define how to replicate changes with your type of server.

[Dexie.Syncable.Statuses](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.Statuses)
Enum of possible sync statuses, such as OFFLINE, CONNECTING, ONLINE and ERROR.

[Dexie.Syncable.StatusTexts](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.StatusTexts)
Text lookup for status numbers

#### Non-Static Methods and Events

[db.syncable.connect (protocol, url, options)](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.connect())
Create a presistend a two-way sync connection with given URL.

[db.syncable.disconnect (url)](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.disconnect())
Stop syncing with given URL but keep revision states until next connect.

[db.syncable.delete(url)](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.delete())
Delete all states and change queue for given URL 

[db.syncable.list()](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.list())
List the URLs of each remote node we have a state saved for.

[db.syncable.on('statusChanged')](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.on('statusChanged'))
Event triggered when sync status changes.

[db.syncable.setFilter ([criteria], filter)](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.setFilter())
Ignore certain objects from being synced defined by given filter.

[db.syncable.getStatus (url)](https://github.com/dfahlander/Dexie.js/wiki/db.syncable.getStatus())
Get sync status for given URL.


### Source

[Dexie.Syncable.js](https://github.com/dfahlander/Dexie.js/blob/master/addons/Dexie.Syncable/src/Dexie.Syncable.js)

### Description

Dexie.Syncable enables syncronization with a remote database (of almost any kind). It has it's own API [ISyncProtocol](Dexie.Syncable.ISyncProtocol).
The [ISyncProtocol](https://github.com/dfahlander/Dexie.js/wiki/Dexie.Syncable.ISyncProtocol) is pretty straight-forward to implement.
The implementation of that API defines how client- and server- changes are transported between local and remote nodes. The API support both poll-patterns
(such as ajax calls) and direct reaction pattern (such as WebSocket or long-polling methods). See samples below for each pattern.

### Sample [ISyncProtocol](Dexie.Syncable.ISyncProtocol) Implementations
 * [AjaxSyncProtocol.js](https://github.com/dfahlander/Dexie.js/blob/master/samples/remote-sync/ajax/AjaxSyncProtocol.js)
 * [WebSocketSyncProtocol.js](https://github.com/dfahlander/Dexie.js/blob/master/samples/remote-sync/websocket/WebSocketSyncProtocol.js)

### Sample Sync Servers
 * [WebSocketSyncServer.js](https://github.com/dfahlander/Dexie.js/blob/master/samples/remote-sync/websocket/WebSocketSyncServer.js)
