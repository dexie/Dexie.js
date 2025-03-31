import { exceptions } from '../errors';
import { nop, promisableChain } from '../functions/chaining-functions';
import Events from '../helpers/Events';
import type Dexie from '../public';
import { DexieEventSet } from '../public/types/dexie-event-set';
import { Unsubscribable } from '../public/types/observable';
import type {
  YjsDoc,
  YUpdateRow,
  DexieYProvider as IDexieYProvider,
} from '../public/types/yjs-related';
import { throwIfDestroyed, getDocCache, destroyedDocs } from './docCache';
import { getOrCreateDocument } from './getOrCreateDocument';
import { getYLibrary } from './getYLibrary';
import { observeYDocUpdates } from './observeYDocUpdates';

export const wm = new WeakMap<any, DexieYProvider>();

function createEvents() {
  return Events(null, 'load', 'sync', 'error') as DexieYProvider['on'];
}

interface ReleaseOptions {
  gracePeriod?: number; // Grace period to optimize for unload/reload scenarios
}

export class DexieYProvider<YDoc extends YjsDoc = any>
  implements IDexieYProvider<YDoc>
{
  refCount = 1;
  private stopObserving: () => void;
  private cleanupHandlers: (() => void)[] = [];
  private graceTimer: any;
  private graceTimeout = -1;
  doc: YDoc;
  awareness?: any;
  private _error?: any;

  private _whenLoaded: Promise<void>;
  private _whenSynced: Promise<void>;

  on: DexieEventSet & ((name: string, f: (...args: any[]) => any) => void);
  off: (name: string, f: (...args: any[]) => any) => void;

  destroyed = false;

  static on = Events(null, {beforeunload: [promisableChain]}) as DexieEventSet & ((name: string, f: (...args: any[]) => any) => void);

  static getOrCreateDocument(db: Dexie, table: string, prop: string, id: any) {
    const docCache = getDocCache(db);
    const updatesTable = db.table(table).schema.yProps?.find(p => p.prop === prop)?.updatesTable;
    return getOrCreateDocument(db, docCache, getYLibrary(db), table, prop, updatesTable, id);
  }

  static load<YDoc extends YjsDoc>(doc: YDoc, options?: ReleaseOptions): DexieYProvider<YDoc> {
    let p = wm.get(doc);
    if (p) {
      ++p.refCount;
      if (options?.gracePeriod != null && p.graceTimeout < options.gracePeriod) {
        p.graceTimeout = options.gracePeriod;
      }
      if (p.graceTimer) {
        clearTimeout(p.graceTimer);
        p.graceTimer = null;
      }
    } else {
      p = new DexieYProvider(doc);
      p.graceTimeout = options?.gracePeriod ?? -1;
      wm.set(doc, p);
    }
    return p;
  }

  static release<YDoc extends YjsDoc>(doc: YDoc) {
    if (!doc || destroyedDocs.has(doc)) return; // Document already destroyed.
    const p = wm.get(doc);
    if (p) {
      // There is a provider connected to the doc
      if (--p.refCount <= 0) {
        // No references to this provider anymore. Time to release it.
        if (p.graceTimeout < 0) {
          // No grace period here or from previous release. Release immediately.
          p._release();
        } else if (!p.graceTimer) {
          p.graceTimer = setTimeout(
            () => {
              p.graceTimer = null;
              if (p.refCount === 0) {
                // Release only if refCount is still zero
                p._release();
              }
            }, 
            p.graceTimeout // Grace period to optimize for unload/reload scenarios
          );
        }
      }
    } else {
      doc.destroy();
    }
  }

  private _release() {
    // Allow a listener to beforeunload event to execute while the provider and the document
    // are still alive and loaded if it needs to compute something from the full document.
    // Also, in case the event listener uses DexieYProvider.load() without calling DexieYProvider.release(),
    // it must prevent the release to happen until the provider is finally released.
    if (!this.doc) return;
    Promise.resolve(DexieYProvider.on('beforeunload').fire(this)).finally(()=>{
      // Re-check that refCount is zero before actually destroying the document (which
      // leads to provider.destroy() through the destroy-event on the doc).
      if (this.refCount === 0) {  
        this.doc?.destroy();
      }
      // If refCount is not zero, it means that DexieYProvider.load() has been called from the listener
      // and the listener has prevented the release from happening. The listener must call DexieYProvider.release()
      // when it's done with the document.
    });
  }

  static for<YDoc extends YjsDoc>(doc: YDoc): DexieYProvider<YDoc> | undefined {
    return wm.get(doc);
  }
  static getDocCache = getDocCache;
  static currentUpdateRow: YUpdateRow | null = null;

  // Use a getter to avoid unhandled rejections when no one bothers about it.
  get whenLoaded(): Promise<void> {
    if (!this._whenLoaded) {
      this._whenLoaded = new Promise((resolve, reject) => {
        if (this.doc.isLoaded) resolve();
        else if (this._error) reject(this._error);
        else if (destroyedDocs.has(this.doc)) {
          reject(new exceptions.Abort('Document was destroyed before loaded'));
        } else {
          this.on('load', resolve); 
          this.on('error', reject);
          this.doc.on('destroy', () => reject(new exceptions.Abort('Document was destroyed before loaded')));
        }
      })  
    }
    return this._whenLoaded
  }

  // Use a getter to avoid unhandled rejections when no one bothers about it.
  get whenSynced(): Promise<void> {
    if (!this._whenSynced) {
      this._whenSynced = new Promise((resolve, reject) => {
        if (this.doc.isSynced) resolve();
        else if (this._error) reject(this._error);
        else if (destroyedDocs.has(this.doc)) {
          reject(new exceptions.Abort('Document was destroyed before synced'));
        } else {
          this.on('sync', resolve);
          this.on('error', reject);
          this.doc.on('destroy', () => reject(new exceptions.Abort('Document was destroyed before synced')));
        }
      })
    }
    return this._whenSynced;
  }


  constructor(doc: YDoc) {
    this.on = createEvents();
    this.doc = doc;
    this.off = (name: string, f: Function) => this.on[name]?.unsubscribe(f);
    if ('dispose' in Symbol) {
      // @ts-ignore
      this[Symbol.dispose] =
        () => DexieYProvider.release(doc);
    }
    doc.on('load', () => this.on('load').fire());
    doc.on('sync', (sync) => sync !== false && this.on('sync').fire());
    doc.on('destroy', this.destroy.bind(this));
    this.on('error', (error) => {
      // In case error happens before awaiting provider.whenLoaded or provider.whenSynced.
      this._error = error;
    });
    
    const { db, parentTable, parentId, updatesTable } = (doc as YDoc).meta || {};
    if (!db || !parentTable || !updatesTable) {
      throw new Error(
        `Missing Dexie-related metadata in Y.Doc. Documents need to be obtained through Y.Doc properties from dexie queries.`
      );
    }
    // This doc is from Dexie
    if (!db.table(parentTable) || !db.table(updatesTable)) {
      throw new Error(
        `Table ${parentTable} or ${updatesTable} not found in db`
      );
    }
    throwIfDestroyed(doc);
    const Y = getYLibrary(db);
    this.stopObserving = observeYDocUpdates(
      this,
      doc,
      db,
      parentTable,
      updatesTable,
      parentId,
      Y
    );
    db.on.y.fire(this, Y); // Allow for addons to invoke their sync- and awareness providers here.
  }

  destroy() {
    console.debug(`YDoc ${this.doc.meta?.parentId} was destroyed`);
    wm.delete(this.doc);
    this.doc = null;
    this.destroyed = true;
    this.refCount = 0;
    this.stopObserving?.();
    this.on = createEvents(); // Releases listeners for GC
    this.cleanupHandlers.forEach((cleanup) => cleanup());
  }

  addCleanupHandler(
    cleanupHandler: (() => void) | Unsubscribable
  ) {
    this.cleanupHandlers.push(
      typeof cleanupHandler === 'function'
        ? cleanupHandler
        : () => cleanupHandler.unsubscribe()
    );
  }
}
