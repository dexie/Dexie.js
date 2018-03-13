Backward compatibility:

```js
db.version(X).stores({
  ...
})
```
Treat these in a backward compatible manner.

But:
```js
db.schema({
  ...
})
```
...should:
  1: automatically upgrade when needed
  2: Default indexes to full-indexes (not partial as before)
  3: Interpret "between" differently. 

# How it should work:

Scenario:

Version 1: {friends: '++id,name,age'}
Version 2: {
  friends: '++id,personId',
  persons: '++id,name,age'
} upgrader:
  db.friends.modify(async friend => {
    friend.personId = await db.persons.add({name: friend.name, age: friend.age});
    delete friend.name;
    delete friend.age;
  })
Version 3: {friends: '++id,name,age', persons: null} upgrader:
  await db.friends.modify(async friend => {
    const person = await db.persons.get(friend.personId);
    friend.name = person.name;
    friend.age = person.age;
  });


Translated to data-migrators, putting an upgrader means:
  * "2" is stored in migrations table after successfully running "2" upgrader.
  * "2" and "3" is stored in migrations table after successfully running "3" upgrader.
  So if only "2" is present, the database must be on version 2 and not 3, so persons must be present,
  and it would be safe to run the "3" migrator, right?!

  Hmm. What if user is on version 1. Upgrader 2 is just code, right, so the system wouldn't know
  that version 2 had a "persons" table, right?! How could ever the upgrader code `await db.persons.add(...)`
  succeed? Not! So, basically, user still needs to keep old schemas, right?! Yes!



## Changed Index from plain to unique (or generally: putting a constraint on an index)
1. Run migrator
2. Engine: Prepare index to succeed converting by removing non-unique entries
3. Add contraint on index.

## Changed Index from unique to plain
1. Engine: Remove constraint
2. Run migrator.

## Changed index from plain to multiEntry
1. Run migrator
2. Add/Remove index

## Changed index from plain to partial
1. Run migrator
2. Engine: Un-fullify index

## Changed index from partial to plain.
1. Run migrator (for example change 0 to false and 1 to true)
2. Engine: Fullify index


# Conclutions:

* Rename "stores()" to "schema()" and let version() be optional.
* Allow numbers or strings in version().
* Always open database "dynamically"
* Diff physical schema with given last schema.
* If same, and version is same (number or table-stored) consider open() done.
* If not same, but version is same, trigger an upgrade an adjust schema accordingly.
  * No table deletes. Index deletes ok (Specify table: null to explicitely remove a table, as before)
  * Since we're out of sync with indexedDB version numbers, increment 10 to 11, 12, 13, etc until 20,
    where we instead create a _migrations table to store what version we're on.
* If same, but installed version is below, trigger upgrade to set version to specified.
* If same, but installed version is above, upgrade and create the _migrations table if needed (upgraders attached)
* If version is string, always create the _migrations table.

## Cascading upgrades
1. Open DB dynamically. What is the installed version (use either _migrations table or version no to decide)
2. Find out what upgraders need to run and for each upgrader, what the schema should be for it BEFORE and AFTER!
3. Open to first upgrader-attached version (idb friendly if possible, otherwise above with _migrations)

```js
db.version(1).schema({
  friends: '++id,name,age'
}).version(2).schema({
  friends: '++id,personId',
  persons: '++id,name,age'
}).upgrade(async => {
  ...
}).version(3).schema({
  friends: '++id,name,age'
}).upgrade(async => {
  ...
})
```

4. Close db and open again onto next version etc and so on...

Also, provide a test migration:

```js
db.testMigrations().
```
Will run the migrations onto a dummy engine.

Example use for addons:

```js
db.version('dexie-collations.1').schema({collactions: '++id,name'})
```

Syncable:

```js
schema-middleware:
  schema = Object.keys(schema).forEach(tableName => {
    schema[tableName+"_changes"] = {...};
  })
```

## Generic migration handling:
1. Engine: Remove constraints (like unique, foreign key, etc)
2. Run migrator
3. Engine: Prepare data for new constraints
4. Remove indexes and tables

## Recreate support (#349)

```js
db.version(3).recreate()
```

## downgrade()

To support rollbacks to earlier versions, a downgrade() function could be attached.
The downgrade() must be stringified and stored into _versions table. If a previous version
is opened, downgraders will run. If a diverged version is opened, downgraders are run first, then upgraders for the diverged version.

Addons may use downgrade() to support uninstallation.

## Problems with downgrade()
If one omits including an addon (for testing purpose, or by accident), their data will be automagically unmigrated.

## Delete tables on downgrade():
```js
db.version("dexie-syncable-0").schema({
  _changes: null
}).version("dexie-syncable-1").schema({
  _changes: '++rev'
});
```
This should remove "_changes" on a downgrade without a downgrader attached.

