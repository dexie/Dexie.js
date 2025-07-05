# Dexie.js

[![NPM Version][npm-image]][npm-url] ![Build Status](https://github.com/dexie/Dexie.js/actions/workflows/main.yml/badge.svg) [![Join our Discord](https://img.shields.io/discord/1328303736363421747?label=Discord&logo=discord&style=badge)](https://discord.gg/huhre7MHBF)

Dexie.js is a wrapper library for indexedDB - the standard database in the browser. https://dexie.org.

#### Why Dexie.js?

IndexedDB is the portable database for all browser engines. Dexie.js makes it fun and easy to work with.

But also:

* Dexie.js is widely used by 100,000 of web sites, apps and other projects and supports all browsers, Electron for Desktop apps, Capacitor for iOS / Android apps and of course pure PWAs.
* Dexie.js works around bugs in the IndexedDB implementations, giving a more stable user experience.
* It's an easy step to [make it sync](https://dexie.org/#sync).

#### Hello World (vanilla JS)

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      // Import Dexie
      import { Dexie } from 'https://unpkg.com/dexie/dist/modern/dexie.mjs';

      //
      // Declare Database
      //
      const db = new Dexie('FriendDatabase');
      db.version(1).stores({
        friends: '++id, age'
      });

      //
      // Play with it
      //
      try {
        await db.friends.add({ name: 'Alice', age: 21 });

        const youngFriends = await db.friends
            .where('age')
            .below(30)
            .toArray();

        alert(`My young friends: ${JSON.stringify(youngFriends)}`);
      } catch (e) {
        alert(`Oops: ${e}`);
      }
    </script>
  </head>
</html>
```

Yes, it's that simple. Read [the docs](https://dexie.org/docs/) to get into the details.

#### Hello World (legacy script tags)

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/dexie/dist/dexie.js"></script>
    <script>

      //
      // Declare Database
      //
      const db = new Dexie('FriendDatabase');
      db.version(1).stores({
        friends: '++id, age'
      });

      //
      // Play with it
      //
      db.friends.add({ name: 'Alice', age: 21 }).then(() => {
        return db.friends
          .where('age')
          .below(30)
          .toArray();
      }).then(youngFriends => {
        alert (`My young friends: ${JSON.stringify(youngFriends)}`);
      }).catch (e => {
        alert(`Oops: ${e}`);
      });

    </script>
  </head>
</html>
```

#### Hello World (React + Typescript)

Real-world apps are often built using components in various frameworks. Here's a version of Hello World written for React and Typescript. There are also links below this sample to more tutorials for different frameworks...

```tsx
import React from 'react';
import { Dexie, type EntityTable } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

// Typing for your entities (hint is to move this to its own module)
export interface Friend {
  id: number;
  name: string;
  age: number;
}

// Database declaration (move this to its own module also)
export const db = new Dexie('FriendDatabase') as Dexie & {
  friends: EntityTable<Friend, 'id'>;
};
db.version(1).stores({
  friends: '++id, age',
});

// Component:
export function MyDexieReactComponent() {
  const youngFriends = useLiveQuery(() =>
    db.friends
      .where('age')
      .below(30)
      .toArray()
  );

  return (
    <>
      <h3>My young friends</h3>
      <ul>
        {youngFriends?.map((f) => (
          <li key={f.id}>
            Name: {f.name}, Age: {f.age}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          db.friends.add({ name: 'Alice', age: 21 });
        }}
      >
        Add another friend
      </button>
    </>
  );
}
```

[Tutorials for React, Svelte, Vue, Angular and vanilla JS](https://dexie.org/docs/Tutorial/Getting-started)

[API Reference](https://dexie.org/docs/API-Reference)

[Samples](https://dexie.org/docs/Samples)

### Performance

Dexie has kick-ass performance. Its [bulk methods](<https://dexie.org/docs/Table/Table.bulkPut()>) take advantage of a lesser-known feature in IndexedDB that makes it possible to store stuff without listening to every onsuccess event. This speeds up the performance to a maximum.

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

## Dexie Cloud

[Dexie Cloud](https://dexie.org/cloud/) is a commercial offering that can be used as an add-on to Dexie.js. It syncs a Dexie database with a server and enables developers to build apps without having to care about backend or database layer else than the frontend code with Dexie.js as the sole database layer.

Source for a sample Dexie Cloud app: [Dexie Cloud To-do app](https://github.com/dexie/Dexie.js/tree/master/samples/dexie-cloud-todo-app)

See the sample Dexie Cloud app in action: https://dexie.github.io/Dexie.js/dexie-cloud-todo-app/

## Samples

https://dexie.org/docs/Samples

https://github.com/dexie/Dexie.js/tree/master/samples

## Knowledge Base

[https://dexie.org/docs/Questions-and-Answers](https://dexie.org/docs/Questions-and-Answers)

## Website

[https://dexie.org](https://dexie.org)

## Install via npm

```
npm install dexie
```

## Download

For those who don't like package managers, here's the download links:

### UMD (for legacy script includes as well as commonjs require):

https://unpkg.com/dexie@latest/dist/dexie.min.js

https://unpkg.com/dexie@latest/dist/dexie.min.js.map

### Modern (ES module):

https://unpkg.com/dexie@latest/dist/modern/dexie.min.mjs

https://unpkg.com/dexie@latest/dist/modern/dexie.min.mjs.map

### Typings:

https://unpkg.com/dexie@latest/dist/dexie.d.ts

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Build

```
pnpm install
pnpm run build
```

## Test

```
pnpm test
```

## Watch

```
pnpm run watch
```

<br/>

[![Browser testing via LAMDBATEST](https://dexie.org/assets/images/lambdatest2.png)](https://www.lambdatest.com/)

[npm-image]: https://img.shields.io/npm/v/dexie.svg?style=flat
[npm-url]: https://npmjs.org/package/dexie
