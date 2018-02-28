import { MiddlewareStack, MiddlewareFunction } from '../public/types/middleware';
import { WriteRequest } from '../public/types/mutation-core';
import { __assign } from 'tslib';

// Följande tänkte jag ut på söndagskvällen den 4 feb. Det visar ett sätt att lösa dilemmat att:
// * Om vi inte vill lita på PSD.trans i DexieCore (middleware ramverk) så måste transaktionen
//   bindas till middleware instanser.
// * Vi kan inte skicka med trans som argument, för då funkar inte next.friends.put(...), eftersom
//   argumentet till Table.put() inte har med transaktion. Alltså måste Table i sig peka ut en db
//   (en DexieCore) vars instans är bunden till transaktionen. Table måste genereras dynamiskt
//   med db instans. Stacken måste genereras dynamiskt när transaktionen skapas.
// * Det är no-brainer att skapa stack-entries lazily eftersom det i samtliga fall (utom exceptions)
//   kommer generera minst lika många anrop men i många fall fler om fler operationer görs på samma
//   transaktion.
// Den här implementationen skapar upp stacken med Array.reduce() i createInstance(). Tanken är
// att createInstance() anropas när transaktionen skapas.

// Vilka problem ser jag just nu med denna lösning?
// 1. Den kompilerar inte typescript-mässigt. Det gör inget egentligen. Generics grejerna är egentligen
//    inte intressanta. Skala bort det till ren JS så är jag egentligen nöjd. Slut-API:t ska kanske ändå
//    definieras explicit.
// 2. Varför måste middlewares veta om state? Normalt sett bryr de sig inte om transaktionen. Dess next
//    är ju ändå bunden till transaktionen. Men det finns fall då man kan vilja veta om transaktionen.
//    Specifikt om man vill cacha saker på den! Sync-fallet kan vara aktuellt så.
//    Kanske bättre accessa den via this.trans! Borde gå att göra om det så (det var så jag tänkte
//    först! Alternativt så skickas trans med till middleware som ett tredje argument! Kanske bäst
//    egentligen! Fortfarande utan krav på att man skickar den vidare!
// 3. Transaktionslösa operationer måste också skapa stacken för varje operation. Detta kommer vi tyvärr
//    inte ifrån om vi INTE ska lita på PSD.trans. Men om API:t görs för att kunna implementeras
//    utan PSD beroende, så kan vi ju i Dexie 3 optimera det temporärt med PSD. Det jag är ute efter
//    är inte att slänga ut PSD utan bara att hålla dörren öppen för att saker byggda på API:et skall
//    funka även på en PSD-lös version av Dexie!

// NOTERING: Puck 2 ovan är nu implementerad nedan. Alltså! Vi skickar med state i tredje argumentet
// Det middleware som är intresserat kan alltså läsa det. I Dexie-fallet kan state bara vara trans.
// Så det blir trans rakt av som skickas med.

/* Slutats: Vi har ett ramverk för att stödja både transaktions- och transaktionslösa middlewares.
  Vi kan ha ett transaktionslöst på db och de metoder som är transaktionsbundna.
  Nu fick jag en ide!
  1) Vi har ett state-less instans på db. 
  2) Sen lägger vi in ett middleware på USER-level som implementerar trans-beroende metoder.
     Först kollar det om trans är null. I så fall hämtar den PSD.trans eller _tempTransaction().
      Sedan gör den createInstance() och lagrar på trans varpå den anropar denna stack istället.
     Om dock trans inte är null (eller PSD trans inte är null) gör den bara next().

*/
type ApiDefinition = {[method: string]: {Request: any, Response: any}};

type Api<A extends ApiDefinition> = {[M in keyof A]: (req: A[M]["Request"]) => A[M]["Response"]};

type MiddleWare<A extends ApiDefinition, STATE> = 
  STATE & {[M in keyof A]?: (req: A[M]["Request"], next: Api<A>) => A[M]["Response"]};

export function createMiddlewareStack2<STATE, A extends ApiDefinition> (finalImpl: {
  new (state: STATE):Api<A>,
  prototype: Api<A>
}) {
  let stack: {level: number, middleware: MiddleWare<A, STATE>}[] = [];
  let middlewaresPerLevel = {}; // Memoization.
  const result = {
    use (middleware: MiddleWare<A, STATE>, stackLevel: number) {
      stack.push({middleware, level: stackLevel});
      stack.sort((a,b)=>b.level - a.level);
      middlewaresPerLevel = {};
      return this;
    },

    unuse (middleware: MiddleWare<A, STATE>) {
      stack = stack.filter(mw => mw.middleware !== middleware);
      middlewaresPerLevel = {};
      return this;
    },

    createInstance (state: STATE, level: number) {
      const middlewares = middlewaresPerLevel[level] ||
        (middlewaresPerLevel[level] = stack
          .filter(entry => entry.level >= level)
          .map(entry => entry.middleware));
      return middlewares
        .reduce((host, middleware) => new ApiImplMiddle(state, middleware, host), new finalImpl(state));
    }
  };
  function ApiImplMiddle(state, middleware, nextHost) {
    this.state = state;
    this.nextMiddleware = middleware;
    this.nextHost = nextHost;
  }
  Object.keys(finalImpl.prototype).forEach(method => {
    ApiImplMiddle.prototype[method] = function (req) {
      return this.nextMiddleware[method](req, this.nextHost, this.state);
    }
  });

  return result;
}

interface TestApi {
  sayHi(req: number): void;
}

interface TestApiSpec {
  sayHi: {
    Request: number;
    Response: void;
  }
}

class TestHost implements TestApi {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  sayHi(req: number) {
    console.log("Hi, " + + req + ", " + this.name);
  }
}

const testMiddleware = {
  return {
    sayHi(req: number, next: TestApi) {
      return next.sayHi(req + 1);
    }
  }
}

const mwStack = createMiddlewareStack2<string, TestApiSpec>(TestHost);
mwStack.use(testMiddleware);


export function createMiddlewareStack<TRequest, TResponse> (finalHandler: (req: TRequest) => TResponse) : MiddlewareStack<TRequest, TResponse> {
  let stack: {level: number, middleware: MiddlewareFunction<TRequest, TResponse>}[] = [];

  return {
    invoke: finalHandler,

    use (middleware: MiddlewareFunction<TRequest, TResponse>, stackLevel: number) {
      stack.push({middleware, level: stackLevel});
      stack.sort((a,b)=>b.level - a.level);
      this.invoke = stack
        .map(entry => entry.middleware)
        .reduce((next: (req: TRequest) => TResponse, mw) => req => mw(req, next), finalHandler);
      return this;
    },

    unuse (middleware: MiddlewareFunction<TRequest, TResponse>) {
      stack = stack.filter(mw => mw.middleware !== middleware);
      return this;
    }
  }
}

/*
  Funderingar:
  * db.core.mutate({op: 'put', values: [{...},{...}]});
    --> transFactory --> trans.core.mutate(...) --> middlewares --> backend.
  * trans.core.mutate({...});
    --> [middlewares] --> impl.
  
*/