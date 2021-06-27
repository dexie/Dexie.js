// Import types from the public API
import { Dexie as IDexie } from "../../public/types/dexie";
import { DexieOptions, DexieConstructor } from "../../public/types/dexie-constructor";
import { DbEvents } from "../../public/types/db-events";
//import { PromiseExtended, PromiseExtendedConstructor } from '../../public/types/promise-extended';
import { Table as ITable } from '../../public/types/table';
import { TableSchema } from "../../public/types/table-schema";
import { DbSchema } from '../../public/types/db-schema';

// Internal imports
import { Table, TableConstructor, createTableConstructor } from "../table";
import { Collection, CollectionConstructor, createCollectionConstructor } from '../collection';
import { WhereClause } from '../where-clause/where-clause';
import { WhereClauseConstructor, createWhereClauseConstructor } from '../where-clause/where-clause-constructor';
import { Transaction } from '../transaction';
import { TransactionConstructor, createTransactionConstructor } from '../transaction/transaction-constructor';
import { Version } from "../version/version";
import { VersionConstructor, createVersionConstructor } from '../version/version-constructor';

// Other imports...
import { DexieEventSet } from '../../public/types/dexie-event-set';
import { DexieExceptionClasses } from '../../public/types/errors';
import { DexieDOMDependencies } from '../../public/types/dexie-dom-dependencies';
import { nop, promisableChain } from '../../functions/chaining-functions';
import Promise, { PSD } from '../../helpers/promise';
import { extend, override, keys, hasOwn } from '../../functions/utils';
import Events from '../../helpers/Events';
import { maxString, connections, READONLY, READWRITE } from '../../globals/constants';
import { getMaxKey } from '../../functions/quirks';
import { exceptions } from '../../errors';
import { lowerVersionFirst } from '../version/schema-helpers';
import { dexieOpen } from './dexie-open';
import { wrap } from '../../helpers/promise';
import { _onDatabaseDeleted } from '../../helpers/database-enumerator';
import { eventRejectHandler } from '../../functions/event-wrappers';
import { extractTransactionArgs, enterTransactionScope } from './transaction-helpers';
import { TransactionMode } from '../../public/types/transaction-mode';
import { rejection } from '../../helpers/promise';
import { usePSD } from '../../helpers/promise';
import { DBCore } from '../../public/types/dbcore';
import { Middleware, DexieStacks } from '../../public/types/middleware';
import { virtualIndexMiddleware } from '../../dbcore/virtual-index-middleware';
import { hooksMiddleware } from '../../hooks/hooks-middleware';
import { IndexableType } from '../../public';
import { observabilityMiddleware } from '../../live-query/observability-middleware';
import { cacheExistingValuesMiddleware } from '../../dbcore/cache-existing-values-middleware';

export interface DbReadyState {
  dbOpenError: any;
  isBeingOpened: boolean;
  onReadyBeingFired: undefined | Function[];
  openComplete: boolean;
  dbReadyResolve: () => void;
  dbReadyPromise: Promise<any>;
  cancelOpen: (reason?: Error) => void;
  openCanceller: Promise<any> & { _stackHolder?: Error };
  autoSchema: boolean;
  vcFired?: boolean;
}

export class Dexie implements IDexie {
  _options: DexieOptions;
  _state: DbReadyState;
  _versions: Version[];
  _storeNames: string[];
  _deps: DexieDOMDependencies;
  _allTables: { [name: string]: Table; };
  _createTransaction: (this: Dexie, mode: IDBTransactionMode, storeNames: ArrayLike<string>, dbschema: { [tableName: string]: TableSchema; }, parentTransaction?: Transaction) => Transaction;
  _dbSchema: { [tableName: string]: TableSchema; };
  _hasGetAll?: boolean;
  _maxKey: IndexableType;
  _fireOnBlocked: (ev: Event) => void;
  _middlewares: {[StackName in keyof DexieStacks]?: Middleware<DexieStacks[StackName]>[]} = {};
  core: DBCore;

  name: string;
  verno: number = 0;
  idbdb: IDBDatabase | null;
  on: DbEvents;

  Table: TableConstructor;
  WhereClause: WhereClauseConstructor;
  Collection: CollectionConstructor;
  Version: VersionConstructor;
  Transaction: TransactionConstructor;

  constructor(name: string, options?: DexieOptions) {
    const deps = (Dexie as any as DexieConstructor).dependencies;
    this._options = options = {
      // Default Options
      addons: (Dexie as any as DexieConstructor).addons, // Pick statically registered addons by default
      autoOpen: true,                 // Don't require db.open() explicitely.
      // Default DOM dependency implementations from static prop.
      indexedDB: deps.indexedDB,      // Backend IndexedDB api. Default to browser env.
      IDBKeyRange: deps.IDBKeyRange,  // Backend IDBKeyRange api. Default to browser env.
      ...options
    };
    this._deps = {
      indexedDB: options.indexedDB as IDBFactory,
      IDBKeyRange: options.IDBKeyRange as typeof IDBKeyRange
    };
    const {
      addons,
    } = options;
    this._dbSchema = {};
    this._versions = [];
    this._storeNames = [];
    this._allTables = {};
    this.idbdb = null;
    const state: DbReadyState = {
      dbOpenError: null,
      isBeingOpened: false,
      onReadyBeingFired: null,
      openComplete: false,
      dbReadyResolve: nop,
      dbReadyPromise: null as Promise,
      cancelOpen: nop,
      openCanceller: null as Promise,
      autoSchema: true
    };
    state.dbReadyPromise = new Promise(resolve => {
      state.dbReadyResolve = resolve;
    });
    state.openCanceller = new Promise((_, reject) => {
      state.cancelOpen = reject;
    });
    this._state = state;
    this.name = name;
    this.on = Events(this, "populate", "blocked", "versionchange", "close", { ready: [promisableChain, nop] }) as DbEvents;
    this.on.ready.subscribe = override(this.on.ready.subscribe, subscribe => {
      return (subscriber, bSticky) => {
        (Dexie as any as DexieConstructor).vip(() => {
          const state = this._state;
          if (state.openComplete) {
            // Database already open. Call subscriber asap.
            if (!state.dbOpenError) Promise.resolve().then(subscriber);
            // bSticky: Also subscribe to future open sucesses (after close / reopen) 
            if (bSticky) subscribe(subscriber);
          } else if (state.onReadyBeingFired) {
            // db.on('ready') subscribers are currently being executed and have not yet resolved or rejected
            state.onReadyBeingFired.push(subscriber);
            if (bSticky) subscribe(subscriber);
          } else {
            // Database not yet open. Subscribe to it.
            subscribe(subscriber);
            // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
            const db = this;
            if (!bSticky) subscribe(function unsubscribe() {
              db.on.ready.unsubscribe(subscriber);
              db.on.ready.unsubscribe(unsubscribe);
            });
          }
        });
      }
    });

    // Create derived classes bound to this instance of Dexie:
    this.Collection = createCollectionConstructor(this);
    this.Table = createTableConstructor(this);
    this.Transaction = createTransactionConstructor(this);
    this.Version = createVersionConstructor(this);
    this.WhereClause = createWhereClauseConstructor(this);

    // Default subscribers to "versionchange" and "blocked".
    // Can be overridden by custom handlers. If custom handlers return false, these default
    // behaviours will be prevented.
    this.on("versionchange", ev => {
      // Default behavior for versionchange event is to close database connection.
      // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
      // Let's not block the other window from making it's delete() or open() call.
      // NOTE! This event is never fired in IE,Edge or Safari.
      if (ev.newVersion > 0)
        console.warn(`Another connection wants to upgrade database '${this.name}'. Closing db now to resume the upgrade.`);
      else
        console.warn(`Another connection wants to delete database '${this.name}'. Closing db now to resume the delete request.`);
      this.close();
      // In many web applications, it would be recommended to force window.reload()
      // when this event occurs. To do that, subscribe to the versionchange event
      // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
      // The reason for this is that your current web app obviously has old schema code that needs
      // to be updated. Another window got a newer version of the app and needs to upgrade DB but
      // your window is blocking it unless we close it here.
    });
    this.on("blocked", ev => {
      if (!ev.newVersion || ev.newVersion < ev.oldVersion)
        console.warn(`Dexie.delete('${this.name}') was blocked`);
      else
        console.warn(`Upgrade '${this.name}' blocked by other connection holding version ${ev.oldVersion / 10}`);
    });

    this._maxKey = getMaxKey(options.IDBKeyRange as typeof IDBKeyRange);

    this._createTransaction = (
      mode: IDBTransactionMode,
      storeNames: string[],
      dbschema: DbSchema,
      parentTransaction?: Transaction) => new this.Transaction(mode, storeNames, dbschema, parentTransaction);

    this._fireOnBlocked = ev => {
      this.on("blocked").fire(ev);
      // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
      connections
        .filter(c => c.name === this.name && c !== this && !c._state.vcFired)
        .map(c => c.on("versionchange").fire(ev));
    }

    // Default middlewares:
    this.use(virtualIndexMiddleware);
    this.use(hooksMiddleware);
    this.use(observabilityMiddleware);
    this.use(cacheExistingValuesMiddleware);

    // Call each addon:
    addons.forEach(addon => addon(this));
  }

  version(versionNumber: number): Version {
    if (isNaN(versionNumber) || versionNumber < 0.1) throw new exceptions.Type(`Given version is not a positive number`);
    versionNumber = Math.round(versionNumber * 10) / 10;
    if (this.idbdb || this._state.isBeingOpened)
      throw new exceptions.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, versionNumber);
    const versions = this._versions;
    var versionInstance = versions.filter(
      v => v._cfg.version === versionNumber)[0];
    if (versionInstance) return versionInstance;
    versionInstance = new this.Version(versionNumber);
    versions.push(versionInstance);
    versions.sort(lowerVersionFirst);
    versionInstance.stores({}); // Derive earlier schemas by default.
    // Disable autoschema mode, as at least one version is specified.
    this._state.autoSchema = false;
    return versionInstance;
  }

  _whenReady<T>(fn: () => Promise<T>): Promise<T> {
    return this._state.openComplete || PSD.letThrough ? fn() : new Promise<T>((resolve, reject) => {
      if (!this._state.isBeingOpened) {
        if (!this._options.autoOpen) {
          reject(new exceptions.DatabaseClosed());
          return;
        }
        this.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
      }
      this._state.dbReadyPromise.then(resolve, reject);
    }).then(fn);
  }

  use({stack, create, level, name}: Middleware<DBCore>): this {
    if (name) this.unuse({stack, name}); // Be able to replace existing middleware.
    const middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
    middlewares.push({stack, create, level: level == null ? 10 : level, name});
    middlewares.sort((a, b) => a.level - b.level);
    // Todo update db.core and db.tables...core ? Or should be expect this to have effect
    // only after next open()?
    return this;
  }

  unuse({stack, create}: Middleware<{stack: keyof DexieStacks}>): this;
  unuse({stack, name}: {stack: keyof DexieStacks, name: string}): this;
  unuse({stack, name, create}: {stack: keyof DexieStacks, name?: string, create?: Function}) {
    if (stack && this._middlewares[stack]) {
      this._middlewares[stack] = this._middlewares[stack].filter(mw =>
        create ? mw.create !== create : // Given middleware has a create method. Match that exactly.
        name ? mw.name !== name : // Given middleware spec 
        false);
    }
    return this;
  }

  open() {
    return dexieOpen(this);
  }

  close(): void {
    const idx = connections.indexOf(this),
      state = this._state;
    if (idx >= 0) connections.splice(idx, 1);
    if (this.idbdb) {
      try { this.idbdb.close(); } catch (e) { }
      this.idbdb = null;
    }
    this._options.autoOpen = false;
    state.dbOpenError = new exceptions.DatabaseClosed();
    if (state.isBeingOpened)
      state.cancelOpen(state.dbOpenError);

    // Reset dbReadyPromise promise:
    state.dbReadyPromise = new Promise(resolve => {
      state.dbReadyResolve = resolve;
    });
    state.openCanceller = new Promise((_, reject) => {
      state.cancelOpen = reject;
    });
  }

  delete(): Promise<void> {
    const hasArguments = arguments.length > 0;
    const state = this._state;
    return new Promise((resolve, reject) => {
      const doDelete = () => {
        this.close();
        var req = this._deps.indexedDB.deleteDatabase(this.name);
        req.onsuccess = wrap(() => {
          _onDatabaseDeleted(this._deps, this.name);
          resolve();
        });
        req.onerror = eventRejectHandler(reject);
        req.onblocked = this._fireOnBlocked;
      }

      if (hasArguments) throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
      if (state.isBeingOpened) {
        state.dbReadyPromise.then(doDelete);
      } else {
        doDelete();
      }
    });
  }

  backendDB() {
    return this.idbdb;
  }

  isOpen() {
    return this.idbdb !== null;
  }

  hasBeenClosed() {
    const dbOpenError = this._state.dbOpenError;
    return dbOpenError && (dbOpenError.name === 'DatabaseClosed');
  }

  hasFailed() {
    return this._state.dbOpenError !== null;
  }

  dynamicallyOpened() {
    return this._state.autoSchema;
  }

  get tables () {
    return keys(this._allTables).map(name => this._allTables[name]);
  }

  transaction(): Promise {
    const args = extractTransactionArgs.apply(this, arguments);
    return this._transaction.apply(this, args);
  }

  _transaction(mode: TransactionMode, tables: Array<ITable | string>, scopeFunc: Function) {
    let parentTransaction = PSD.trans as Transaction | undefined;
    // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
    if (!parentTransaction || parentTransaction.db !== this || mode.indexOf('!') !== -1) parentTransaction = null;
    const onlyIfCompatible = mode.indexOf('?') !== -1;
    mode = mode.replace('!', '').replace('?', '') as TransactionMode; // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.
    let idbMode: IDBTransactionMode,
        storeNames;

    try {
        //
        // Get storeNames from arguments. Either through given table instances, or through given table names.
        //
        storeNames = tables.map(table => {
            var storeName = table instanceof this.Table ? table.name : table;
            if (typeof storeName !== 'string') throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
            return storeName;
        });

        //
        // Resolve mode. Allow shortcuts "r" and "rw".
        //
        if (mode == "r" || mode === READONLY)
          idbMode = READONLY;
        else if (mode == "rw" || mode == READWRITE)
          idbMode = READWRITE;
        else
            throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);

        if (parentTransaction) {
            // Basic checks
            if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                if (onlyIfCompatible) {
                    // Spawn new transaction instead.
                    parentTransaction = null; 
                }
                else throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
            }
            if (parentTransaction) {
                storeNames.forEach(storeName => {
                    if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                        if (onlyIfCompatible) {
                            // Spawn new transaction instead.
                            parentTransaction = null; 
                        }
                        else throw new exceptions.SubTransaction("Table " + storeName +
                            " not included in parent transaction.");
                    }
                });
            }
            if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                // '?' mode should not keep using an inactive transaction.
                parentTransaction = null;
            }
        }
    } catch (e) {
        return parentTransaction ?
            parentTransaction._promise(null, (_, reject) => {reject(e);}) :
            rejection (e);
    }
    // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
    const enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
    return (parentTransaction ?
        parentTransaction._promise(idbMode, enterTransaction, "lock") :
        PSD.trans ?
            // no parent transaction despite PSD.trans exists. Make sure also
            // that the zone we create is not a sub-zone of current, because
            // Promise.follow() should not wait for it if so.
            usePSD(PSD.transless, ()=>this._whenReady(enterTransaction)) :
            this._whenReady (enterTransaction));
  }

  table(tableName: string): Table;
  table<T, TKey extends IndexableType=IndexableType>(tableName: string): ITable<T, TKey>;
  table(tableName: string): Table {
    if (!hasOwn(this._allTables, tableName)) {
      throw new exceptions.InvalidTable(`Table ${tableName} does not exist`); }
    return this._allTables[tableName];
  }
}
