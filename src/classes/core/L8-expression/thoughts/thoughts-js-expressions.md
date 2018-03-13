
```ts

const minAge = 18, retireAge = 65;
db.people.where(({name, age}) =>
  (age >= minAge && age < retireAge) || name.startsWith('R'),
  {minAge, retireAge})

db.people.where('name').startsWith('R')
  .or('age').aboveOrEqual(minAge).and('age').below(maxAge)
  .and(
    where('interests').anyOf('sports', 'music').or('age').below(7)
  )

// The following is a favourite along with mango queries:
const query = db.people.where({
  customerID: 89,
  name: startsWith('R'),
  interests: anyOf("sports", "gaming", "music")
}).or({
  age: between(7, 16),
}).orderBy('interests')
  .pageSize(10);

const firstPage = await query.getFirstPage();
const lastPage = await query.getLastPage();
const nextPage = await firstPage.next();
const prevPage = await lastPage.prev();


for (await let page of query) {
  console.log(JSON.stringify(page.values));
}

//await db.people.sql `age >= ${minAge} && age < ${retireAge}`.toArray();
await db.sql `select * from people where age >= ${minAge} and age < ${retireAge}`.toArray();
// När vi stödjer join (ganska enkelt) och groupBy (gissningsvis ganska enkelt) så behövs
// bara en enkel SQL tokenizer + AST för att översätta det. 
// indexed-sql

db.people.where({
  $or: [
    {
      name: {
        startsWith: 'R'
      }
    },
    {
      age: {
        aboveOrEqual: minAge,
        below: maxAge
      }
    }
})

await db.people.findOne({...mangoQuery}) // vore bra.

db.people.where('age').

```