/* Since dexie use "bring your own Y" approach, we provide a
 * minimal interface that we require from Yjs document.
 * 
 * We only list the interface that dexie or dexie-cloud might need to call on this
 * library.
 * 
 */

import { Dexie } from "./dexie";
import { DexieEventSet } from "./dexie-event-set";
import { IndexableType } from "./indexable-type";
import { Unsubscribable } from "./observable";

export interface YjsLib {
  Doc: new(options?: {guid?: string, collectionid?: string, gc?: boolean, gcFilter?: any, meta?: any, autoLoad?: boolean, shouldLoad?: boolean}) => YjsDoc;
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

export interface YjsObservable {
  on (name: string, f: (...args: any[]) => any): void;
  off (name: string, f: (...args: any[]) => any): void;
  once (name: string, f: (...args: any[]) => any): void;
  emit (name: string, args: any[]): void;
  destroy(): void;
}

/** Duck-typed Y.Doc */
export interface YjsDoc extends YjsObservable {
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

/** Docktyped Awareness */
export interface YjsAwareness extends YjsObservable {
  doc: YjsDoc;
  destroy: () => void;
  clientID: any;
  states: any;
  meta: any;
  getLocalState: any;
  setLocalState: any;
  setLocalStateField: any;
  getStates: any;
}

export interface DexieYDocMeta {
  db: Dexie;
  parentTable: string;
  parentId: any;
  parentProp: string;
  updatesTable: string;
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
 * A syncing engine can create an YSyncState row with an unsentFrom or receivedUntil value set to the a number representing primary key (i)
 * of updates that has not been sent to server or peer yet. Dexie will compute the least value of unsentFrom and receivedUntil + 1 and
 * spare all updates with an 'i' of that value or greater in the updates table from being compressed and garbage collected into the main update.
*/
export interface YSyncState {
  i: string;
  unsentFrom?: number;
  receivedUntil?: number;
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

interface ProviderReleaseOptions {
  // Optional grace period to optimize for unload/reload scenarios when releasing a document
  // and refcount reached zero - to avoid destroying the document immediately in case
  // it's going to be reloaded soon.
  // If not set, the document will be destroyed immediately when refcount reaches zero.
  gracePeriod?: number; 
}

export declare class DexieYProvider<YDoc=any> {
  readonly doc: YDoc;
  awareness?: YjsAwareness;

  whenLoaded: Promise<void>;
  whenSynced: Promise<void>;

  on: DexieEventSet & ((name: string, f: (...args: any[]) => any) => void);
  off: (name: string, f: (...args: any[]) => any) => void;
  addCleanupHandler(cleanupHandler: Unsubscribable | (()=>void)): void;
  destroy(): void;
  readonly destroyed: boolean;

  static on: DexieEventSet & ((name: string, f: (...args: any[]) => any) => void);
  static getOrCreateDocument(db: Dexie, table: string, prop: string, id: any): YjsDoc;
  static load<YDoc extends YjsDoc>(doc: YDoc): DexieYProvider<YDoc>;
  static release<YDoc extends YjsDoc>(doc: YDoc, options?: ProviderReleaseOptions): void;
  static for<YDoc extends YjsDoc>(doc: YDoc): DexieYProvider<YDoc> | undefined;
  static getDocCache: (db: Dexie) => YDocCache;
  static currentUpdateRow: YUpdateRow | null;
}

export interface YDocCache {
  readonly size: number;
  find: (table: string, primaryKey: any, ydocProp: string) => YjsDoc | undefined
  add: (doc: YjsDoc) => void;
  delete: (doc: YjsDoc) => void;
}
