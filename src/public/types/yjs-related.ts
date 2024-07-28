/* Since dexie use "bring your own Y" approach, we provide a
 * minimal interface that we require from Yjs document.
 * 
 * We only list the interface that dexie or dexie-cloud might need to call on this
 * library.
 * 
 */

import { Dexie } from "./dexie";
import { DexieEvent } from "./dexie-event";
import { DexieEventSet } from "./dexie-event-set";
import { EntityTable } from "./entity-table";
import { IndexableType } from "./indexable-type";
import { Table } from "./table";

export interface DucktypedY {
  Doc: new(options?: {guid?: string, collectionid?: string, gc?: boolean, gcFilter?: any, meta?: any, autoLoad?: boolean, shouldLoad?: boolean}) => DucktypedYDoc;
  applyUpdate: Function;
  applyUpdateV2: Function;
  encodeStateAsUpdate: Function;
  encodeStateAsUpdateV2: Function;
  encodeStateVector: Function;
  encodeStateVectorFromUpdate: Function;
  encodeStateVectorFromUpdateV2: Function;
  mergeUpdates: Function;
  mergeUpdatesV2: Function;
  diffUpdate: Function;
  diffUpdateV2: Function;
  transact: Function;
}

export interface DucktypedYObservable {
  on (name: string, f: (...args: any[]) => any): void;
  off (name: string, f: (...args: any[]) => any): void;
  once (name: string, f: (...args: any[]) => any): void;
  emit (name: string, args: any[]): void;
  destroy(): void;
}

/** Dock-typed Y.Doc */
export interface DucktypedYDoc extends DucktypedYObservable {
  guid?: any;
  collectionid?: any;
  collection?: any;
  whenLoaded: PromiseLike<any>;
  whenSynced: PromiseLike<any>;
  isLoaded: any;
  isSynced: any;
  transact: any;
  toJSON: ()=>any;
  destroy: ()=>void;
  meta?: any;
  share: Map<any, any>;
}

export interface DexieYDocMeta {
  db: Dexie,
  updatesTable: string,
  parentTable: string,
  parentId: any
  //prop: string,
  //cacheKey: string
}

/** Docktyped Awareness */
export interface DucktypedAwareness extends DucktypedYObservable {
  doc: DucktypedYDoc;
  destroy: () => void;
  clientID: any;
  states: any;
  meta: any;
  getLocalState: any;
  setLocalState: any;
  setLocalStateField: any;
  getStates: any;
}


/** Stored in the updates table with auto-incremented number as primary key
 * 
 */
export interface YUpdateRow {
  /** The primary key in the update-table
   * 
   */
  i: number;

  /** The primary key of the row in related table holding the document property.
   * 
   */
  k: IndexableType;

  /** The Y update
   * 
   */
  u: Uint8Array;

  /** Optional flag
   * 
   * 1 = LOCAL_CHANGE_MAYBE_UNSYNCED
   * 
   */
  f?: number; 
}

/** Stored in update tables along with YUpdateRows but with a string representing the syncing enging, as primary key
 * A syncing engine can create an YSyncer row with an unsentFrom value set to the a number representing primary key (i)
 * of updates that has not been sent to server or peer yet. Dexie will spare all updates that occur after the least
 * unsentFrom value in the updates table from being compressed and garbage collected into the main update.
*/
export interface YSyncer {
  i: string;
  unsentFrom: number;
}

/** A stamp of the last compressed and garbage collected update in the update table.
 * The garbage collection process will find out which documents have got new updates since the last compressed update
 * and compress them into their corresponding main update.
 * 
 * The id of this row is always 0 - which is a reserved id for this purpose.
*/
export interface YLastCompressed {
  i: 0;
  lastCompressed: number;
  lastRun?: Date;
}

export interface DexieYProvider<YDoc=any> {
  readonly doc: YDoc;
  awareness?: any;

  whenLoaded: Promise<any>;
  whenSynced: Promise<any>;

  on: DexieEventSet & ((name: string, f: (...args: any[]) => any) => void);
  off (name: string, f: (...args: any[]) => any): void;
  destroy(): void;
  readonly destroyed: boolean;
}
