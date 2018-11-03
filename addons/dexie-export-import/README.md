# Export and Import IndexedDB Database

Export / Import IndexedDB <---> Blob

This module extends 'dexie' module with new methods for importing / exporting databases to / from blobs.

# Install
```
npm install dexie
npm install dexie-export-import
```

# Usage

Here's the basic usage. There's a lot you can do by supplying optional `[options]` arguments. The available options are described later on in this README (See Typescript interfaces below).

*NOTE:* Typescript users using dexie@2.x will get compilation errors if using the static import method `Dexie.import()`. 

```js
import Dexie from "dexie";
import "dexie-export-import";

//
// Import from Blob or File to Dexie instance:
//
const db = await Dexie.import(blob, [options]);

//
// Export to Blob
//
const blob = await db.export([options]);

//
// Import from Blob or File to existing Dexie instance
//
await db.import(blob, [options]);

```

# Sample

[Here's a working sample](https://codepen.io/dfahlander/pen/RqwoaB/) on CodePen. It uses [downloadjs](https://www.npmjs.com/package/downloadjs) to deliver the blob as a "file download" to the user. For receiving an import file, it uses a drop area where you can drop your JSON file. Click the Console tab in the bottom to see what progressCallbacks receive.

Even though this sample doesn't show it, blobs can also be sent or retrieved to/from a server, using the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). 

# Features

* Export of IndexedDB Database to JSON Blob.
* Import from Blob back to IndexedDB Database.
* An import Blob can be retrieved from an URL (using fetch()) or from a user-input file (dropped or browsed to).
* An export Blob can be either given end-user to be stored in Downloaded Files, or be send to a server over HTTP(S) using fetch().
* Chunk-wise / Streaming - does not read the entire DB into RAM
* Progress callback (typically for showing progress bar)
* Optional filter allows to import/export subset of data
* Support for all structured clonable exotic types (Date, ArrayBuffer, Blob, etc) except CryptoKeys (which by design cannot be exported)
* Atomic - import / export within one database transaction (optional)
* Export speed: Using getAll() in chunks rather than openCursor().
* Import speed: Using bulkPut() in chunks rather than put().
* Can well be run from a Web Worker (better speed + doesn't lock GUI).
* Can also export IndexedDB databases that was not created with Dexie.

# Compatibility

| Product | Supported versions        |
| ------- | ------------------------- |
| dexie   | ^2.0.4 or ^3.0.0-alpha.5  |
| Safari  | ^10.1                     |
| IE      | 11                        |
| Edge    | any version               |
| Chrome  | any version               |
| FF      | any version               |

# Similar Libraries
## [indexeddb-export-import](https://github.com/Polarisation/indexeddb-export-import)
 
Much smaller in size, but also much lighter than dexie-export-import.

[Indexeddb-export-import](https://github.com/Polarisation/indexeddb-export-import) can be better choice if:

* your data contains no Dates, ArrayBuffers, TypedArrays or Blobs (only objects, strings, numbers, booleans and arrays).
* your database is small enough to fit in RAM on your target devices.

Dexie-export-import was build to scale when exporting large databases without consuming much RAM. It does also support importing/exporting exotic types.

# Interface

Importing this module will extend Dexie and Dexie.prototype as follows.
Even though this is conceptually a Dexie.js addon, there is no addon instance.
Extended interface is done into Dexie and Dexie.prototype as a side effect when
importing the module.

```ts
//
// Extend Dexie interface (typescript-wise)
//
declare module 'dexie' {
  // Extend methods on db
  interface Dexie {
    export(options?: ExportOptions): Promise<Blob>;
    import(blob: Blob, options?: ImportOptions): Promise<void>;
  }
  interface DexieConstructor {
    import(blob: Blob, options?: StaticImportOptions): Promise<Dexie>;
  }
}
```

## StaticImportOptions and ImportOptions

These are the interfaces of the `options` optional arguments to Dexie.import() and Dexie.prototype.import(). All options are optional and defaults to undefined (falsy).

```ts
export interface StaticImportOptions {
  noTransaction?: boolean;
  chunkSizeBytes?: number; // Default: DEFAULT_KILOBYTES_PER_CHUNK ( 1MB )
  filter?: (table: string, value: any, key?: any) => boolean;
  progressCallback?: (progress: ImportProgress) => boolean;
}

export interface ImportOptions extends StaticImportOptions {
  acceptMissingTables?: boolean;
  acceptVersionDiff?: boolean;
  acceptNameDiff?: boolean;
  acceptChangedPrimaryKey?: boolean;
  overwriteValues?: boolean;
  clearTablesBeforeImport?: boolean;
  noTransaction?: boolean;
  chunkSizeBytes?: number; // Default: DEFAULT_KILOBYTES_PER_CHUNK ( 1MB )
  filter?: (table: string, value: any, key?: any) => boolean;
  progressCallback?: (progress: ImportProgress) => boolean;
}

```

## ImportProgress

This is the interface sent to the progressCallback.

```ts
export interface ImportProgress {
  totalTables: number;
  completedTables: number;
  totalRows: number;
  completedRows: number;
  done: boolean;
}
``` 

## ExportOptions

This is the interface of the `options` optional arguments to Dexie.prototype.export(). All options are optional and defaults to undefined (falsy).

```ts
export interface ExportOptions {
  noTransaction?: boolean;
  numRowsPerChunk?: number;
  prettyJson?: boolean;
  filter?: (table: string, value: any, key?: any) => boolean;
  progressCallback?: (progress: ExportProgress) => boolean;
}
```

## ExportProgress

This is the interface sent to the ExportOptions.progressCallback.

```ts
export interface ExportProgress {
  totalTables: number;
  completedTables: number;
  totalRows: number;
  completedRows: number;
  done: boolean;
}
```

## Defaults

These are the default chunk sizes used when not specified in the options object. We allow quite large chunks, but still not that large (1MB RAM is not much even for a small device).

```ts
const DEFAULT_KILOBYTES_PER_CHUNK = 1024; // When importing blob
const DEFAULT_ROWS_PER_CHUNK = 2000; // When exporting db
```

# JSON Format

The JSON format is described in the Typescript interface below. This JSON format is streamable as it is generated
in a streaming fashion, and imported also using a streaming fashion. Therefore, it is important that the data come
last in the file.

```ts
export interface DexieExportJsonStructure {
  formatName: 'dexie';
  formatVersion: 1;
  data: {
    databaseName: string;
    databaseVersion: number;
    tables: Array<{
      name: string;
      schema: string; // '++id,name,age'
      rowCount: number;
    }>;
    data: Array<{ // This property must be last (for streaming purpose)
      tableName: string;
      inbound: boolean;
      rows: any[]; // This property must be last (for streaming purpose)
    }>;
  }
}
```

## Example JSON File

```json
{
  "formatName": "dexie",
  "formatVersion": 1,
  "data": {
    "databaseName": "dexie-export-import-basic-tests",
    "databaseVersion": 1,
    "tables": [
      {
        "name": "outbound",
        "schema": "",
        "rowCount": 2
      },
      {
        "name": "inbound",
        "schema": "++id",
        "rowCount": 3
      }
    ],
    "data": [{
      "tableName": "outbound",
      "inbound": false,
      "rows": [
        [
          1,
          {
            "foo": "bar"
          }
        ],
        [
          2,
          {
            "bar": "foo"
          }
        ]
      ]
    },{
      "tableName": "inbound",
      "inbound": true,
      "rows": [
        {
          "id": 1,
          "date": 1,
          "fullBlob": {
            "type": "",
            "data": "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w=="
          },
          "binary": {
            "buffer": "AQID",
            "byteOffset": 0,
            "length": 3
          },
          "text": "foo",
          "bool": false,
          "$types": {
            "date": "date",
            "fullBlob": "blob2",
            "binary": "uint8array2",
            "binary.buffer": "arraybuffer"
          }
        },
        {
          "id": 2,
          "foo": "bar"
        },
        {
          "id": 3,
          "bar": "foo"
        }
      ]
    }]
  }

```

# Exporting IndexedDB Databases that wasn't generated with Dexie
As Dexie can dynamically open non-Dexie IndexedDB databases, this is not an issue.
Sample provided here:

```js
import Dexie from 'dexie';
import 'dexie-export-import';

async function exportDatabase(databaseName) {
  const db = await new Dexie(databaseName).open();
  const blob = await db.export();
  return blob;
}

async function importDatabase(file) {
  const db = await Dexie.import(file);
  return db.backendDB();
}
```


## Background / Why

This feature has been asked for a lot:

* https://github.com/dfahlander/Dexie.js/issues/391
* https://github.com/dfahlander/Dexie.js/issues/99
* https://stackoverflow.com/questions/46025699/dumping-indexeddb-data
* https://feathub.com/dfahlander/Dexie.js/+9

My simple answer initially was this:

```js
function export(db) {
    return db.transaction('r', db.tables, ()=>{
        return Promise.all(
            db.tables.map(table => table.toArray()
                .then(rows => ({table: table.name, rows: rows})));
    });
}

function import(data, db) {
    return db.transaction('rw', db.tables, () => {
        return Promise.all(data.map (t =>
            db.table(t.table).clear()
              .then(()=>db.table(t.table).bulkAdd(t.rows)));
    });
}
```

Looks simple!

But:

1. The whole database has to fit in RAM. Can be issue on small devices.
2. If using JSON.stringify() / JSON.parse() on the data, we won't support exotic types (Dates, Blobs, ArrayBuffers, etc)
3. Not possible to show a progress while importing.

This addon solves these issues, and some more, with the help of some libraries.

## Libraries Used
To accomplish a streamable export/import, and allow exotic types, I use the libraries listed below. Note that these libraries are listed as devDependencies because they are bundles using rollupjs - so there's no real dependency from the library user persective.

### [typeson](https://www.npmjs.com/package/typeson) and [typeson-registry](https://www.npmjs.com/package/typeson-registry)
These modules enables something similar as JSON.stringify() / JSON.parse() for exotic or custom types.

### [clarinet](https://www.npmjs.com/package/clarinet)
This module allow to read JSON in a streaming fashion

## Streaming JSON
I must admit that I had to do some research before I understood how to accomplish streaming JSON from client-side Javascript (both reading / writing). It is really not obvious that this would even be possible. Looking at the Blob interface, it does not provide any way of either reading or writing in a streamable fashion.

What I found though (after some googling) was that it is indeed possible to do that based on the current DOM platform (including IE11 !).

### Reading JSON in Chunks

A File or Blob represents something that can lie on a disk file and not yet be in RAM. So how do we read the first 100 bytes from a Blob without reading it all?

```js
const firstPart = blob.slice(0,100);
```
Ok, and in the next step we use a FileReader to really read this sliced Blob into memory.

```ts

const first100Chars = await readBlob(firstPart);

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = ev => reject(new Error("file read aborted"));
    reader.onerror = ev => reject((ev.target as any).error);
    reader.onload = ev => resolve((ev.target as any).result);
    reader.readAsText(blob);
  });
}
```
Voila!

But! How can we keep transactions alive when calling this non-indexedDB async call?

I use two different solutions for this:
1. If we are in a Worker, I use `new FileReaderSync()` instead of `new FileReader()`.
2. If in the main thread, I use `Dexie.waitFor()` to while reading this short elapsed chunk, keeping the transaction alive still.

Ok, fine, but how do we parse the chunk then? Cannot use JSON.parse(firstPart) because it will most defenitely be incomplete.

[Clarinet](https://www.npmjs.com/package/clarinet) to the rescue. This library can read JSON and callback whenever JSON tokens come in.

### Writing JSON in Chunks

Writing JSON is solved more easily. As the BlobBuilder interface was deprecated from the DOM, I firstly found this task impossible. But after digging around, I found that also this SHOULD be possible if browers implement the Blob interface correctly.

Blobs can be constructeed from an array of other Blobs. This is the key.

1. Let's say we generate 1000 Blobs of 1MB each on a device with 512 MB RAM. If the browser does its job well, it will allow the first 200 blobs or so to reside in RAM. But then, it should start putting the remanding blobs onto temporary files.
2. We put all these 1000 blobs into an array and generate a final Blob from that array.

And that's pretty much it.
