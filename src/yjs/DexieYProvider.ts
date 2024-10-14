import Events from '../helpers/Events';
import { DexieEventSet } from '../public/types/dexie-event-set';
import { Unsubscribable } from '../public/types/observable';
import type {
  YjsDoc,
  YUpdateRow,
  DexieYProvider as IDexieYProvider,
} from '../public/types/yjs-related';
import { throwIfDestroyed, getDocCache, destroyedDocs } from './docCache';
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
  private refCount = 1;
  private stopObserving: () => void;
  private cleanupHandlers: (() => void)[] = [];
  doc: YDoc;
  awareness?: any;

  whenLoaded: Promise<void>;
  whenSynced: Promise<void>;

  on: DexieEventSet & ((name: string, f: (...args: any[]) => any) => void);
  off: (name: string, f: (...args: any[]) => any) => void;

  destroyed = false;

  static load<YDoc extends YjsDoc>(doc: YDoc): DexieYProvider<YDoc> {
    let p = wm.get(doc);
    if (p) {
      ++p.refCount;
    } else {
      p = new DexieYProvider(doc);
      wm.set(doc, p);
    }
    return p;
  }

  static release<YDoc extends YjsDoc>(doc: YDoc, options?: ReleaseOptions) {
    if (destroyedDocs.has(doc)) return;
    const p = wm.get(doc);
    if (!p) {
      if (--p.refCount === 0) {
        if (isNaN(options?.gracePeriod)) {
          doc.destroy(); // No grace period
        } else {
          setTimeout(
            () => p.refCount || doc.destroy(), // Destroy only if refCount is still zero
            options.gracePeriod // Grace period to optimize for unload/reload scenarios
          );
        }
      }
    } else {
      doc.destroy();
    }
  }

  static for<YDoc extends YjsDoc>(doc: YDoc): DexieYProvider<YDoc> | undefined {
    return wm.get(doc);
  }
  static getDocCache = getDocCache;
  static currentUpdateRow: YUpdateRow | null = null;

  constructor(doc: YDoc) {
    this.on = createEvents();
    this.doc = doc;
    this.off = (name: string, f: Function) => this.on[name]?.unsubscribe(f);
    this.whenLoaded = new Promise((resolve, reject) => {
      this.on('load', resolve);
      this.on('error', reject);
    });
    this.whenSynced = new Promise((resolve, reject) => {
      this.on('sync', resolve);
      this.on('error', reject);
    });
    if ('dispose' in Symbol) {
      // @ts-ignore
      this[Symbol.dispose] =
        () => DexieYProvider.release(doc);
    }
    doc.on('load', () => this.on('load').fire());
    doc.on('sync', (sync) => sync !== false && this.on('sync').fire());
    doc.on('destroy', this.destroy.bind(this));
    
    const { db, parentTable, parentId, updatesTable } = (doc as YDoc).meta || {};
    if (db && parentTable && updatesTable) {
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
  }

  destroy() {
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
