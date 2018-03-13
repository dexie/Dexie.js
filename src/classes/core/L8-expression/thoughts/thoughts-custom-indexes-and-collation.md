For the purpose of:
* encryped indexes
* collated indexes
* foreign indexes
* computed partial index

Computed Partial:
```js
db.computedIndexes({
  partialTrue: prop => !!prop ? 1 : null,
}).schema({
  friends: '++id, name, age, isBestFriend?:partialTrue'
})
```

Collated:
```js
db.computedIndexes({
  noCase: prop => typeof prop === 'string' && prop.toLowerCase()
}).schema({
  friends: '++id, name:noCase, age'
})
```

Full Text Search:
```js
db.computedIndexes({
  fullText: prop => typeof prop === 'string' && prop.split(' ')
}).schema({
  emails: '++id, date, from, to, subject:fullText, message:fullText'
});

db.emails.where('subject:fullText').anyOf('18723', '19193').and('message:fullText').anyOf('problem solved')
// Or:
db.emails.where({
  'subject:fullText': anyOf('18723', '19193'),
  'message:fullText': 'problem solved'
})
```

A better full-text search should be an addon that allows to mark an index as ":text" and index all those fields
into a single index.

```js
db.schema({
  emails: '++id, date, from, to, subject:text, message:text'
})

db.emails.where({
  subject: contains('18723', '19193'), // rangeSet: ('18723', '19193')
  message: contains('problem solved')  // rangeSet: 'problem solved'
}).toArray(); // --> BloomFilter('18723', '19193').and(BloomFilter('problem').and(BloomFilter('solved')).loadValues().filter(testExpression(expr)).

```
So, we need some kind of customIndex:

```js
db.version("fulltext-1").use (core => ({
  write: req => {
    return core.write({...req, values: req.values.map(value => ({
      ...value,
      $words: extractWords(value)
    })));
  },
  /*operator: (op) => { // Do this in WhereClause.prototype.contains instead!
    return op.type !== 'includes' ?
      expr :
      {
        type: 'ranges',
        index: '$words',
        ranges: op.words.map(word => KeyRange.only(word)).sort(),
        evaluate: (value, key) => getByKeyPath(value, index).includes(key)
      }
  }*/
})).upgrade(async db => {
  for await (const table of db.tables.map(table => async () => {
    for await (const {values} of table.iteratePages(100)) {
      await db.table(table).bulkPut(values.map(value => ({
        ...value,
        $words: extractWords(value)
      })));
    }
  }));
}).downgrade(async db => {
  for await (const table of db.tables.map(table => async () => {
    for await (const {values} of table.iteratePages(100)) {
      await db.table(table).bulkPut(values.map(value => ({
        ...value,
        $words: undefined
      })));
    }
  }));
});
```

And cascading deletes:
```js

```

Had an idea about lazy indexing, but let's skip it!:
* Don't index fullText directly on add. Instead, support the contains() operator using full table scan
  until fully indexed. This would give a faster page load and app would optimize eventually.
Why don't implement it?
* There's a better solution: Universal Dexie! On page load, talk directly to server until fully synced,
  including indexing all full text items.


DON'T IMPLEMENT THIS YET!: Foreign indexes:
```js
db.schema({
  friends: `
    ++id,
    {person}: personId -> persons.id
    person.name
  `,
  persons: `
    ++id,
    name,
    age,
    {friend}: id <- friends.personId`
})
```
