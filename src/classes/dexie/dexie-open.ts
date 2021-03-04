import { Dexie } from './dexie';
import * as Debug from '../../helpers/debug';
import { rejection } from '../../helpers/promise';
import { exceptions } from '../../errors';
import { eventRejectHandler, preventDefault } from '../../functions/event-wrappers';
import Promise, { wrap } from '../../helpers/promise';
import { connections } from '../../globals/constants';
import { runUpgraders, readGlobalSchema, adjustToExistingIndexNames, verifyInstalledSchema } from '../version/schema-helpers';
import { safariMultiStoreFix } from '../../functions/quirks';
import { _onDatabaseCreated } from '../../helpers/database-enumerator';
import { vip } from './vip';
import { promisableChain, nop } from '../../functions/chaining-functions';
import { generateMiddlewareStacks } from './generate-middleware-stacks';
import { slice } from '../../functions/utils';

export function dexieOpen (db: Dexie) {
  const state = db._state;
  const {indexedDB} = db._deps;
  if (state.isBeingOpened || db.idbdb)
      return state.dbReadyPromise.then<Dexie>(() => state.dbOpenError ?
        rejection (state.dbOpenError) :
        db);
  Debug.debug && (state.openCanceller._stackHolder = Debug.getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
  state.isBeingOpened = true;
  state.dbOpenError = null;
  state.openComplete = false;
  
  // Function pointers to call when the core opening process completes.
  let resolveDbReady = state.dbReadyResolve,
      // upgradeTransaction to abort on failure.
      upgradeTransaction: (IDBTransaction | null) = null,
      wasCreated = false;
  
  return Promise.race([state.openCanceller, new Promise((resolve, reject) => {
      // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
      // IE fails when deleting objectStore after reading from it.
      // A future version of Dexie.js will stopover an intermediate version to workaround this.
      // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
      
      // If no API, throw!
      if (!indexedDB) throw new exceptions.MissingAPI();
      const dbName = db.name;
      
      const req = state.autoSchema ?
        indexedDB.open(dbName) :
        indexedDB.open(dbName, Math.round(db.verno * 10));
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
              var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
              wasCreated = oldVer < 1;
              db.idbdb = req.result;
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
                if (!verifyInstalledSchema(db, tmpTrans)) {
                    console.warn(`Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.`);
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
          
          idbdb.onclose = wrap(ev => {
              db.on("close").fire(ev);
          });

          if (wasCreated) _onDatabaseCreated(db._deps, dbName);

          resolve();

      }, reject);
  })]).then(() => {
      // Before finally resolving the dbReadyPromise and this promise,
      // call and await all on('ready') subscribers:
      // Dexie.vip() makes subscribers able to use the database while being opened.
      // This is a must since these subscribers take part of the opening procedure.
      state.onReadyBeingFired = [];
      return Promise.resolve(vip(db.on.ready.fire)).then(function fireRemainders() {
          if (state.onReadyBeingFired.length > 0) {
              // In case additional subscribers to db.on('ready') were added during the time db.on.ready.fire was executed.
              let remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
              state.onReadyBeingFired = [];
              return Promise.resolve(vip(remainders)).then(fireRemainders)
          }
      });
  }).finally(()=>{
      state.onReadyBeingFired = null;
  }).then(()=>{
      // Resolve the db.open() with the db instance.
      state.isBeingOpened = false;
      return db;
  }).catch(err => {
      try {
          // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
          upgradeTransaction && upgradeTransaction.abort();
      } catch (e) { }
      state.isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
      db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
      // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
      state.dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
      return rejection (state.dbOpenError);
  }).finally(()=>{
      state.openComplete = true;
      resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
  });
}
