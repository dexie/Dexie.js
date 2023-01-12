import { Dexie } from './classes/dexie';
import { DexieConstructor } from './public/types/dexie-constructor';
import { DexiePromise } from './helpers/promise';
import { mapError } from './errors';
import * as Debug from './helpers/debug';
import { dexieStackFrameFilter } from './globals/constants';

// Generate all static properties such as Dexie.maxKey etc
// (implement interface DexieConstructor):
import './classes/dexie/dexie-static-props';
import './live-query/enable-broadcast';
import { liveQuery } from './live-query/live-query';
import { Entity } from './classes/entity/Entity';
import { cmp } from './functions/cmp';

// Set rejectionMapper of DexiePromise so that it generally tries to map
// DOMErrors and DOMExceptions to a DexieError instance with same name but with
// async stack support and with a prototypal inheritance from DexieError and Error.
// of Map DOMErrors and DOMExceptions to corresponding Dexie errors.
DexiePromise.rejectionMapper = mapError;

// Let the async stack filter focus on app code and filter away frames from dexie.min.js:
Debug.setDebug(Debug.debug, dexieStackFrameFilter);

export { RangeSet, mergeRanges, rangesOverlap } from "./helpers/rangeset";
export { Dexie, liveQuery }; // Comply with public/index.d.ts.
export { Entity };
export { cmp };
export default Dexie;
