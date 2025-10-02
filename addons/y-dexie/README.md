Integration of Dexie.js and Y.js

## Install

```
npm install dexie
npm install yjs
npm install y-dexie
```

## Database Declaration

```ts
import { Dexie, EntityTable } from 'dexie';
import yDexie from 'y-dexie';
import type * as Y from 'yjs';

interface Friend {
  id: number;
  name: string;
  age: number;
  notes: Y.Doc;
}

const db = new Dexie('myDB', { addons: [yDexie] }) as Dexie & {
  friends: EntityTable<Friend, 'id'>
}

db.version(1).stores({
  friends: `
    ++id,
    name,
    age,
    notes: Y.Doc`, // each friend as a 'notes' document
});
```

When an Y.Doc property has been declared, every object will contain that property. It
will be there using a property at the prototype level. The physical `notes` property
is persisted in its own indexedDB table, unlike `name`, `id` and `age` which are
stored physically on the object.

Every time you retrieve a database object, its Y.Doc properties will be available. Y.Doc
properties can never be null or undefined. However, actual storage of the document data will not
be created until someone accesses the document and manipulates it.

## Basic Document Access

```ts
import { db } from './db.js';
import { DexieYProvider } from 'y-dexie';

// 1. Fetch an object
const friend = await db.friends.get(friendId);
// 2. Get a reference to the notes Y.Doc
const doc = friend.notes;
// 3. Aquire a DexieYProvider
const provider = DexieYProvider.load(doc);
// 4. Load the document
await provider.whenLoaded;

// Manipulate
doc.getText().insert(0, 'hello world');
doc.getMap('myMap').set('key', 'value');
...

// Read contents
const rootText = doc.getText(); // 'hello world'
const subMap = doc.getMap('myMap').get('key'); // 'value'

// 5. When done using the document, release it
DexieYProvider.release(doc); // Decreases ref-count and destroys doc if not accessed anymore.

```

## Using the `using` keyword (ES2023)

DexieYProvider supports the new `using` keyword available in Typescript and the most modern web frameworks:

```ts
using provider = DexieYProvider.load(doc);
await provider.whenLoaded;
...
```

The above line is equivalent to the following:

```ts
const provider = DexieYProvider.load(doc);
try {
  await provider.whenLoaded;
  ...
} finally {
  DexieYProvider.release(doc);
}
```

Notices:

DexieYProvider.load() and DexieYProvider.release() maintains a reference counter
on the document it loads and releases. When the reference count reaches zero, doc.destroy() is called on the Y.Doc instance.

Y.Doc properties are declared at prototype level - they are not own properties and not physically located on their host object.

Calling friend.notes twice will return the same Y.Doc instance unless the first one has been destroyed, then the second access will return a new Y.Doc instance representing the same document.

### Rules for Y properties on objects

* Y properties are never nullish. If declared in the dexie schema, they'll exist on all objects from all queries (toArray(), get() etc).
* Y properties are not `own properties`. They are set on the prototype of the returned object.
* Y properties are readonly but can be mutated using the [Y.Doc methods](https://docs.yjs.dev/api/y.doc).
* When adding new objects to a table (using table.add() or bulkAdd()), it's possible to create a new Y.Doc() instance - empty or with content - and put it on the property of the object being inserted to the database.
* If providing a custom Y.Doc to add() or bulkAdd() its udates will be cloned when added.
* If not providing the Y.Doc or setting the Y property to null when adding objects, there will still be an Y.Doc property on query results of the object, since Y props are defined by the schema and cannot be null or undefined.
* Y properties on dexie objects can only be mutated using the [Y.Doc methods](https://docs.yjs.dev/api/y.doc). The property itself is readonly. You cannot replace them with another document or update them using Table.update() or Collection.modify().
* Y properties are not loaded until using DexieYProvider.load() or the new react hook `useDocument()`
* Y.Doc instances are kept in a global cache integrated with FinalizationRegistry. First time you access the getter, it will be created, and will stay in cache until it's garbage collected. This means that you'll always get the same Y.Doc instance when querying the same Y property of a the same object. This holds true even if the there are multiple obj instances representing the same ID in the database. All of these will hold one single instance of the Y.Doc because the cache is connected to the primary key of the parent object.

### How it works

Internally, every declared Y property generates a dedicated table for Y.js updates tied to the parent table and the property name. Whenever a document is updated, a new entry in this table is added.

DexieYProvider is responsible of loading and observing updates in both directions.

### Integrations

Y.js allows multiple providers on the same document. It is possible to combine DexieYProvider with other providers, but it is also possible for dexie addons to extend the provider behavior - such as adding awareness and sync.

## Adding sync and awareness

The [dexie-cloud-addon](https://dexie.org/cloud/docs/dexie-cloud-addon) integrates with `y-dexie` and extends the existing DexieYProvider to become a provider also for sync and awareness. Just like other data, Y.Docs
will sync to Dexie Cloud Server. A websocket connection will propagate awareness
and updates between clients.

1. Create a dexie cloud database to sync with:

```
npx dexie-cloud create
```

2. Update database declaration to use dexieCloud addon:

```ts
import { Dexie } from 'dexie';
import yDexie from 'y-dexie';
import dexieCloud, { DexieCloudTable } from 'dexie-cloud-addon';
import type * as Y from 'yjs';

interface Friend {
  id: string;
  name: string;
  age: number;
  notes: Y.Doc;
}

const db = new Dexie('myDB', { addons: [yDexie, dexieCloud] }) as Dexie & {
  friends: DexieCloudTable<Friend, 'id'>
}

db.version(1).stores({
  friends: `
    @id,
    name,
    age,
    notes: Y.Doc`, // each friend as a 'notes' document
});

db.cloud.configure({
  databaseUrl: 'https://xxxxx.dexie.cloud' // Obtained from CLI: `npx dexie-cloud create`
});
```


## Using with React

New hook `useDocument()` makes use of DexieYProvider as a hook rather than loading and releasing imperatively.

```tsx

import { useLiveQuery, useDocument } from 'dexie-react-hooks';

function MyComponent(friendId: number) {
  // Query comment object:
  const friend = useLiveQuery(() => db.friends.get(friendId));

  // Use it's document property (friend is undefined on intial render)
  const provider = useDocument(friend?.notes);

  // Pass provider and document to some Y.js compliant code in the ecosystem of such (unless undefined)...
  return provider
    ? <NotesEditor doc={friend.notes} provider={provider} />
    : null;
}
```

In the sample above, the `NotesEditor` component could represent any react component backed
by the ecosystem of text editors supporting Y.js, such as TipTap or Prosemirror.

## Example Applications

### [Dexie Cloud Starter](https://github.com/dexie/dexie-cloud-starter)

This application showcases the following:

* Collaborative text editing with y-dexie and TipTap
* Sync and awareness with Dexie Cloud
* Full-text search with lunr
* Sharing and access control

### [Lkal.ma](https://lkal.ma/boards)

The winner of Dexie Cloud Hackathon 2025.

This application showcases the following:

* Collaborative drawing using TLDraw with Y.js
* Sync and awareness with Dexie Cloud
* Sharing and access control

### [To To Do](https://totodo.app)

A commercial ToDo application for iOS, Android and web built on top of
Dexie Cloud, Capacitor, Y.js, TipTap, ChatGPT and NextJS.

This application showcases the following:

* Collaborative task list sharing
* Notes taking with Y.js and TipTap
* Sharing and access control
* Native app bundling with Capacitor
* Smart AI suggestions
