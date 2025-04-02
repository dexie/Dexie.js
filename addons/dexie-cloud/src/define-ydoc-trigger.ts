import Dexie, {
  DexieYProvider,
  RangeSet,
  type YjsLib,
  type YUpdateRow,
  type DBCore,
  type Middleware,
  type Table,
  type YjsDoc,
} from 'dexie';

const ydocTriggers: {
  [ydocTable: string]: {
    trigger: (ydoc: YjsDoc, parentId: any) => any;
    parentTable: string;
    prop: string;
  };
} = {};

const middlewares = new WeakMap<Dexie, Middleware<DBCore>>();
let subscribedToProviderBeforeUnload = false;
const txRunner = TriggerRunner("tx"); // Trigger registry for transaction completion. Avoids open docs.
const unloadRunner = TriggerRunner("unload"); // Trigger registry for unload. Runs when a document is closed.

type TriggerRegistry = Map<
  string,
  {
    db: Dexie;
    parentTable: string;
    parentId: any;
    prop: string;
    triggers: Set<(ydoc: YjsDoc, parentId: any) => any>;
  }
>;

function TriggerRunner(name: string) {
  let triggerExecPromise: Promise<any> | null = null;
  let triggerScheduled = false;
  let registry: TriggerRegistry = new Map<
    string,
    {
      db: Dexie;
      parentTable: string;
      parentId: any;
      prop: string;
      triggers: Set<(ydoc: YjsDoc, parentId: any) => any>;
    }
  >();

  async function execute(registryCopy: TriggerRegistry) {
    for (const {
      db,
      parentId,
      triggers,
      parentTable,
      prop,
    } of registryCopy.values()) {
      const yDoc = DexieYProvider.getOrCreateDocument(
        db,
        parentTable,
        prop,
        parentId
      );
      try {
        const provider = DexieYProvider.load(yDoc); // If doc is open, this would just be a ++refount
        await provider.whenLoaded; // If doc is loaded, this would resolve immediately
        for (const trigger of triggers) {
          await trigger(yDoc, parentId);
        }
      } catch (error) {
        if (error?.name === 'AbortError') {
          // Ignore abort errors. They are expected when the document is closed.
        } else {
          console.error(`Error in YDocTrigger ${error}`);
        }
      } finally {
        DexieYProvider.release(yDoc);
      }
    }
  }

  return {
    name,
    async run() {
      console.log(`Running trigger (${name})?`, triggerScheduled, registry.size, !!triggerExecPromise);
      if (!triggerScheduled && registry.size > 0) {
        triggerScheduled = true;
        if (triggerExecPromise) await triggerExecPromise.catch(() => {});
        setTimeout(() => {
          // setTimeout() is to escape from Promise.PSD zones and never run within liveQueries or transaction scopes
          console.log("Running trigger really!", name);
          triggerScheduled = false;
          const registryCopy = registry;
          registry = new Map();
          triggerExecPromise = execute(registryCopy).finally(
            () => {
              triggerExecPromise = null;
            }
          );
        }, 0);
      }
    },
    enqueue(
      db: Dexie,
      parentTable: string,
      parentId: any,
      prop: string,
      trigger: (ydoc: YjsDoc, parentId: any) => any
    ) {
      const key = `${db.name}:${parentTable}:${parentId}:${prop}`;
      let entry = registry.get(key);
      if (!entry) {
        entry = {
          db,
          parentTable,
          parentId,
          prop,
          triggers: new Set(),
        };
        console.log(`Adding trigger ${key}`);
        registry.set(key, entry);
      }
      entry.triggers.add(trigger);
    },
  };
}

const createMiddleware: (db: Dexie) => Middleware<DBCore> = (db) => ({
  stack: 'dbcore',
  level: 10,
  name: 'yTriggerMiddleware',
  create: (down) => {
    return {
      ...down,
      transaction: (stores, mode, options) => {
        const idbtrans = down.transaction(stores, mode, options);
        if (mode === 'readonly') return idbtrans;
        if (!stores.some((store) => ydocTriggers[store])) return idbtrans;
        (idbtrans as IDBTransaction).addEventListener(
          'complete',
          onTransactionCommitted
        );
        return idbtrans;
      },
      table: (updatesTable) => {
        const coreTable = down.table(updatesTable);
        const triggerSpec = ydocTriggers[updatesTable];
        if (!triggerSpec) return coreTable;
        const { trigger, parentTable, prop } = triggerSpec;
        return {
          ...coreTable,
          mutate(req) {
            switch (req.type) {
              case 'add': {
                for (const yUpdateRow of req.values) {
                  if (yUpdateRow.k == undefined) continue; // A syncer or garbage collection state does not point to a key
                  const primaryKey = (yUpdateRow as YUpdateRow).k;
                  const doc = DexieYProvider.getDocCache(db).find(
                    parentTable,
                    primaryKey,
                    prop
                  );
                  const runner =
                    doc && DexieYProvider.for(doc)?.refCount
                      ? unloadRunner // Document is open. Wait with trigger until it's closed.
                      : txRunner; // Document is closed. Run trigger immediately after transaction commits.
                  runner.enqueue(db, parentTable, primaryKey, prop, trigger);
                }
                break;
              }
              case 'delete':
                // @ts-ignore
                if (req.trans._rejecting_y_ypdate) {
                  // The deletion came from a rejection, not garbage collection.
                  // When that happens, let the triggers run to compute new values
                  // based on the deleted updates.
                  coreTable
                    .getMany({
                      keys: req.keys,
                      trans: req.trans,
                      cache: 'immutable',
                    })
                    .then((updates) => {
                      const keySet = new RangeSet();
                      for (const { k } of updates as YUpdateRow[]) {
                        if (k != undefined) keySet.addKey(k);
                      }
                      for (const interval of keySet) {
                        txRunner.enqueue(
                          db,
                          parentTable,
                          interval.from,
                          prop,
                          trigger
                        );
                      }
                    });
                }
                break;
            }
            return coreTable.mutate(req);
          },
        };
      },
    };
  },
});

function onTransactionCommitted() {
  txRunner.run();
}

function beforeProviderUnload() {
  unloadRunner.run();
}

export function defineYDocTrigger<T, TKey>(
  table: Table<T, TKey>,
  prop: keyof T & string,
  trigger: (ydoc: YjsDoc, parentId: TKey) => any
) {
  const updatesTable = table.schema.yProps?.find(
    (p) => p.prop === prop
  )?.updatesTable;
  if (!updatesTable)
    throw new Error(
      `Table ${table.name} does not have a Yjs property named ${prop}`
    );
  ydocTriggers[updatesTable] = {
    trigger,
    parentTable: table.name,
    prop,
  };
  const db = table.db._novip;
  let mw = middlewares.get(db);
  if (!mw) {
    mw = createMiddleware(db);
    middlewares.set(db, mw);
  }
  db.use(mw);

  if (!subscribedToProviderBeforeUnload) {
    DexieYProvider.on('beforeunload', beforeProviderUnload);
  }
}
