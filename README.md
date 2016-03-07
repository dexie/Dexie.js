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
https://github.com/dfahlander/Dexie.js/wiki/Samples

https://github.com/dfahlander/Dexie.js/tree/master/samples

Forum
-----
[https://groups.google.com/forum/#!forum/dexiejs](https://groups.google.com/forum/#!forum/dexiejs)

Website
-------
[http://dexie.org](http://dexie.org)

Download
--------
https://npmcdn.com/dexie/dist/dexie.min.js
https://npmcdn.com/dexie/dist/dexie.min.js.map
https://npmcdn.com/dexie/dist/dexie.d.ts

[npm-image]: https://img.shields.io/npm/v/dexie.svg?style=flat
[npm-url]: https://npmjs.org/package/dexie

