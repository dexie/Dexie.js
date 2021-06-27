# Dexie.Observable.js

Observe changes to database - even when they happen in another browser window.

### Install
```
npm install dexie --save
npm install dexie-observable --save
```

### Use
```js
import Dexie from 'dexie';
import 'dexie-observable';

// Use Dexie as normally - but you can also subscribe to db.on('changes').

```

#### Usage with existing DB

In case you want to use Dexie.Observable with your existing database, you will have to do a schema upgrade. Without it Dexie.Observable will not be able to properly work.

```javascript
import Dexie from 'dexie';
import 'dexie-observable';

var db = new Dexie('myExistingDb');
db.version(1).stores(... existing schema ...);

// Now, add another version, just to trigger an upgrade for Dexie.Observable
db.version(2).stores({}); // No need to add / remove tables. This is just to allow the addon to install its tables.
```

### Dependency Tree

 * [Dexie.Syncable.js](http://dexie.org/docs/Syncable/Dexie.Syncable.js)
   * **Dexie.Observable.js**
     * [Dexie.js](http://dexie.org/docs/Dexie/Dexie.js)
       * [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Source

[Dexie.Observable.js](https://github.com/dfahlander/Dexie.js/blob/master/addons/Dexie.Observable/src/Dexie.Observable.js)

### Description

Dexie.Observable is an add-on to Dexie.js makes it possible to listen for changes on the database even if the changes are made in a foreign window. The addon provides a "storage" event for IndexedDB, much like the storage event (onstorage) for localStorage.

In contrary to the [Dexie CRUD hooks](http://dexie.org/docs/Tutorial/Design#the-crud-hooks-create-read-update-delete), this event reacts not only on changes made on the current db instance but also on changes occurring on db instances in other browser windows. <u>This enables a Web Apps to react to database changes and update their views accordingly.</u>

Dexie.Observable is also the base of [Dexie.Syncable.js](http://dexie.org/docs/Syncable//Dexie.Syncable.js) - an add-on that enables two-way replication with a remote server.

### Extended Methods, Properties and Events

#### UUID key generator
When defining your stores in [Version.stores()](http://dexie.org/docs/Version/Version.stores()) you may use the $$ (double dollar) prefix to your primary key. This will make it auto-generated to a UUID string. See sample below.

#### Dexie.Observable.createUUID()
A static method added to Dexie that creates a UUID. This method is used internally when using the $$ prefix to primary keys. To change the format of $$ primary keys, just override Dexie.createUUID by setting it to your desired function instead.

#### db.on('changes') event
Subscribe to any database changes no matter if they occur locally or in other browser window.

Parameters to your callback:

<table>
<tr><td>changes : Array&lt;<a href="http://dexie.org/docs/Observable/Dexie.Observable.DatabaseChange">DatabaseChange</a>&gt;</td><td>Array of changes that have occured in database (locally or in other window) since last time event was triggered, or the time of starting subscribing to changes.</td></tr>
<tr><td>partial: Boolean</td><td>True in case the array does not contain all changes. In this case, your callback will soon be called again with the additional changes and partial=false when all changes are delivered.</td></tr>
</table>

#### Example (here we're using plain ES6 script tags):
```html
<html>
    <head>
    <script src="dexie.min.js"></script>
    <script src="dexie-observable.min.js"></script> <!-- Enable DB observation -->
    <script>
        var db = new Dexie("ObservableTest");
        db.version(1).stores({
            friends: "$$uuid,name"
        });
        db.on('changes', function (changes) {
            changes.forEach(function (change) {
                switch (change.type) {
                    case 1: // CREATED
                        console.log('An object was created: ' + JSON.stringify(change.obj);
                        break;
                    case 2: // UPDATED
                        console.log('An object with key ' + change.key + ' was updated with modifications: ' + JSON.stringify(change.mods));
                        break;
                    case 3: // DELETED
                        console.log('An object was deleted: ' + JSON.stringify(change.oldObj);
                        break;
            });
        });
        db.open();
        // Make an initial put() - will result in a CREATE-change:
        db.friends.put({name: "Kalle"}).then(function(primKey) {
            // Call put() with existing primary key - will result in an UPDATE-change:
            db.friends.put({uuid: primKey, name: "Olle"}).then (function () {
                // Call delete() will result in a DELETE-change:
                db.friends.delete(primKey);
            });
        });

        // Result that will be logged:
        // An object was created: {"uuid": "23bada36-d27a-4e78-a978-1ab3c4129cd0", name: "Kalle"}
        // An object with key: 23bada36-d27a-4e78-a978-1ab3c4129cd0 was updated with modifications: {"name": "Olle"}
        // An object was deleted: {"uuid": "23bada36-d27a-4e78-a978-1ab3c4129cd0", name: "Olle"}
    </script>
    </head>
    <body>
    </body>
</html>
```
