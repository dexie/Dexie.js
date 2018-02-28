# Slutsatser Collation Support

* Inget stöd för collation i orderBy. Endast string | string[]
  Argument 1: Locka inte in användare att sortera oindexerat.
  Argument 2: Gör syntax och API mer komplex.
* Collation support blir egen addon "dexie-collator".


```ts
new Dexie('myDb').collate({
  sv: new Intl.Collator('sv'),
  default: null // Implicita värdet av default. Om man sätter en default till en Intl.Collator så blir alla index collatade.
}).tables({
  friends: `
    ++id
    firstName:sv
    lastName:sv
    address
    age
    [lastName+firstName+age]
    names := fuzzy(firstName,lastName,address)
  `,
  pets: `
    ++id`
})

new Dexie('mydb').locales({
  sv: new Intl.Collator('sv'), // swedish
  de: new Intl.Collator('se'), // german
  ignoreCase: new Intl.Collator(undefined, {sensitivity: 'accent'}),
  ignoreAccent: new Intl.Collator(undefined, {sensitivity: 'base'}),
}).schema({
  friends: '++id, firstName:ignoreAccent, lastName:ignoreAccent'
})


```

## Compound Indexes
* Konflikt mellan "[firstName,lastName]:ignoreCase" och "lastName" (utan ignoreCase). Kan tillåtas, alternativt exception klagas för inkonsistens.
* Alla följande syntaxer är tillåtna:
  "[firstName:ignoreCase,lastName]"
  "[firstName:ignoreCase,lastName:ignoreCase]"
  "[firstName,lastName]:ignoreCase"
* Men inte:
  "[firstName:ignoreCase,lastName:ignoreCase]:ignoreCase"
