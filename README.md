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

#### Hello World (Typescript)

Here's the simples typescript sample from Dexie.js/samples/typescript-simple:

```ts
import Dexie from 'dexie';

interface IFriend {
    id?: number;
    name?: string;
    age?: number;
}

//
// Declare Database
//
class FriendDatabase extends Dexie {
    friends: Dexie.Table<IFriend,number>;
    
    constructor() {
        super("FriendsDatabase");
        this.version(1).stores({
            friends: "++id,name,age"
        });
    }
}

var db = new FriendDatabase();

//
// Manipulate and Query Database
//
db.friends.add({name: "Josephine", age: 21}).then(()=>{
    return db.friends.where("age").below(25).toArray();
}).then(youngFriends => {
    alert ("My young friends: " + JSON.stringify(youngFriends));
}).catch(e => {
    alert("error: " + e.stack || e);
});

```
To see this in action, clone Dexie and cd to samples/typescript-simple. Then type:

```
npm install
npm run build
num run start
``` 
... and launch web browser to http://localhost:8081


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

Download
--------
For those who don't like package managers, here's the download links:

https://npmcdn.com/dexie/dist/dexie.min.js

https://npmcdn.com/dexie/dist/dexie.min.js.map

https://npmcdn.com/dexie/dist/dexie.d.ts


Contributing
============
Here is a little cheat-sheet for how to symlink your app's `node_modules/dexie` to a place where you can edit the source, version control your changes and create pull requests back to Dexie. Assuming you've already ran `npm install dexie --save` for the app your are developing.

1. Fork Dexie.js from the web gui on github
2. Clone your fork locally by launching a shell/command window and cd to a neutral place (like `~repos/`, `c:\repos` or whatever) and type:

    ```
    git clone https://github.com/YOUR-USERNAME/Dexie.js.git
    cd Dexie.js
    npm install
    npm run build
    npm link
    ```
3. cd to your app directory and write:
    ```
    npm link dexie
    ```

Your app's `node_modules/dexie/` is now sym-linked to the Dexie.js clone on your hard drive so any change you do there will propagate to your app. Build dexie.js using `npm run build` or `npm run watch`. The latter will react on any source file change and rebuild the dist files.

That's it. Now you're up and running to test and commit changes to Dexie.js that will instantly affect the app you are developing.

Pull requests are more than welcome. Some advices are:

* Run npm test before making a pull request.
* If you find an issue, a unit test that reproduces it is lovely ;). If you don't know where to put it, put it in `test/tests-misc.js`. We use qunit. Just look at existing tests in `tests-misc.js` to see how they should be written. Tests are transpiled in the build script so you can use ES6 if you like.

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


[npm-image]: https://img.shields.io/npm/v/dexie.svg?style=flat
[npm-url]: https://npmjs.org/package/dexie
