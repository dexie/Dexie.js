// Type definitions for Dexie v{version}
// Project: https://github.com/dfahlander/Dexie.js
// Definitions by: David Fahlander <http://github.com/dfahlander>

export * from './types/indexable-type';
export * from './types/transaction-mode';
export * from './interfaces/collection';
export * from './interfaces/db-events';
export * from './interfaces/dexie-constructor';
export * from './interfaces/dexie-event-set';
export * from './interfaces/dexie-event';
export * from './interfaces/dexie';
export * from './interfaces/index-spec';
export * from './interfaces/table-hooks';
export * from './interfaces/table-schema';
export * from './interfaces/table';
export * from './interfaces/transaction';
export * from './interfaces/version';
export * from './interfaces/where-clause';

import { DexieConstructor } from './interfaces/dexie-constructor';

export declare const Dexie: DexieConstructor;
