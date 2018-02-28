
```ts

db.friends.where('age')
  .between(20,25)
  .include('pets')
  .where('pets.kind').anyOf('cat', 'dog')
 
```

# Issue #666

Utan foreign keys men generiskt join stöd:

```ts
db.schema({
  pages: `
    url,
    *terms`,
  visits: `
    [time+url]
  `
});

const pairs = await
  db.visits.innerJoin(db.pages.where('terms').equals(query)).on('visits.url', 'pages.url')
    .where('time').between(fromTime, toTime)
    .toArray();

[
  {time: 101, url: "abc.com", terms: ["dsd","ddfd","2"]},
  {time: 232, url: "abc.com", terms: ["dsd","ddfd","2"]},
]

const pairs2 = await
  db.pages.rightJoin(db.visits).on('pages.url','visits.url')
    .where('visits.time').between(fromTime, toTime)
    .where('pages.terms').equals(query)
    .map(([page, visit]) => ({...page, visits: }))

```

Med foreign keys - en lite enklare join:

```ts
db.schema({
  pages: `
    url,
    *terms,
    {visits} <- visits.url
  `,
  visits: `
    [time+url],
    url -> pages.url {page}
  `
})

db.visits.include('page')
  .where('time').between(fromTime, toTime)
  .where('page.terms').equals(query)
  .toArray();
```

DexieCore implementation för join:

```ts

interface JoinStatement {
  joinType: 'left' | 'inner';
  rightQuery: {table: string, expr: Expression};
  on: {
    leftIndex: string;
    rightIndex: string;
  }
}

function JoinEngine (next: ExpressionEngine, joinReq?: JoinStatement) : JoinEngine {
  if (!joinReq) return {
    ...next,
    join (joinStatement: JoinStatement) : JoinEngine {
      return JoinEngine(next, joinStatement);
    }
  };
  
  const result = {
    ...next,
    join (joinStatement: JoinStatement): JoinEngine {
      return JoinEngine(result, joinStatement)
    },
    openCursor (query) {
      return Promise.all([
        next.openCursor({...query, table: query.table, expr: query.expr, orderBy: joinReq.on.leftIndex}),
        next.openCursor({...queryjoinReq.rightQuery, orderBy: joinReq.on.rightIndex})
      ]).then(([res1,res2]) => {
        const cursor1 = res1.cursor;
        const cursor2 = res2.cursor;
        //let joinKey = -Infinity;
        const resultCursor = new ManualCursor();
        return {
          cursor: resultCursor,
          iterate (onNext) {
            res1.iterate(()=>{
              if (next.cmp(cursor1.key, cursor2.key) === 0) {
                resultCursor.key = cursor1.key;
                resultCursor.primaryKey = [cursor1.primaryKey, cursor2.primaryKey];
                if (query.want === 'values' || query.resultCursor.value = 
                onNext()
              }
            });
            res2.iterate(()=>{

            });
          }
        }
      }
    }
  };

  return result;
}

```