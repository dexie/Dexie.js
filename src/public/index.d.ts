/* public/index.d.ts - The source of dexie.d.ts
 * 
 * We're using dts-bundle-generator to bundle this file to the
 * final version.
 * 
 * We're separating public from internal types as a way to keep package-private
 * properties and types without exposing them to the public API.
 * 
 * All internal types extends their corresponding public type though, so that
 * we still get the benefit from the tsc compilator checking type correctness.
 */

import { DexieConstructor} from './types/dexie-constructor';
declare var Dexie: DexieConstructor;

/* For backard compatibility, define a "module" Dexie and put types
 * such as Table in there as well. This must be in order for existing
 * samples and app code out there to work without modifications. Which
 * is very important as it would otherwise impose a lot of work for app
 * devs upgrading.
 */
import { Table } from './types/table';
import { Collection } from './types/collection';
import { PromiseExtended } from './types/promise-extended';
import { Observable } from './types/observable';
import { IntervalTree, RangeSetConstructor } from './types/rangeset';
import { Dexie, TableProp } from './types/dexie';
export type { TableProp };
import { PropModification, PropModSpec } from './types/prop-modification';
import { YjsDoc, YSyncState, YUpdateRow, YLastCompressed, DexieYDocMeta, YDocCache } from './types/yjs-related';
export { PropModification, PropModSpec };
export * from './types/entity';
export * from './types/entity-table';
export { UpdateSpec } from './types/update-spec';
export * from './types/insert-type';
export type { YSyncState, YUpdateRow, YLastCompressed, DexieYDocMeta };
import { DexieYProvider } from '../yjs/DexieYProvider';

// Alias of Table and Collection in order to be able to refer them from module below...
interface _Table<T, TKey, TInsertType> extends Table<T, TKey, TInsertType> {}
interface _Collection<T,TKey> extends Collection<T,TKey> {}

// Besides being the only exported value, let Dexie also be
// a namespace for types...
declare module Dexie {
  // The "Dexie.Promise" type.
  type Promise<T=any> = PromiseExtended<T> // Because many samples have been Dexie.Promise.
  // The "Dexie.Table" interface. Same as named exported interface Table.
  interface Table<T=any,Key=any,TInsertType=T> extends _Table<T,Key,TInsertType> {} // Because all samples have been Dexie.Table<...>
  // The "Dexie.Collection" interface. Same as named exported interface Collection.
  interface Collection<T=any,Key=any> extends _Collection<T, Key> {} // Because app-code may declare it.
}

/** Explicitely export IndexableType. Mostly for backward compatibility.*/
export { IndexableType } from './types/indexable-type';

/** 'Dexie' is the only value export (non-type). Export it both by name and as a default export.
 * API user may choose whether to use the named or defualt export. All samples
 * have been using the default export until version 2.0.1.
*/
export { Dexie };
export function liveQuery<T>(querier: () => T | Promise<T>): Observable<T>;
export function mergeRanges(target: IntervalTree, newSet: IntervalTree): void;
export function rangesOverlap(
  rangeSet1: IntervalTree,
  rangeSet2: IntervalTree
): boolean;
declare var RangeSet: RangeSetConstructor;
export function cmp(a: any, b: any): number;
export function replacePrefix(a: string, b: string): PropModification;
export function add(num: number | bigint | any[]): PropModification;
export function remove(num: number | bigint | any[]): PropModification;
/*declare var DexieYProvider: {
  (doc: YjsDoc): DexieYProvider;
  new (doc: YjsDoc): DexieYProvider;
  new (doc: YjsDoc, takeDocOwnership: boolean): DexieYProvider;
  getDocCache: (db: Dexie) => YDocCache;
  docToProviderWeakMap: WeakMap<YjsDoc, DexieYProvider>;
  currentUpdateRow: YUpdateRow | null;
}*/

export { RangeSet, DexieYProvider };

/** Exporting 'Dexie' as the default export.
 **/
export default Dexie;
