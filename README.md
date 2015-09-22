Dexie.js
========

[![NPM Version][npm-image]][npm-url]

#### What is Dexie.js?
Dexie.js is a wrapper library for indexedDB.

#### Why is Dexie.js needed?
Dexie solves three main issues with the native IndexedDB API:

 1. Ambivalent error handling
 2. Poor queries
 3. Code complexity

Dexie.js solves these limitations and provides a neat database API. Dexie.js aims to be the first-hand choice of a IDB Wrapper Library due to its well thought-through API design, robust error handling, extendability, change tracking awareness and its extended KeyRange support (case insensitive search, set matches and OR operations).

#### Please Show me a Hello World Example

```js
//
// Declare Database
//
var db = new Dexie("FriendDatabase");
db.version(1).stores({ friends: "++id,name,age" });
db.open();

//
// Manipulate and Query Database
//
db.friends.add({name: "Josephine", age: 21}).then(function() {
    return db.friends.where("age").below(25).toArray();
}).then(function (youngFriends) {
    console.log("My young friends: " + JSON.stringify(youngFriends));
});
```


Documentation
-------------
[https://github.com/dfahlander/Dexie.js/wiki/Dexie.js](https://github.com/dfahlander/Dexie.js/wiki/Dexie.js)

Samples
-------
[https://github.com/dfahlander/Dexie.js/wiki/Samples](https://github.com/dfahlander/Dexie.js/wiki/Samples)

Forum
-----
[https://groups.google.com/forum/#!forum/dexiejs](https://groups.google.com/forum/#!forum/dexiejs)

Website
-------
[http://www.dexie.org](http://www.dexie.org)

Download
--------
[https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.js](https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.js)
[https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.min.js]([https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.min.js)
[https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.min.js.map]([https://raw.githubusercontent.com/dfahlander/Dexie.js/master/dist/latest/Dexie.min.js.map)
[https://raw.githubusercontent.com/dfahlander/Dexie.js/master/src/Dexie.d.ts]([https://raw.githubusercontent.com/dfahlander/Dexie.js/master/src/Dexie.d.ts)

[npm-image]: https://img.shields.io/npm/v/dexie.svg?style=flat
[npm-url]: https://npmjs.org/package/dexie


