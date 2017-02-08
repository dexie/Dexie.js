Dexie.js
========

[![NPM Version][npm-image]][npm-url] [![Build Status](https://travis-ci.org/dfahlander/Dexie.js.svg?branch=master)](https://travis-ci.org/dfahlander/Dexie.js)[![Tested with Browserstack](http://dexie.org/assets/images/tested-with-browserstack2.png)](https://www.browserstack.com)

Dexie.js is a wrapper library for indexedDB - the standard database in the browser. http://dexie.org

#### Why?
Dexie solves three main issues with the native IndexedDB API:

 1. Ambivalent error handling
 2. Poor queries
 3. Code complexity

Dexie provides a neat database API with a well thought-through API design, robust error handling, extendability, change tracking awareness and extended KeyRange support (case insensitive search, set matches and OR operations).

#### Hello World

```html
<!doctype html>
<html>
 <head>
  <script src="https://unpkg.com/dexie@latest/dist/dexie.js"></script>
  <script>
   //
   // Declare Database
   //
   var db = new Dexie("FriendDatabase");
   db.version(1).stores({
     friends: "++id,name,age"
   });

   //
   // Manipulate and Query Database
   //
   db.friends.add({name: "Josephine", age: 21}).then(function() {
       return db.friends.where("age").below(25).toArray();
   }).then(function (youngFriends) {
       alert ("My young friends: " + JSON.stringify(youngFriends));
   }).catch(function (e) {
       alert ("Error: " + (e.stack || e));
   });
  </script>
 </head>
</html>
```
Yes, it's that simple.

[Tutorial](http://dexie.org/docs/Tutorial)

[API Reference](http://dexie.org/docs/API-Reference)

[Samples](http://dexie.org/docs/Samples)

### Performance

Dexie has a kick-ass performance. It's [bulk methods](http://dexie.org/docs/Table/Table.bulkPut()) take advantage of a not well known feature in indexedDB that makes it possible to store stuff without listening to every onsuccess event. This speeds up the performance to a maximum.

#### Supported operations
```js
above(key): Collection;
aboveOrEqual(key): Collection;
add(item, key?): Promise;
and(filter: (x) => boolean): Collection;
anyOf(keys[]): Collection;
anyOfIgnoreCase(keys: string[]): Collection;
below(key): Collection;
belowOrEqual(key): Collection;
between(lower, upper, includeLower?, includeUpper?): Collection;
bulkAdd(items: Array): Promise;
bulkDelete(keys: Array): Promise;
bulkPut(items: Array): Promise;
clear(): Promise;
count(): Promise;
delete(key): Promise;
distinct(): Collection;
each(callback: (obj) => any): Promise;
eachKey(callback: (key) => any): Promise;
eachPrimaryKey(callback: (key) => any): Promise;
eachUniqueKey(callback: (key) => any): Promise;
equals(key): Collection;
equalsIgnoreCase(key): Collection;
filter(fn: (obj) => boolean): Collection;
first(): Promise;
get(key): Promise;
inAnyRange(ranges): Collection;
keys(): Promise;
last(): Promise;
limit(n: number): Collection;
modify(changeCallback: (obj: T, ctx:{value: T}) => void): Promise;
modify(changes: { [keyPath: string]: any } ): Promise;
noneOf(keys: Array): Collection;
notEqual(key): Collection;
offset(n: number): Collection;
or(indexOrPrimayKey: string): WhereClause;
orderBy(index: string): Collection;
primaryKeys(): Promise;
put(item: T, key?: Key): Promise;
reverse(): Collection;
sortBy(keyPath: string): Promise;
startsWith(key: string): Collection;
startsWithAnyOf(prefixes: string[]): Collection;
startsWithAnyOfIgnoreCase(prefixes: string[]): Collection;
startsWithIgnoreCase(key: string): Collection;
toArray(): Promise;
toCollection(): Collection;
uniqueKeys(): Promise;
until(filter: (value) => boolean, includeStopEntry?: boolean): Collection;
update(key: Key, changes: { [keyPath: string]: any }): Promise;
```
This is a mix of methods from [WhereClause](http://dexie.org/docs/WhereClause/WhereClause), [Table](http://dexie.org/docs/Table/Table) and [Collection](http://dexie.org/docs/Collection/Collection). Dive into the [API reference](http://dexie.org/docs/API-Reference) to see the details.

#### Hello World (ES2015 / ES6)

This sample shows how to use Dexie with ES6 compliant environments and npm module resolution. With ES6, the `yield` keyword can be  used instead of calling `.then()` on every database operation. The `yield` keyword and generator functions are already supported today (March 2016) in Chrome, Firefox, Edge and Opera without a transpiler (though this example also uses import statements which still needs transpilation). Dive into this? Read **[SIMPLIFY WITH YIELD](http://dexie.org/docs/Simplify-with-yield)**!

```js
import Dexie from 'dexie';

//
// Declare Database
//
let db = new Dexie("FriendDatabase");
db.version(1).stores({ friends: "++id,name,age" });

//
// Have Fun
//
db.transaction('rw', db.friends, function*() {

    // Make sure we have something in DB:
    if ((yield db.friends.where('name').equals('Josephine').count()) === 0) {
        let id = yield db.friends.add({name: "Josephine", age: 21});
        alert (`Addded friend with id ${id}`);
    }

    // Query:
    let youngFriends = yield db.friends.where("age").below(25).toArray();

    // Show result:
    alert ("My young friends: " + JSON.stringify(youngFriends));

}).catch(e => {
    alert(e.stack || e);
});
```
*NOTE: db.transaction() will treat generator functions (function * ) so that it is possible to use `yield` for consuming promises. [Yield can be used outside transactions as well](http://dexie.org/docs/Simplify-with-yield).*

#### Hello World (ES2016 / ES7)
```js
import Dexie from 'dexie';

//
// Declare Database
//
var db = new Dexie("FriendDatabase");
db.version(1).stores({ friends: "++id,name,age" });

db.transaction('rw', db.friends, async() => {

    // Make sure we have something in DB:
    if ((await db.friends.where('name').equals('Josephine').count()) === 0) {
        let id = await db.friends.add({name: "Josephine", age: 21});
        alert (`Addded friend with id ${id}`);
    }

    // Query:
    let youngFriends = await db.friends.where("age").below(25).toArray();

    // Show result:
    alert ("My young friends: " + JSON.stringify(youngFriends));

}).catch(e => {
    alert(e.stack || e);
});

```

#### Hello World (Typescript)

*This sample requires using Dexie v2, `npm install dexie@^2.0.0-beta`*

```js
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
        super("FriendDatabase");
        this.version(1).stores({
            friends: "++id,name,age"
        });
    }
}

var db = new FriendDatabase();

db.transaction('rw', db.friends, async() => {

    // Make sure we have something in DB:
    if ((await db.friends.where('name').equals('Josephine').count()) === 0) {
        let id = await db.friends.add({name: "Josephine", age: 21});
        alert (`Addded friend with id ${id}`);
    }

    // Query:
    let youngFriends = await db.friends.where("age").below(25).toArray();

    // Show result:
    alert ("My young friends: " + JSON.stringify(youngFriends));

}).catch(e => {
    alert(e.stack || e);
});
```

Samples
-------
http://dexie.org/docs/Samples

https://github.com/dfahlander/Dexie.js/tree/master/samples

Knowledge Base
-----
[http://dexie.org/docs/Questions-and-Answers](http://dexie.org/docs/Questions-and-Answers)

Website
-------
[http://dexie.org](http://dexie.org)

Install over npm
----------------
```
npm install dexie@^2.0.0-beta
```


Download
--------
For those who don't like package managers, here's the download links:

https://unpkg.com/dexie@^2.0.0-beta/dist/dexie.js

https://unpkg.com/dexie@^2.0.0-beta/dist/dexie.js.map

https://unpkg.com/dexie@^2.0.0-beta/dist/dexie.d.ts


Contributing
============
Here is a little cheat-sheet for how to symlink your app's `node_modules/dexie` to a place where you can edit the source, version control your changes and create pull requests back to Dexie. Assuming you've already ran `npm install dexie --save` for the app your are developing.

1. Fork Dexie.js from the web gui on github
2. Clone your fork locally by launching a shell/command window and cd to a neutral place (like `~repos/`, `c:\repos` or whatever)
3. Run the following commands:

    ```
    git clone https://github.com/YOUR-USERNAME/Dexie.js.git dexie
    cd dexie
    npm install
    npm run build
    npm link
    ```
3. cd to your app directory and write:
    ```
    npm link dexie
    ```

Your app's `node_modules/dexie/` is now sym-linked to the Dexie.js clone on your hard drive so any change you do there will propagate to your app. Build dexie.js using `npm run build` or `npm run watch`. The latter will react on any source file change and rebuild the dist files.

That's it. Now you're up and running to test and commit changes to files under dexie/src/* or dexie/test/* and the changes will instantly affect the app you are developing.

Pull requests are more than welcome. Some advices are:

* Run npm test before making a pull request.
* If you find an issue, a unit test that reproduces it is lovely ;). If you don't know where to put it, put it in `test/tests-misc.js`. We use qunit. Just look at existing tests in `tests-misc.js` to see how they should be written. Tests are transpiled in the build script so you can use ES6 if you like.

Build
-----
```
npm install
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
