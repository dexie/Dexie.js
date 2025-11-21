
```ts



const db = new Dexie('name') as Dexie & {
  friends: Table<Friend, number>
};

db.version(1).stores({
  friends: `
    ++id
    name: NoCase NoAccent FullText
    age

    # Below there are indexer hthos and that
    address.city: NoCase FullText
    doc: Y.Doc
    docHtml: FullHTML

    # Multi entry:
    *tags           # No need to specify type
  `,
  calendarEvents: `
    @id
    title: NoCase FullText
    [from+to]:Range
    location: Geo(lng+lat)
    description: FullText

  `
});

defineTrigger(db.friends, "name", friend => friend._name = friend.name.toLowerCase())

await db.setLocale("ge")
```
