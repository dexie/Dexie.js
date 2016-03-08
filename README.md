Dexie.js
========

[![NPM Version][npm-image]][npm-url]

#### What is Dexie.js?
Dexie.js is a wrapper library for indexedDB - the standard database in the browser.

#### Why is Dexie.js needed?
Dexie solves three main issues with the native IndexedDB API:

 1. Ambivalent error handling
 2. Poor queries
 3. Code complexity

Dexie.js solves these limitations and provides a neat database API. Dexie.js aims to be the first-hand choice of a IDB Wrapper Library due to its well thought-through API design, robust error handling, extendability, change tracking awareness and its extended KeyRange support (case insensitive search, set matches and OR operations).

#### Hello World

```html
<html>
 <head>
  <script src="https://npmcdn.com/dexie/dist/dexie.min.js"></script>
  <script>
   //
   // Declare Database
   //
   var db = new Dexie("FriendDatabase");
   db.version(1).stores({ friends: "++id,name,age" });
   
   //
   // Manipulate and Query Database
   //
   db.friends.add({name: "Josephine", age: 21}).then(function() {
       return db.friends.where("age").below(25).toArray();
   }).then(function (youngFriends) {
       alert ("My young friends: " + JSON.stringify(youngFriends));
   }).catch(function (e) {
       alert ("Error: " + e.stack || e);
   });
  </script>
 </head>
</html>
```

#### Hello World (ES6)
```js
import Dexie from 'dexie';

//
// Declare Database
//
var db = new Dexie("FriendDatabase");
db.version(1).stores({ friends: "++id,name,age" });

//
// Manipulate and Query Database
//
Dexie.spawn(function*(){

    // Dexie.spawn gives you the possibility to use yield.
    // Use yield like async works in Typescript / ES7
    
    // Add to database
    yield db.friends.add({name: "Josephine", age: 21});
    
    // Query database
    let youngFriends = yield db.friends.where("age").below(25).toArray();
    
    alert ("My young friends: " + JSON.stringify(youngFriends));
    
}).catch(e => {
    alert("error: " + e.stack || e);
});
```

#### Hello World (Typescript / ES7)
```ts
import Dexie from 'dexie';

//
// Declare Database
//
var db = new Dexie("FriendDatabase");
db.version(1).stores({ friends: "++id,name,age" });

//
// Manipulate and Query Database
//
async function helloWorld () {

    // Dexie.spawn gives you the possibility to use yield.
    // Use yield like async works in Typescript / ES7
    
    // Add to database
    await db.friends.add({name: "Josephine", age: 21});
    
    // Query database
    let youngFriends = await db.friends.where("age").below(25).toArray();
    
    alert ("My young friends: " + JSON.stringify(youngFriends));
    
});

helloWorld().catch(e => {
    alert("error: " + e.stack || e);
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

Install over npm
----------------
```
npm install dexie
```

Contributing
============
Contributions are welcome! Here is a little cheat-sheet for how to get started. Assuming you've already ran `npm install dexie --save` for the app your are developing.

```
git clone https://github.com/dfahlander/Dexie.js.git
cd Dexie.js
npm install
npm run build
npm link
npm run watch
```
Source code is now watching for changes to Dexie.js/src directory. Let this shell be active in the background.
Then CD to your app directory and write:
```
npm link dexie
```
That's it.
Now you're up and running to test and commit changes to Dexie.js that will instantly affect the app you are developing.

*DISCLAIMBER: Before you pull-request, please make sure to run npm test first.*

Build
-----
```
npm run build
```

Test
----
```
npm test
```

Watch
-----
```
npm run watch
```

Download
--------
https://npmcdn.com/dexie/dist/dexie.min.js

https://npmcdn.com/dexie/dist/dexie.min.js.map

https://npmcdn.com/dexie/dist/dexie.d.ts



[npm-image]: https://img.shields.io/npm/v/dexie.svg?style=flat
[npm-url]: https://npmjs.org/package/dexie

