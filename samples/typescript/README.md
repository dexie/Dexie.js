﻿# Sample - Using Dexie.js with Typescript.

This is a sample on how to use Dexie.js with Typescript and babel. The following features are shown:

* How to subclass Dexie and define tables in a type-safe manner.
* How to create an entity with Dexie.
* How to use async / await with Dexie.
* How to create something similar to navigation properties on entities.

## Install
Start a root / admin shell and write:
```
npm install
```

## Build
```
npm run build
```

## Run
```
npm test
```
Surf to http://localhost:8081/src/app.html

# The app
The application stores a simple contact database using a relational database model, where each contact can have
0..n emails, 0..n phone numbers. Email- and Phone entries have their own tables and reference Contact through
the contactId index.

The AppDatabase class extends Dexie with the three tables **contacts**, **emails** and **phones**.
The tables are mapped to typescript classes and interfaces.

The sample shows how to subclass Dexie in typescript and define the tables.

It also shows how to map a typescript class to a database table and call methods on database objects.
