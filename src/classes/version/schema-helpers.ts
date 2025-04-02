import { Dexie } from '../dexie';
import { DbSchema } from '../../public/types/db-schema';
import { _global } from "../../globals/global";
import { setProp, keys, slice, isArray, shallowClone, isAsyncFunction, defineProperty, getPropertyDescriptor } from '../../functions/utils';
import { Transaction } from '../transaction';
import { Version } from './version';
import Promise, { PSD, newScope, NativePromise, decrementExpectedAwaits, incrementExpectedAwaits } from '../../helpers/promise';
import { exceptions } from '../../errors';
import { TableSchema } from '../../public/types/table-schema';
import { IndexSpec } from '../../public/types/index-spec';
import { createIndexSpec, nameFromKeyPath } from '../../helpers/index-spec';
import { createTableSchema } from '../../helpers/table-schema';
import { generateMiddlewareStacks } from '../dexie/generate-middleware-stacks';
import { debug } from '../../helpers/debug';
import { PromiseExtended } from '../../public/types/promise-extended';

export function setApiOnPlace(db: Dexie, objs: Object[], tableNames: string[], dbschema: DbSchema) {
  tableNames.forEach(tableName => {
    const schema = dbschema[tableName];
    objs.forEach(obj => {
      const propDesc = getPropertyDescriptor(obj, tableName);
      if (!propDesc || ("value" in propDesc && propDesc.value === undefined)) {
        // Either the prop is not declared, or it is initialized to undefined.
        if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
          // obj is a Transaction prototype (or prototype of a subclass to Transaction)
          // Make the API a getter that returns this.table(tableName)
          setProp(obj, tableName, {
            get(this: Transaction) { return this.table(tableName); },
            set(value: any) {
              // Issue #1039
              // Let "this.schema = dbschema;" and other props in transaction constructor work even if there's a name collision with the table name.
              defineProperty(this, tableName, {value, writable: true, configurable: true, enumerable: true});
            }
          });
        } else {
          // Table will not be bound to a transaction (will use Dexie.currentTransaction)
          obj[tableName] = new db.Table(tableName, schema);
        }
      }
    });
  });
}

export function removeTablesApi(db: Dexie, objs: Object[]) {
  objs.forEach(obj => {
    for (let key in obj) {
      if (obj[key] instanceof db.Table) delete obj[key];
    }
  });
}

export function lowerVersionFirst(a: Version, b: Version) {
  return a._cfg.version - b._cfg.version;
}

export function runUpgraders(db: Dexie, oldVersion: number, idbUpgradeTrans: IDBTransaction, reject) {
  const globalSchema = db._dbSchema;
  if (idbUpgradeTrans.objectStoreNames.contains('$meta') && !globalSchema.$meta) {
    globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
    db._storeNames.push('$meta');
  }
  const trans = db._createTransaction('readwrite', db._storeNames, globalSchema);
  trans.create(idbUpgradeTrans);
  trans._completion.catch(reject);
  const rejectTransaction = trans._reject.bind(trans);
  const transless = PSD.transless || PSD;
  newScope(() => {
    PSD.trans = trans;
    PSD.transless = transless;
    if (oldVersion === 0) {
      // Create tables:
      keys(globalSchema).forEach(tableName => {
        createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
      });
      generateMiddlewareStacks(db, idbUpgradeTrans);
      Promise.follow(() => db.on.populate.fire(trans)).catch(rejectTransaction);
    } else {
      generateMiddlewareStacks(db, idbUpgradeTrans);
      return getExistingVersion(db, trans, oldVersion)
        .then(oldVersion => updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans))
        .catch(rejectTransaction);
    }
  });
}

export type UpgradeQueueItem = (idbtrans: IDBTransaction) => PromiseLike<any> | void;

export function patchCurrentVersion(db: Dexie, idbUpgradeTrans: IDBTransaction) {
  createMissingTables(db._dbSchema, idbUpgradeTrans);
  if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains('$meta')) {
    // Rolled over to the next 10-ies due to many schema upgrades without bumping version.
    // No problem! We pin the database to its expected version by adding the $meta table so that next
    // time the programmer bumps the version and attaches, an upgrader, that upgrader will indeed run,
    // as well any further upgraders coming after that.
    idbUpgradeTrans.db.createObjectStore('$meta').add(Math.ceil((idbUpgradeTrans.db.version / 10) - 1), 'version');
  }
  const globalSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
  adjustToExistingIndexNames(db, db._dbSchema, idbUpgradeTrans);
  const diff = getSchemaDiff(globalSchema, db._dbSchema);
  for (const tableChange of diff.change) {
    if (tableChange.change.length || tableChange.recreate) {
      console.warn(`Unable to patch indexes of table ${tableChange.name} because it has changes on the type of index or primary key.`);
      return;
    }
    const store = idbUpgradeTrans.objectStore(tableChange.name);
    tableChange.add.forEach(idx => {
      if (debug) console.debug(`Dexie upgrade patch: Creating missing index ${tableChange.name}.${idx.src}`);
      addIndex(store, idx);
    });
  }
}

function getExistingVersion(db: Dexie, trans: Transaction, oldVersion: number): PromiseExtended<number> {
  // In normal case, existing version is the native installed version divided by 10.
  // However, in case more than 10 schema changes have been made on the same version (such as while
  // developing an app), the native version may have passed beyond a multiple of 10 within the same version.
  // When that happens, a table $meta will have been created, containing a single entry with key "version"
  // and the value of the real old version to use when running upgraders going forward.
  if (trans.storeNames.includes('$meta')) {
    return trans.table('$meta').get('version').then(metaVersion => {
      return metaVersion != null ? metaVersion : oldVersion
    })
  } else {
    return Promise.resolve(oldVersion);
  }
}

function updateTablesAndIndexes(
  db: Dexie,
  oldVersion: number,
  trans: Transaction,
  idbUpgradeTrans: IDBTransaction)
{
  // Upgrade version to version, step-by-step from oldest to newest version.
  // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
  const queue: UpgradeQueueItem[] = [];
  const versions = db._versions;
  let globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
  let anyContentUpgraderHasRun = false;
  
  const versToRun = versions.filter(v => v._cfg.version >= oldVersion);
  if (versToRun.length === 0) {
    // Important not to continue at this point.
    // Coming here means we've already patched schema in patchCurrentVersion() after having
    // incremented native version to a value above the declared highest version.
    // When being in this mode, it means that there might be different versions the db competing
    // about it with different version of the schema. Therefore, we must avoid deleting tables
    // or indexes here so that both versions can co-exist until the application has been upgraded to
    // a version that declares no lower than the native version.
    // If after that, a downgrade happens again, we'll end up here again, accepting both versions
    // And we'll stay in this state until app developer releases a new declared version.
    return Promise.resolve(); 
  }
  
  versToRun.forEach(version => {
    queue.push(() => {
      const oldSchema = globalSchema;
      const newSchema = version._cfg.dbschema;
      adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
      adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);

      globalSchema = db._dbSchema = newSchema;

      const diff = getSchemaDiff(oldSchema, newSchema);
      // Add tables           
      diff.add.forEach(tuple => {
        createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
      });
      // Change tables
      diff.change.forEach(change => {
        if (change.recreate) {
          throw new exceptions.Upgrade("Not yet support for changing primary key");
        } else {
          const store = idbUpgradeTrans.objectStore(change.name);
          // Add indexes
          change.add.forEach(idx => addIndex(store, idx));
          // Update indexes
          change.change.forEach(idx => {
            store.deleteIndex(idx.name);
            addIndex(store, idx);
          });
          // Delete indexes
          change.del.forEach(idxName => store.deleteIndex(idxName));
        }
      });

      const contentUpgrade = version._cfg.contentUpgrade;

      if (contentUpgrade && version._cfg.version > oldVersion) {
        // Update db.core with new tables and indexes:
        generateMiddlewareStacks(db, idbUpgradeTrans);
        trans._memoizedTables = {}; // Invalidate memoization as transaction shape may change between versions.

        anyContentUpgraderHasRun = true;

        // Add to-be-deleted tables to contentUpgrade transaction
        let upgradeSchema = shallowClone(newSchema);
        diff.del.forEach(table => {
          upgradeSchema[table] = oldSchema[table];
        });

        // Safe to affect Transaction.prototype globally in this moment,
        // because when this code runs, there may not be any other code
        // that can access any transaction instance, else than this particular
        // upgrader function.
        removeTablesApi(db, [db.Transaction.prototype]);
        setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema), upgradeSchema);
        trans.schema = upgradeSchema;

        // Support for native async await.
        const contentUpgradeIsAsync = isAsyncFunction(contentUpgrade);
        if (contentUpgradeIsAsync) {
          incrementExpectedAwaits();
        }
        
        let returnValue: any;
        const promiseFollowed = Promise.follow(() => {
          // Finally, call the scope function with our table and transaction arguments.
          returnValue = contentUpgrade(trans);
          if (returnValue) {
            if (contentUpgradeIsAsync) {
              // contentUpgrade is a native async function - we know for sure returnValue is native promise.
              var decrementor = decrementExpectedAwaits.bind(null, null);
              returnValue.then(decrementor, decrementor);
            }
          }
        });
        return (returnValue && typeof returnValue.then === 'function' ?
          Promise.resolve(returnValue) : promiseFollowed.then(()=>returnValue));
      }
    });
    queue.push(idbtrans => {
      const newSchema = version._cfg.dbschema;
      // Delete old tables
      deleteRemovedTables(newSchema, idbtrans);
      // Restore the final API
      removeTablesApi(db, [db.Transaction.prototype]);
      setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
      trans.schema = db._dbSchema;
    });
    // Maintain the $meta table after this version's tables and indexes has been created and content upgraders have run.
    queue.push(idbtrans => {
      if (db.idbdb.objectStoreNames.contains('$meta')) {
        if (Math.ceil(db.idbdb.version / 10) === version._cfg.version) {
          // Remove $meta table if it's no more needed - we are in line with the native version
          db.idbdb.deleteObjectStore('$meta');
          delete db._dbSchema.$meta;
          db._storeNames = db._storeNames.filter(name => name !== '$meta');
        } else {
          // We're still not in line with the native version. Make sure to update the virtual version
          // to the successfully run version
          idbtrans.objectStore('$meta').put(version._cfg.version, 'version');
        }
      }
    }); 
  });

  // Now, create a queue execution engine
  function runQueue() {
    return queue.length ? Promise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
      Promise.resolve();
  }

  return runQueue().then(() => {
    createMissingTables(globalSchema, idbUpgradeTrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
  });
}

export interface SchemaDiff {
  del: string[],
  add: [string, TableSchema][];
  change: TableSchemaDiff[];
}

export interface TableSchemaDiff {
  name: string,
  recreate: boolean,
  del: string[],
  add: IndexSpec[],
  change: IndexSpec[]
}

export function getSchemaDiff(oldSchema: DbSchema, newSchema: DbSchema): SchemaDiff {
  const diff: SchemaDiff = {
    del: [], // Array of table names
    add: [], // Array of [tableName, newDefinition]
    change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
  };
  let table: string;
  for (table in oldSchema) {
    if (!newSchema[table]) diff.del.push(table);
  }
  for (table in newSchema) {
    const oldDef = oldSchema[table],
      newDef = newSchema[table];
    if (!oldDef) {
      diff.add.push([table, newDef]);
    } else {
      const change = {
        name: table,
        def: newDef,
        recreate: false,
        del: [],
        add: [],
        change: []
      };
      if (
          (
             // compare keyPaths no matter if string or string[]
             // compare falsy keypaths same no matter if they are null or empty string.
            ''+(oldDef.primKey.keyPath||'')
          ) !== (
            ''+(newDef.primKey.keyPath||'')
          ) ||
            // Compare the autoIncrement flag also
          (oldDef.primKey.auto !== newDef.primKey.auto))
      {
        // Primary key has changed. Remove and re-add table.
        change.recreate = true;
        diff.change.push(change);
      } else {
        // Same primary key. Just find out what differs:
        const oldIndexes = oldDef.idxByName;
        const newIndexes = newDef.idxByName;
        let idxName: string;
        for (idxName in oldIndexes) {
          if (!newIndexes[idxName]) change.del.push(idxName);
        }
        for (idxName in newIndexes) {
          const oldIdx = oldIndexes[idxName],
            newIdx = newIndexes[idxName];
          if (!oldIdx) change.add.push(newIdx);
          else if (oldIdx.src !== newIdx.src) change.change.push(newIdx);
        }
        if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
          diff.change.push(change);
        }
      }
    }
  }
  return diff;
}

export function createTable(
  idbtrans: IDBTransaction,
  tableName: string,
  primKey: IndexSpec,
  indexes: IndexSpec[]
) {
  const store = idbtrans.db.createObjectStore(
    tableName,
    primKey.keyPath ?
      { keyPath: primKey.keyPath, autoIncrement: primKey.auto } :
      { autoIncrement: primKey.auto }
  );
  indexes.forEach(idx => addIndex(store, idx));
  return store;
}

export function createMissingTables(newSchema: DbSchema, idbtrans: IDBTransaction) {
  keys(newSchema).forEach(tableName => {
    if (!idbtrans.db.objectStoreNames.contains(tableName)) {
      if (debug) console.debug('Dexie: Creating missing table', tableName);
      createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
    }
  });
}

export function deleteRemovedTables(newSchema: DbSchema, idbtrans: IDBTransaction) {
  [].slice.call(idbtrans.db.objectStoreNames).forEach(storeName =>
    newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName));
}

export function addIndex(store: IDBObjectStore, idx: IndexSpec) {
  store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
}

function buildGlobalSchema(
  db: Dexie,
  idbdb: IDBDatabase,
  tmpTrans: IDBTransaction
) {
  const globalSchema = {};
  const dbStoreNames = slice(idbdb.objectStoreNames, 0);
  dbStoreNames.forEach(storeName => {
    const store = tmpTrans.objectStore(storeName);
    let keyPath = store.keyPath;
    const primKey = createIndexSpec(
      nameFromKeyPath(keyPath),
      keyPath || "",
      true,
      false,
      !!store.autoIncrement,
      keyPath && typeof keyPath !== "string",
      true
    );
    const indexes: IndexSpec[] = [];
    for (let j = 0; j < store.indexNames.length; ++j) {
      const idbindex = store.index(store.indexNames[j]);
      keyPath = idbindex.keyPath;
      var index = createIndexSpec(
        idbindex.name,
        keyPath,
        !!idbindex.unique,
        !!idbindex.multiEntry,
        false,
        keyPath && typeof keyPath !== "string",
        false
      );
      indexes.push(index);
    }
    globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
  });
  return globalSchema;
}

export function readGlobalSchema(db: Dexie, idbdb: IDBDatabase, tmpTrans: IDBTransaction) {
  db.verno = idbdb.version / 10;
  const globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
  db._storeNames = slice(idbdb.objectStoreNames, 0);
  setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
}

export function verifyInstalledSchema(db: Dexie, tmpTrans: IDBTransaction): boolean {
  const installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
  const diff = getSchemaDiff(installedSchema, db._dbSchema);
  return !(diff.add.length || diff.change.some(ch => ch.add.length || ch.change.length));
}

export function adjustToExistingIndexNames(db: Dexie, schema: DbSchema, idbtrans: IDBTransaction) {
  // Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
  const storeNames = idbtrans.db.objectStoreNames;

  for (let i = 0; i < storeNames.length; ++i) {
    const storeName = storeNames[i];
    const store = idbtrans.objectStore(storeName);
    db._hasGetAll = 'getAll' in store;

    for (let j = 0; j < store.indexNames.length; ++j) {
      const indexName = store.indexNames[j];
      const keyPath = store.index(indexName).keyPath;
      const dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
      if (schema[storeName]) {
        const indexSpec = schema[storeName].idxByName[dexieName];
        if (indexSpec) {
          indexSpec.name = indexName;
          delete schema[storeName].idxByName[dexieName];
          schema[storeName].idxByName[indexName] = indexSpec;
        }
      }
    }
  }

  // Bug with getAll() on Safari ver<604 on Workers only, see discussion following PR #579
  if (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
    !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
    _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
    [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
  {
    db._hasGetAll = false;
  }
}

export function parseIndexSyntax(primKeyAndIndexes: string): IndexSpec[] {
  return primKeyAndIndexes.split(',').map((index, indexNum) => {
    const typeSplit = index.split(':');
    const type = typeSplit[1]?.trim();
    index = typeSplit[0].trim();
    if (type && type !== 'Y') throw new exceptions.Schema(`Unsupported type '${type}'`); // Y is currently the only supported type.
    const name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
    // Let keyPath of "[a+b]" be ["a","b"]:
    const keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;

    return createIndexSpec(
      name,
      keyPath || null,
      /\&/.test(index),
      /\*/.test(index),
      /\+\+/.test(index),
      isArray(keyPath),
      indexNum === 0,
      type
    );
  });
}
