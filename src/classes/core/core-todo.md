
```ts
interface IDBCore {
  // Mutating methods
  add (req: BulkAddRequest) : Promise<MutateResponse>;
  put (req: BulkPutRequest) : Promise<MutateResponse>;
  delete (req: BulkDeleteRequest) : Promise<MutateResponse>;
  deleteRange (req: RangeDeleteRequest) : Promise<void>;

  // Bulk Get methods
  get (req: BulkGetRequest): Promise<{values: any[]}>;
  getKeys (req: BulkGetPrimKeysRequest): Promise<{keys: any[]}>;

  // Query methods
  getAll (req: GetAllQuery) : Promise<{values: any[]}>;
  getAllKeys (req: GetAllKeysQuery): Promise<{keys: any[]}>;
  openCursor (req: CursorQuery) : Promise<void>;
  openKeyCursor (req: CursorQuery) : Promise<void>;

  // Utility methods
  cmp (a:any, b:any): number;
}

```
Bestämt:
* IDBCore innehåller metoder, inte nödvändigtvis alla (open, createIndex etc finns ej med), från IndexedDB.
* Cursor mappar mot IDBCursor
* En helper klass som encapsulatar och revivar keys och values finns att tillgå för diverse features.
* Alla query metoder har en enkel keyRange som parameter (samt reverse, unique, limit) så att det är lätt
  att bygga nytt middleware på det som stödjer pageToken.

Middleware
```ts
const testMiddleware = {
  name: "testmiddleware",
  type: "core",
  level: 3,
  create (next: API2) {
    return {
      method1(a,b,c){},
      method2(x,y,z){},
      ...
    } : API3 // (kan returnera ett ändrat interface!!!!)
  }
}

db.core.get(...);
db.core.level(2).get(...);


// eller:
db.use(testMiddleware);

db._createTransaction = addMiddleware(db._createTransaction, {
  name: "transactionMiddleware", 
  create (origFunc) {
    return function (){
      origFunc.apply(this, arguments);
    }
  }
});

// Middleware stacken ligger på db i form av "db.use" och managerar en samling middlewares.
// Den är ansvarig för att byta ut db.core och db._createTransaction pekaren

```

Helpers:
* TransformationMiddleware (klarar encapsulate, encapsulateKeys, revive, reviveKeys)
* LockableMiddleware (Kontrollerar lock på transaktion och kan låsa transaktion genom lock: IDBTransaction[])

```ts

IDBCoreMiddleware {
  name: string;
  level: number; /*
 !  1=IDBCore (varför inte ha uniform query metod ända ned hit?! Blir mindre kod då!)
    2=Polyfills för IE, Safari och IndexedDB <2.0.
 *  3=Virtual partially- or non-compound indexes (accepterar första delen av compound index. CursorProxy)

 *! 3.3=Översätt multiRange requests
      getAll(): Gör flera getAll(). Om keys: parallellt med samma limit som inkommer,
      annars sekvensiellt om limit, annars parallellt.

 *! 3.5=ignoreCase () Lägger på no-case algoritm på getAll() och openCursor().
      Allt sker nedåt på openCursor-sättet, men uppåt tillåter vi getAll().
      Även om vi får in multi-range requests här så görs en enkel openCursor() helt enligt
      addIgnoreCaseAlgorithm(). Vi gör alltås inga multiRange requests nedår. Bara enkla RangeQueries
      nedåt som hoppar över översättning av multiRange requests.
      På så sätt är detta också en hantering av multiRange requests vis sidan om den i lagret under.
      Att vi ligger före den, beror inte på att vi ska använda den utan att den inte får röra ignoreCase
      queries. Hade kunna lägga i omvänd ordning, men då måste det lagret skicka vidare noCase varianten
      till oss.

 *  3.7=pageToken support (low level) på multiRange requests.
      Behöver exekveras före ignoreCase() för att hantera case-insensitive ranges.
      A: Ta hand om inkommande pageToken:
        1. RangeConjunction: Skala bort ranger eller delar av ranger som inte ska med.
        2. För första kvarvarande rangen:
          getAll(): Inbound: Använd som key som lowerBound. Ignorera tills getByKeyPath(value,primKeyPath)       
                             passerat token-värdet.
                    OutBound: openCursor(), continuePrimaryKey()
          getAllKeys: Använd key som lowerBound. Ignorera tills key passerat token-värdet för primaryKey.
          openCursor: continuePrimaryKey(key, primaryKey)
      B: Returnera pageToken:
        getAll(): Inbound: getByKeyPath(lastEntry, [keyPath, primaryKeyPath])
                  Outbound: openCursor()
        getAllKeys(): [getByKeyPath(await get(lastPrimaryKey), keyPath), lastPrimaryKey]
        openCursor: [key, primaryKey]

    3.8=virtuellt reverse-stöd för getAll()
      Om ett reverse-query kommer in till getAll(), översätt det genom att använda openCursor inåt.
    3.9=virtuellt unique-stöd för 

    4=AND-Engine exekverar AND-uttryck.
        Exekverar endast AND uttryck
          * Gissa på vilket uttryck som har minst antal träffar. I brist på statistik, använd
            den ordning i vilket uttrycken kommer.
          * Om man däremot hittar två index som kan sättas ihop med compound, välj det först nämnda
            av dessa, samt det med flest ingående index.
          * Om inget compound, gör följande:
            * Om endast aritmetisk operation:
              * returnera alla värden eller nycklar beroende på request.

            1. första operationen: getAllKeys()
            2. andra operationen: getAllKeys(). Plocka bara conjunction keys.
            3. ... ...
            4. sista operationen: getAllKeys(). Plocka bara conjunction keys.
            5. Hämta med get() alla värden (om callern vill ha värden)

    4.5=OR-engine exekverar OR-uttryck.
      Om ingen orderBy, gör getAll() på första uttrycket, och sedan
        getAllKeys() på de andra för att hitta icke-medtagna keys,
        som du sedan gör get() på.
      Om orderBy, gör getAllKeys() på alla uttryck, gör sedan
        getAllKeys() på hela indexet för att "få ordning på det" (att de kommer i ordning).
        värden som inte kom med läggs på slutet i primKey ordning.
        Finns det en limit, så chunka sista getAllKeys(), dvs ha en limit,
        sedan hitta nålar i chunken. Under callerns limit? chunka igen osv. När man chunkar skickar man {want: {pageToken: true}} vilket måste hanteras längre ned i stacken. Vi behöver alltså två pageToken lager - 
        ett på låg nivå som klarar både getAll() och openCursor(), samt ett på hög nivå som helt enkelt lägger
        på två AND-uttryck (key+primaryKey).

      Slutligen göt get() på alla matches.
      
    5=Kanonisera matris:
        Reducera alla vertikala AND-uttryck som opererar på samma index och har samma ignoreCase värde.
        Efter reducering av AND-uttryck: Om någon vertikal opererar på exakt och helt exakt samma indexar,
        så borde den ekvationen gå att lösa genom att eliminera OR mellan dem
        och istället sammanfoga range-setsen.

    5.1=Översätt Expression till AND/OR matris i expression-format, alltså:
          OR[AND[a,b,c], AND[a,e,f], AND[a,h,i]]

    5.2=High-level pageToken support. 
      Det pageToken support gör är egentligen bara att lägga till ett vilkor i hela expressionet:
        AND (theOrderByField >= lastKey) AND (primaryKey >= lastPrimKey).
      Om orderBy inte är satt, sätt det till sista kolumnen sista raden

    5.3=Gör om alla uttryck till inRanges() uttryck.
        "=",">","<",">=","<=",between +
        anyOf: Gör N antal range-queries bara. Om cursor, låt ena cursorns slut följa in på nästa.
        inAnyOfRanges: Samma som ovan!
        notEqual: Två range requests.
        startsWith: between
      Alla dessa resulterar istället i inRanges().
      Överkurs: Alla no-case varianter blir inRanges({..., ignoreCase: true}).

    6=ConstraintsValidators and CascadingDeletes
    7=transformations
    8=Update()- och OT-update support. Bekvämt att ligga före transformations eftersom
      vi inte behöver förstå vilken nyckel vi rör vid.
    9=Change loggers for sync
        Ligger före transformation och Update eftersom SQL-DB kan klara booleans redan
        Ligger före CascadingDeletes eftersom vi inte vill logga resultatet av dessa.
    10=Transaction invoker
    */
  mutate(req, next): Promise<MutateResponse>;
  bulkGet(req, next): Promise<Cursor>;
  ...
}

DexieMiddleware {
  createTransaction
}
interface Dexie {
  ...
  core: IDBCore;
  use()
}
```

LABBING
```ts

db.friends.where({
  name: { equalsIgnoreCase: 'david' },
  
}

db.friends.where({
  age: {
    aboveOrEqual: 18,
    below: 65
  }
}).toArray();

db.friends.where({
  name: {
    startsWithIgnoreCase: 'D'
  }
}).or({
  age: { above: 25 }
})


  aboveOrEqual: 18,
  below: 65
})

db.friends.where({
  name: startsWithIgnoreCase('D'),
  age: {
    aboveOrEqual: 18,
    below: 65
  }
})

db.friends.where('name').between({
  aboveOrEqual: 'A',
  below: 'B'
})

db.friends.where('name').aboveOrEqual(18)

db.friends.where({
  name: startsWithIgnoreCase('d'),
  age: above(25)
}).or({

})
```