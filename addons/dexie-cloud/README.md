The web client for [Dexie Cloud](https://dexie.org/cloud/).

## Getting started

```
npm install dexie@latest
npm install dexie-cloud-addon@latest
```

```ts
import { Dexie } from 'dexie';
import dexieCloud, { type DexieCloudTable } from 'dexie-cloud-addon';
import { v7 as uuidv7 } from 'uuid'; // for creating performant, unique uuids

// YJS documents (optional)
import yDexie from 'y-dexie';
import type * as Y from 'yjs';

const db = new Dexie('dbname', { addons: [dexieCloud] }) as Dexie & {
  yourTable: DexieCloudTable<YourItem, 'id'>
}

interface YourItem {
  id: string
  foo: number
  bar: boolean
  myBlob: Blob
  myYDoc: Y.Doc
  ...
}

db.version(1).stores({
  yourTable: `
    id,
    foo,
    myYDoc:Y.Doc
  `,
});

db.cloud.configure({
  databaseUrl: 'https://<yourdb>.dexie.cloud',
});

// Add new rows:
await db.yourTable.add({
  id: uuidv7(),
  foo: 1,
  bar: true,
  myBlob: new Blob(["hello world"]),
  myYDoc: new Y.Doc()
});

// Query: See https://dexie.org/docs/API-Reference#query-items

// Update individual fields:
await db.yourTable.update(existingId, { foo: 2 });

// Update or add new if missing:
await db.yourTable.upsert(existingId, { foo: 2, bar: true, myBlob: new Blob()})

// Sync-consistent where...delete():
await db.yourTable.where({foo: 2}).delete();

// Sync-consistent where...modify():
await db.yourTable.where({foo: 3}).modify({bar: false});

// Sync-consistent addition and subtraction:
import { add, remove } from 'dexie';
// increment foo in sync-consistent manner
await db.yourTable.update(existingId, { foo: add(1) })
// dedrement foo in sync-consistent manner
await db.yourTable.update(existingId, { foo: remove(1) })

// See also: https://dexie.org/docs/cloud/consistency

```

## See also

https://dexie.org/cloud/docs/dexie-cloud-addon#api

## Obtaining a database URL

Run the following command in a console / terminal:

```
npx dexie-cloud create
```

See also https://dexie.org/cloud/#getting-started

_Having problems getting started, please [file an issue](https://github.com/dexie/Dexie.js/issues/new)_

# The Cloud Service

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/jist.svg)](https://www.dexie-cloud-status.com)

The official production service for Dexie Cloud Server is forever free of charge so you do not need to install any server to get started. The free service has some limits, see https://dexie.org/cloud/pricing

# On-Prem version

Dexie Cloud Server is a closed source software that can be purchased and installed on own hardware, see [On-Prem Silver / On-Prem Gold](https://dexie.org/cloud/pricing)

# CLI

See https://dexie.org/cloud/docs/cli

# APIs

See https://dexie.org/cloud/docs/dexie-cloud-api
