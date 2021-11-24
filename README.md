Dexie.js
========

[![NPM Version][npm-image]][npm-url] [![Build Status](https://travis-ci.com/dfahlander/Dexie.js.svg?branch=master)](https://travis-ci.com/dfahlander/Dexie.js)[![Tested with Browserstack](https://dexie.org/assets/images/tested-with-browserstack2.png)](https://www.browserstack.com)

Dexie.js is a wrapper library for indexedDB - the standard database in the browser. https://dexie.org

#### Why?
Dexie solves three main issues with the native IndexedDB API:

 1. Ambiguous error handling
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

An equivalent modern version (works in all modern browsers):

```html
<!doctype html>
<html>
 <head>
  <script type="module">
   import Dexie from "https://unpkg.com/dexie@latest/dist/modern/dexie.mjs";
   //
   // Declare Database
   //
   const db = new Dexie("FriendDatabase");
   db.version(1).stores({
     friends: "++id,name,age"
   });

   //
   // Manipulate and Query Database
   //
   try {
     await db.friends.add({name: "Josephine", age: 21});
     const youngFriends = await db.friends.where("age").below(25).toArray();
     alert (`My young friends: ${JSON.stringify(youngFriends)}`);
   } catch (e) {
     alert (`Error: ${e}`);
   }
  </script>
 </head>
</html>
```

[Tutorial](https://dexie.org/docs/Tutorial)

[API Reference](https://dexie.org/docs/API-Reference)

[Samples](https://dexie.org/docs/Samples)

### Performance

Dexie has kick-ass performance. Its [bulk methods](https://dexie.org/docs/Table/Table.bulkPut()) take advantage of a lesser-known feature in IndexedDB that makes it possible to store stuff without listening to every onsuccess event. This speeds up the performance to a maximum.

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
This is a mix of methods from [WhereClause](https://dexie.org/docs/WhereClause/WhereClause), [Table](https://dexie.org/docs/Table/Table) and [Collection](https://dexie.org/docs/Collection/Collection). Dive into the [API reference](https://dexie.org/docs/API-Reference) to see the details.

#### Hello World (Typescript)

```js
import Dexie, { Table } from 'dexie';

interface Friend {
    id?: number;
    name?: string;
    age?: number;
}

//
// Declare Database
//
class FriendDatabase extends Dexie {
    public friends!: Table<Friend, number>; // id is number in this case

    public constructor() {
        super("FriendDatabase");
        this.version(1).stores({
            friends: "++id,name,age"
        });
    }
}

const db = new FriendDatabase();

db.transaction('rw', db.friends, async() => {

    // Make sure we have something in DB:
    if ((await db.friends.where({name: 'Josephine'}).count()) === 0) {
        const id = await db.friends.add({name: "Josephine", age: 21});
        alert (`Addded friend with id ${id}`);
    }

    // Query:
    const youngFriends = await db.friends.where("age").below(25).toArray();

    // Show result:
    alert ("My young friends: " + JSON.stringify(youngFriends));

}).catch(e => {
    alert(e.stack || e);
});
```

Samples
-------
https://dexie.org/docs/Samples

https://github.com/dfahlander/Dexie.js/tree/master/samples

Knowledge Base
-----
[https://dexie.org/docs/Questions-and-Answers](https://dexie.org/docs/Questions-and-Answers)

Website
-------
[https://dexie.org](https://dexie.org)

Install over npm
----------------
```
npm install dexie
```


Download
--------
For those who don't like package managers, here's the download links:

### Legacy:
https://unpkg.com/dexie@latest/dist/dexie.min.js

https://unpkg.com/dexie@latest/dist/dexie.min.js.map

### Modern:
https://unpkg.com/dexie@latest/dist/modern/dexie.min.mjs

https://unpkg.com/dexie@latest/dist/modern/dexie.min.mjs.map

### Typings:
https://unpkg.com/dexie@latest/dist/dexie.d.ts



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
