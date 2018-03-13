# Partial Indexes

IndexedDB uses partial indexes by default. Dexie 4.0 could switch to using full indexes by default. If user wants to use partial index, put a "?" after the index name and it will behave as indexedDB default indexes, that is, require the type to be an indexable type.

## orderBy
```ts

new Dexie('dbname').schema({
  friends: '++id, name, age, label?'
})

```
Then it is possible to ordeBy('name') or orderBy('age') but not orderBy('label') (or if possible, it will be done using Array.sort()).

## NOT expressions

Not expression may only utilize full indexes. The nature of NOT-expressions, however, most of the time, is that they typically won't benefit so much from utilizing indexes at all. So maybe we could let NOT-expression never be included in the conjunction evaluator but instead manually filter out entries matching the NOT clause.

