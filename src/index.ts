import DexiePromise from './helpers/promise';
import { mapError } from './errors';
import { Dexie } from './classes/dexie';
import { defineDexieStaticProperties } from './classes/dexie/dexie-static-props';
import { DexieConstructor } from './public/types/dexie-constructor';
import * as Debug from './helpers/debug';
import { dexieStackFrameFilter } from './globals/constants';
import { initDatabaseEnumerator } from './helpers/database-enumerator';

// Generate all static properties of Dexie dynamically:
defineDexieStaticProperties(Dexie as any as DexieConstructor);

// Init Database Enumerator (for Dexie.getDatabaseNames())
initDatabaseEnumerator((Dexie as any as DexieConstructor).dependencies.indexedDB);

// Set rejectionMapper of DexiePromise so that it generally tries to map
// DOMErrors and DOMExceptions to a DexieError instance with same name but with
// async stack support and with a prototypal inheritance from DexieError and Error.
// of Map DOMErrors and DOMExceptions to corresponding Dexie errors.
DexiePromise.rejectionMapper = mapError;

// Let the async stack filter focus on app code and filter away frames from dexie.min.js:
Debug.setDebug(Debug.debug, dexieStackFrameFilter);

export default Dexie;
