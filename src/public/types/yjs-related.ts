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
  table: string,
  updatesTable: string,
  prop: string,
  id: any,
  cacheKey: string
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

export interface YSyncer {
  i: string;
  unsentFrom: number;
}

export interface YLastCompressed {
  i: 0;
  compressedUntil: number;
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
