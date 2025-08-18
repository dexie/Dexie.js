import { Dexie } from './dexie';
import * as Debug from '../../helpers/debug';
import { rejection } from '../../helpers/promise';
import { exceptions } from '../../errors';
import { eventRejectHandler, preventDefault } from '../../functions/event-wrappers';
import Promise, { wrap } from '../../helpers/promise';
import { connections } from '../../globals/constants';
import { runUpgraders, readGlobalSchema, adjustToExistingIndexNames, verifyInstalledSchema, patchCurrentVersion } from '../version/schema-helpers';
import { safariMultiStoreFix } from '../../functions/quirks';
import { _onDatabaseCreated } from '../../helpers/database-enumerator';
import { vip } from './vip';
import { promisableChain, nop } from '../../functions/chaining-functions';
import { generateMiddlewareStacks } from './generate-middleware-stacks';
import { slice } from '../../functions/utils';
import safari14Workaround from 'safari-14-idb-fix';
import { type ObservabilitySet } from '../../public/types/db-events';
import { RangeSet } from '../../helpers/rangeset';
import { DEXIE_STORAGE_MUTATED_EVENT_NAME, globalEvents } from '../../globals/global-events';
import { signalSubscribersNow } from '../../live-query/cache/signalSubscribers';

export function dexieOpen (db: Dexie) {
  const state = db._state;
  const {indexedDB} = db._deps;
  if (state.isBeingOpened || db.idbdb)
      return state.dbReadyPromise.then<Dexie>(() => state.dbOpenError ?
        rejection (state.dbOpenError) :
        db);
  state.isBeingOpened = true;
  state.dbOpenError = null;
  state.openComplete = false;
  const openCanceller = state.openCanceller;
  let nativeVerToOpen = Math.round(db.verno * 10);
  let schemaPatchMode = false;

  function throwIfCancelled() {
    // If state.openCanceller object reference is replaced, it means db.close() has been called,
    // meaning this open flow should be cancelled.
    if (state.openCanceller !== openCanceller) throw new exceptions.DatabaseClosed('db.open() was cancelled');
  }
  
  // Function pointers to call when the core opening process completes.
  let resolveDbReady = state.dbReadyResolve,
      // upgradeTransaction to abort on failure.
      upgradeTransaction: (IDBTransaction | null) = null,
      wasCreated = false;

  const tryOpenDB = () => new Promise((resolve, reject) => {
    throwIfCancelled();
    // If no API, throw!
    if (!indexedDB) throw new exceptions.MissingAPI();
    const dbName = db.name;
    
    const req = state.autoSchema || !nativeVerToOpen ?
      indexedDB.open(dbName) :
      indexedDB.open(dbName, nativeVerToOpen);
    if (!req) throw new exceptions.MissingAPI(); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
    req.onerror = eventRejectHandler(reject);
    req.onblocked = wrap(db._fireOnBlocked);
    req.onupgradeneeded = wrap (e => {
        upgradeTransaction = req.transaction;
        if (state.autoSchema && !db._options.allowEmptyDB) { // Unless an addon has specified db._allowEmptyDB, lets make the call fail.
            // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
            // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
            // do not create a new database by accident here.
            req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
            upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
            // Close database and delete it.
            req.result.close();
            const delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
            delreq.onsuccess = delreq.onerror = wrap(() => {
                reject (new exceptions.NoSuchDatabase(`Database ${dbName} doesnt exist`));
            });
        } else {
            upgradeTransaction.onerror = eventRejectHandler(reject);
            const oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
            wasCreated = oldVer < 1;
            db.idbdb = req.result;
            if (schemaPatchMode) {
              patchCurrentVersion(db, upgradeTransaction);
            }
            runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
        }
    }, reject);
    
    req.onsuccess = wrap (() => {
        // Core opening procedure complete. Now let's just record some stuff.
        upgradeTransaction = null;
        const idbdb = db.idbdb = req.result;

        const objectStoreNames = slice(idbdb.objectStoreNames);
        if (objectStoreNames.length > 0) try {
          const tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), 'readonly');
          if (state.autoSchema) readGlobalSchema(db, idbdb, tmpTrans);
          else {
              adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
              if (!verifyInstalledSchema(db, tmpTrans) && !schemaPatchMode) {
                console.warn(`Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.`);
                idbdb.close();
                nativeVerToOpen = idbdb.version + 1;
                schemaPatchMode = true;
                return resolve (tryOpenDB()); // Try again with new version (nativeVerToOpen
              }
          }
          generateMiddlewareStacks(db, tmpTrans);
        } catch (e) {
          // Safari 8 may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
          // BUGBUG: It will bail out anyway as of Dexie 3.
          // Should we support Safari 8 anymore? Believe all
          // Dexie users use the shim for that platform anyway?!
          // If removing Safari 8 support, go ahead and remove the safariMultiStoreFix() function
          // as well as absurd upgrade version quirk for Safari.
        }
        
        connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.
        
        idbdb.onversionchange = wrap(ev => {
            state.vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
            db.on("versionchange").fire(ev);
        });
        
        idbdb.onclose = wrap(() => {
          // Resolve issue #2186: Once Dexie.on.close is triggered, Dexie.isOpen() is still true.
          // Let the code path be the same as for db.close() so that db.isOpen() returns false
          // and every other state is reset the same way.          
          db.close({ disableAutoOpen: false })
        });

        if (wasCreated) _onDatabaseCreated(db._deps, dbName);

        resolve();

    }, reject);
  }).catch(err => {
    switch (err?.name) {
      case "UnknownError":
        if (state.PR1398_maxLoop > 0) {
          // Bug in Chrome after clearing site data
          // https://github.com/dexie/Dexie.js/issues/543#issuecomment-1795736695
          state.PR1398_maxLoop--;
          console.warn('Dexie: Workaround for Chrome UnknownError on open()');
          return tryOpenDB();
        }
        break;
      case "VersionError":
        if (nativeVerToOpen > 0) {
          nativeVerToOpen = 0;
          return tryOpenDB();
        }
        break;
    }
    return Promise.reject(err);
  });
  
  // safari14Workaround = Workaround by jakearchibald for new nasty bug in safari 14.
  return Promise.race([
    openCanceller,
    (typeof navigator === 'undefined' ? Promise.resolve() : safari14Workaround()).then(tryOpenDB)
  ]).then(() => {
      // Before finally resolving the dbReadyPromise and this promise,
      // call and await all on('ready') subscribers:
      // Dexie.vip() makes subscribers able to use the database while being opened.
      // This is a must since these subscribers take part of the opening procedure.
      throwIfCancelled();
      state.onReadyBeingFired = [];
      return Promise.resolve(vip(()=>db.on.ready.fire(db.vip))).then(function fireRemainders() {
          if (state.onReadyBeingFired.length > 0) {
              // In case additional subscribers to db.on('ready') were added during the time db.on.ready.fire was executed.
              let remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
              state.onReadyBeingFired = [];
              return Promise.resolve(vip(()=>remainders(db.vip))).then(fireRemainders)
          }
      });
  }).finally(()=>{
      if (state.openCanceller === openCanceller) {
        // Only modify state if not cancelled in the mean time.
        state.onReadyBeingFired = null;
        state.isBeingOpened = false;
      }
  }).catch(err => {
      state.dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
      try {
        // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
        upgradeTransaction && upgradeTransaction.abort();
      } catch { }
      if (openCanceller === state.openCanceller) {
        // Still in the same open flow - The error reason was not due to external call to db.close().
        // Make sure to call db.close() to finalize resources.
        db._close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
      }
      return rejection (err);
  }).finally(()=>{
    state.openComplete = true;
    resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
  }).then(()=>{
    if (wasCreated) {
      // Propagate full range on primary keys and indexes on all tables now that the DB is ready and opened,
      // and all upgraders and on('ready') subscribers have run.
      const everything: ObservabilitySet = {};
      db.tables.forEach(table => {
        table.schema.indexes.forEach(idx => {
          if (idx.name) everything[`idb://${db.name}/${table.name}/${idx.name}`] = new RangeSet(-Infinity, [[[]]]);
        });
        everything[`idb://${db.name}/${table.name}/`] = everything[`idb://${db.name}/${table.name}/:dels`] = new RangeSet(-Infinity, [[[]]]);
      });
      // Database was created. If another tab had it open when it was deleted and reopened, that tab must be updated now.
      globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything);
      // Wipe the cache and trigger optimistic queries:
      signalSubscribersNow(everything, true);
    }
    // Resolve the db.open() with the db instance.
    return db;
  });
}
