// Import types from the public API
import { Dexie as IDexie } from "./public/types/dexie";
import { DexieOptions, DexieConstructor, DexieConstructor } from "./public/types/dexie-constructor";
import { DbEvents } from "./public/types/db-events";
import { IDBValidKey, IDBKeyRangeConstructor, IDBFactory } from './public/types/indexeddb';
import { PromiseExtended, PromiseExtendedConstructor } from './public/types/promise-extended';
import { Table as ITable } from './public/types/table';
import { TableSchema } from "./public/types/table-schema";
import { IDBKeyRange } from "./public/types/indexeddb";

// Internal imports
import { Table } from "./table";
import { TableConstructor, createTableConstructor } from './table-constructor';
import { Collection } from './collection';
import { CollectionConstructor, createCollectionConstructor } from './collection-constructor';
import { WhereClause } from './where-clause';
import { WhereClauseConstructor, createWhereClauseConstructor } from './where-clause-constructor';
import { Transaction } from './transaction';
import { TransactionConstructor, createTransactionConstructor } from './transaction-constructor';
import { Version } from "./version";
import { VersionConstructor, createVersionConstructor } from './version-constructor';

// Other imports...
import { DexieEventSet } from './public/types/dexie-event-set';
import { DexieExceptionClasses } from './public/types/errors';
import { DexieDOMDependencies } from './public/types/dexie-dom-dependencies';
import { nop, promisableChain } from './functions/chaining-functions';
import Promise from './helpers/promise';
import { extend, override } from './functions/utils';
import Events from './helpers/Events';
import { maxString } from './globals/constants';
import { getMaxKey } from './functions/quirks';

export interface DbReadyState {
  dbOpenError: any;
  isBeingOpened: boolean;
  onReadyBeingFired: undefined | Function[];
  openComplete: boolean;
  dbReadyResolve: () => void;
  dbReadyPromise: Promise<any>;
  cancelOpen: () => void;
  openCanceller: Promise<any>;
  autoSchema: boolean;
}

export class Dexie implements IDexie {
  _options: DexieOptions;
  _state: DbReadyState;
  _versions: Version[];
  _storeNames: string[];
  _deps: DexieDOMDependencies;
  _allTables: { [name: string]: Table; };
  _createTransaction: (this: Dexie, mode: IDBTransactionMode, storeNames: ArrayLike<string>, dbschema: { [tableName: string]: TableSchema; }, parentTransaction?: Transaction) => any;
  _dbSchema: { [tableName: string]: TableSchema; };
  _hasGetAll?: boolean;
  _maxKey: IDBValidKey;

  name: string;
  tables: Table[];
  verno: number;
  idbdb: IDBDatabase | null;

  static addons: Array<(db: Dexie) => void>;
  static version: number;
  static maxKey: IDBValidKey;
  static minKey: IDBValidKey;
  static dependencies: DexieDOMDependencies;
  static vip: (any)=> any;
  static ignoreTransaction: any;
  
  Table: TableConstructor;
  WhereClause: WhereClauseConstructor;
  Collection: CollectionConstructor;
  Version: VersionConstructor;
  Transaction: TransactionConstructor;

  constructor(name: string, options?: DexieOptions) {
    const deps = Dexie.dependencies;
    options = {
      // Default Options
      addons: Dexie.addons,           // Pick statically registered addons by default
      autoOpen: true,                 // Don't require db.open() explicitely.
      // Default DOM dependency implementations from static prop.
      indexedDB: deps.indexedDB,      // Backend IndexedDB api. Default to browser env.
      IDBKeyRange: deps.IDBKeyRange,  // Backend IDBKeyRange api. Default to browser env.
      ...options
    };
    this._deps.indexedDB = options.indexedDB;
    this._deps.IDBKeyRange = options.IDBKeyRange;
    const {
      addons,
      autoOpen,
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
      dbReadyPromise: new Promise(resolve => {
        state.dbReadyResolve = resolve;
      }),
      cancelOpen: nop,
      openCanceller: new Promise((_, reject) => {
        state.cancelOpen = reject;
      }),
      autoSchema: true
    };
    this._state = state;
    this.name = name;
    this.on = Events(this, "populate", "blocked", "versionchange", { ready: [promisableChain, nop] }) as DbEvents;
    this.on.ready.subscribe = override(this.on.ready.subscribe, subscribe => {
      return (subscriber, bSticky) => {
        Dexie.vip(() => {
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

    this._maxKey = getMaxKey(options.IDBKeyRange);
    
    // Call each addon:
    addons.forEach(addon => addon(this));
  }

  version(versionNumber: Number): Version {
    throw new Error("Method not implemented.");
  }
  on: DbEvents;
  open(): PromiseExtended<Dexie> {
    throw new Error("Method not implemented.");
  }
  table(tableName: string): Table;
  table<T, TKey extends IDBValidKey=IDBValidKey>(tableName: string): ITable<T, TKey>;
  table(tableName: string): Table {
    throw new Error("Method not implemented.");
  }
  /*transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", table: Table<any, any>, table2: Table<any, any>, table3: Table<any, any>, table4: Table<any, any>, table5: Table<any, any>, scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction<U>(mode: "r" | "r!" | "r?" | "rw" | "rw!" | "rw?", tables: Table<any, any>[], scope: () => U | PromiseLike<U>): PromiseExtended<U>;
  transaction(mode: any, table: any, table2: any, table3?: any, table4?: any, table5?: any, scope?: any) {
    throw new Error("Method not implemented.");
  }*/
  transaction(...args): PromiseExtended {
    throw new Error("Method not implemented.");
  }

  close(): void {
    throw new Error("Method not implemented.");
  }
  delete(): PromiseExtended<void> {
    throw new Error("Method not implemented.");
  }
  isOpen(): boolean {
    throw new Error("Method not implemented.");
  }
  hasBeenClosed(): boolean {
    throw new Error("Method not implemented.");
  }
  hasFailed(): boolean {
    throw new Error("Method not implemented.");
  }
  dynamicallyOpened(): boolean {
    throw new Error("Method not implemented.");
  }
  backendDB() {
    return this.idbdb;
  }
  vip<U>(scopeFunction: () => U): U {
    throw new Error("Method not implemented.");
  }
}
