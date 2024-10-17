import Dexie, {
  DexieYProvider,
  RangeSet,
  type YjsLib,
  type YUpdateRow,
  type DBCore,
  type Middleware,
  type Table,
  type YjsDoc
} from 'dexie';

const ydocTriggers: {
  [ydocTable: string]: {
    trigger: (ydoc: YjsDoc, parentId: any) => any;
    parentTable: string;
    prop: string;
  };
} = {};

const docIsAlreadyHooked = new WeakSet<YjsDoc>();
const middlewares = new WeakMap<Dexie, Middleware<DBCore>>();

const createMiddleware: (db: Dexie) => Middleware<DBCore> = (db) => ({
  stack: 'dbcore',
  level: 10,
  name: 'yTriggerMiddleware',
  create: (down) => {
    return {
      ...down,
      transaction: (stores, mode, options) => {
        const idbtrans = down.transaction(stores, mode, options);
        (idbtrans as IDBTransaction).addEventListener(
          'complete',
          onTransactionCommitted
        );
        return idbtrans;
      },
      table: (tblName) => {
        const coreTable = down.table(tblName);
        const triggerSpec = ydocTriggers[tblName];
        if (!triggerSpec) return coreTable;
        const { trigger, parentTable, prop } = triggerSpec;
        return {
          ...coreTable,
          mutate(req) {
            switch (req.type) {
              case 'add': {
                for (const yUpdateRow of req.values) {
                  const primaryKey = (yUpdateRow as YUpdateRow).k;
                  const doc = DexieYProvider.getDocCache(db).find(
                    parentTable,
                    primaryKey,
                    prop
                  );
                  if (doc) {
                    if (!docIsAlreadyHooked.has(doc)) {
                      hookToDoc(doc, primaryKey, trigger);
                      docIsAlreadyHooked.add(doc);
                    }
                  } else {
                    enqueueTrigger(tblName, primaryKey, trigger);
                  }
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
                        keySet.addKey(k);
                      }
                      for (const key of keySet) {
                        enqueueTrigger(tblName, key, trigger);
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

let triggerExecPromise: Promise<any> | null = null;
let triggerScheduled = false;
let scheduledTriggers: {
  db: Dexie;
  updatesTable: string;
  parentId: any;
  trigger: (ydoc: YjsDoc, parentId: any) => any;
}[] = [];

function $Y(db: Dexie): YjsLib {
  const $Y = db._options.Y;
  if (!$Y) throw new Error('Y library not supplied to Dexie constructor');
  return $Y;
}

async function executeTriggers(triggersToRun: typeof scheduledTriggers) {
  for (const { db, parentId, trigger, updatesTable } of triggersToRun) {
    // Load entire document into an Y.Doc instance:
    const updates = await db
      .table(updatesTable)
      .where({ k: parentId })
      .toArray();
    const Y = $Y(db);
    const yDoc = new Y.Doc();
    for (const update of updates) {
      Y.applyUpdateV2(yDoc, update);
    }
    try {
      await trigger(yDoc, parentId);
    } catch (error) {
      console.error(`Error in YDocTrigger ${error}`);
    }
  }
}

function enqueueTrigger(
  updatesTable: string,
  parentId: any,
  trigger: (ydoc: YjsDoc, parentId: any) => any
) {
  (scheduledTriggers[updatesTable] ??= []).push({
    parentId,
    trigger,
  });
}

async function onTransactionCommitted() {
  if (!triggerScheduled && scheduledTriggers.length > 0) {
    triggerScheduled = true;
    if (triggerExecPromise) await triggerExecPromise.catch(() => {});
    setTimeout(() => {
      // setTimeout() is to escape from Promise.PSD zones and never run within liveQueries or transaction scopes
      triggerScheduled = false;
      const triggersToRun = scheduledTriggers;
      scheduledTriggers = [];
      triggerExecPromise = executeTriggers(triggersToRun).finally(
        () => (triggerExecPromise = null)
      );
    }, 0);
  }
}

function hookToDoc(
  doc: YjsDoc,
  parentId: any,
  trigger: (ydoc: YjsDoc, parentId: any) => any
) {
  // From now on, keep listening to doc updates and execute the trigger when it happens there instead
  doc.on('updateV2', (update: Uint8Array, origin: any) => {
    //Dexie.ignoreTransaction(()=>{
    trigger(doc, parentId);
    //});
  });
  /*
    NOT NEEDED because DexieYProvider's docCache will also listen to destroy and remove it from its cache:
    doc.on('destroy', ()=>{
    docIsAlreadyHooked.delete(doc);
  })
  */
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
}
