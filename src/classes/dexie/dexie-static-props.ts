import { Dexie as _Dexie } from './dexie';
import { props, derive, extend, override, getByKeyPath, setByKeyPath, delByKeyPath, shallowClone, deepClone, getObjectDiff, asap, _global } from '../../functions/utils';
import { fullNameExceptions } from '../../errors';
import { DexieConstructor } from '../../public/types/dexie-constructor';
import { getDatabaseNames } from '../../helpers/database-enumerator';
import { PSD } from '../../helpers/promise';
import { usePSD } from '../../helpers/promise';
import { newScope } from '../../helpers/promise';
import { rejection } from '../../helpers/promise';
import { awaitIterator } from '../../helpers/yield-support';
import Promise from '../../helpers/promise';
import * as Debug from '../../helpers/debug';
import { dexieStackFrameFilter, minKey, connections, DEXIE_VERSION } from '../../globals/constants';
import Events from '../../helpers/Events';
import { exceptions } from '../../errors';
import { errnames } from '../../errors';
import { getMaxKey } from '../../functions/quirks';
import { vip } from './vip';
import { globalEvents } from '../../globals/global-events';
import { liveQuery } from '../../live-query/live-query';
import { extendObservabilitySet } from '../../live-query/extend-observability-set';
import { domDeps } from './dexie-dom-dependencies';

/* (Dexie) is an instance of DexieConstructor, as defined in public/types/dexie-constructor.d.ts
*  (new Dexie()) is an instance of Dexie, as defined in public/types/dexie.d.ts
* 
* Why we're doing this?

* Because we've choosen to define the public Dexie API using a DexieConstructor interface
* rather than declaring a class. On that interface, all static props are defined.
* In practice, class Dexie's constructor implements DexieConstructor and all member props
* are defined in interface Dexie. We could say, it's a typescript limitation of not being
* able to define a static interface that forces us to do the cast below.
*/
const Dexie = _Dexie as any as DexieConstructor;

//
// Set all static methods and properties onto Dexie:
// 
props(Dexie, {

  // Dexie.BulkError = class BulkError {...};
  // Dexie.XXXError = class XXXError {...};
  ...fullNameExceptions,

  //
  // Static delete() method.
  //
  delete(databaseName: string) {
    const db = new Dexie(databaseName);
    return db.delete();
  },

  //
  // Static exists() method.
  //
  exists(name: string) {
    return new Dexie(name, { addons: [] }).open().then(db => {
      db.close();
      return true;
    }).catch('NoSuchDatabaseError', () => false);
  },

  //
  // Static method for retrieving a list of all existing databases at current host.
  //
  getDatabaseNames(cb) {
    try {
      return getDatabaseNames(Dexie.dependencies).then(cb);
    } catch {
      return rejection(new exceptions.MissingAPI());
    }
  },

  /** @deprecated */
  defineClass() {
    function Class(content) {
      extend(this, content);
    }
    return Class;
  },

  ignoreTransaction(scopeFunc) {
    // In case caller is within a transaction but needs to create a separate transaction.
    // Example of usage:
    //
    // Let's say we have a logger function in our app. Other application-logic should be unaware of the
    // logger function and not need to include the 'logentries' table in all transaction it performs.
    // The logging should always be done in a separate transaction and not be dependant on the current
    // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
    //
    //     Dexie.ignoreTransaction(function() {
    //         db.logentries.add(newLogEntry);
    //     });
    //
    // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
    // in current Promise-scope.
    //
    // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
    // API for this because
    //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
    //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
    //  3) setImmediate() is not supported in the ES standard.
    //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
    return PSD.trans ?
      usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
      scopeFunc(); // No need to change scope because there is no ongoing transaction.
  },

  vip,

  async: function (generatorFn: Function) {
    return function () {
      try {
        var rv = awaitIterator(generatorFn.apply(this, arguments));
        if (!rv || typeof rv.then !== 'function')
          return Promise.resolve(rv);
        return rv;
      } catch (e) {
        return rejection(e);
      }
    };
  },

  spawn: function (generatorFn, args, thiz) {
    try {
      var rv = awaitIterator(generatorFn.apply(thiz, args || []));
      if (!rv || typeof rv.then !== 'function')
        return Promise.resolve(rv);
      return rv;
    } catch (e) {
      return rejection(e);
    }
  },

  // Dexie.currentTransaction property
  currentTransaction: {
    get: () => PSD.trans || null
  },

  waitFor: function (promiseOrFunction, optionalTimeout) {
    // If a function is provided, invoke it and pass the returning value to Transaction.waitFor()
    const promise = Promise.resolve(
      typeof promiseOrFunction === 'function' ?
        Dexie.ignoreTransaction(promiseOrFunction) :
        promiseOrFunction)
      .timeout(optionalTimeout || 60000); // Default the timeout to one minute. Caller may specify Infinity if required.       

    // Run given promise on current transaction. If no current transaction, just return a Dexie promise based
    // on given value.
    return PSD.trans ?
      PSD.trans.waitFor(promise) :
      promise;
  },

  // Export our Promise implementation since it can be handy as a standalone Promise implementation
  Promise: Promise,

  // Dexie.debug proptery:
  // Dexie.debug = false
  // Dexie.debug = true
  // Dexie.debug = "dexie" - don't hide dexie's stack frames.
  debug: {
    get: () => Debug.debug,
    set: value => {
      Debug.setDebug(value, value === 'dexie' ? () => true : dexieStackFrameFilter);
    }
  },

  // Export our derive/extend/override methodology
  derive: derive, // Deprecate?
  extend: extend, // Deprecate?
  props: props,
  override: override, // Deprecate?
  // Export our Events() function - can be handy as a toolkit
  Events: Events,
  on: globalEvents,
  liveQuery,
  extendObservabilitySet,
  // Utilities
  getByKeyPath: getByKeyPath,
  setByKeyPath: setByKeyPath,
  delByKeyPath: delByKeyPath,
  shallowClone: shallowClone,
  deepClone: deepClone,
  getObjectDiff: getObjectDiff,
  asap: asap,
  //maxKey: new Dexie('',{addons:[]})._maxKey,
  minKey: minKey,
  // Addon registry
  addons: [],
  // Global DB connection list
  connections: connections,

  //MultiModifyError: exceptions.Modify, // Obsolete!
  errnames: errnames,

  // Export other static classes
  //IndexSpec: IndexSpec, Obsolete!
  //TableSchema: TableSchema, Obsolete!

  //
  // Dependencies
  //
  // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
  //
  // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
  // For node.js, you need to require indexeddb-js or similar and then set these deps.
  //
  dependencies: domDeps,

  // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
  semVer: DEXIE_VERSION,
  version: DEXIE_VERSION.split('.')
    .map(n => parseInt(n))
    .reduce((p, c, i) => p + (c / Math.pow(10, i * 2))),

  // https://github.com/dfahlander/Dexie.js/issues/186
  // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
  // x.default. Workaround: Set Dexie.default = Dexie.
  // default: Dexie, // Commented because solved in index-umd.ts instead.
  // Make it possible to import {Dexie} (non-default import)
  // Reason 1: May switch to that in future.
  // Reason 2: We declare it both default and named exported in d.ts to make it possible
  // to let addons extend the Dexie interface with Typescript 2.1 (works only when explicitely
  // exporting the symbol, not just default exporting)
  // Dexie: Dexie // Commented because solved in index-umd.ts instead.
});

Dexie.maxKey = getMaxKey(Dexie.dependencies.IDBKeyRange);
