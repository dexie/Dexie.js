import Dexie, { DexieYProvider, DucktypedYDoc, type DucktypedY } from "dexie";
import { type DexieCloudDB } from "./db/DexieCloudDB";

export function getAwarenessLibrary(db: DexieCloudDB): typeof import ('y-protocols/awareness') {
  if (!db.cloud.options?.awarenessProtocol) {
    throw new Dexie.MissingAPIError('awarenessProtocol was not provided to db.cloud.configure(). Please import * as awarenessProtocol from "y-protocols/awareness".');
  }
  return db.cloud.options?.awarenessProtocol;
}

const awarenessWeakMap = new WeakMap<any, import('y-protocols/awareness').Awareness>();

export const getDocAwareness = (doc: any) => awarenessWeakMap.get(doc);

export function createYHandler(db: DexieCloudDB) {
  const awap = getAwarenessLibrary(db);
  return (provider: DexieYProvider<import('yjs').Doc & {_awareness: any}>) => {
    const doc = provider.doc;
    let awareness = awarenessWeakMap.get(doc);
    if (!awareness) {
      awareness = new awap.Awareness(doc);
      awarenessWeakMap.set(doc, awareness);
    }
    provider.awareness = awareness;
    const update = awap.encodeAwarenessUpdate(
      awareness,
      Array.from(awareness.getStates().keys())
    );
    db.messageProducer.next({
      type: 'aware',
      utbl: doc.meta.updatesTable!,
      k: doc.meta.parentId,
      u: update,
    });
    awareness.on('update', ({ added, updated, removed }, origin: any) => {
      // Send the update
      const changedClients = added.concat(updated).concat(removed);
      if (origin !== 'server') {
        const update = awap.encodeAwarenessUpdate(awareness!, changedClients);
        db.messageProducer.next({
          type: 'aware',
          utbl: doc.meta.updatesTable!,
          k: doc.meta.parentId,
          u: update,
        });
      }
    });
    awareness.on('destroy', () => {
      // Signal to server that this provider is destroyed (the update event will be triggered, which
      // in turn will trigger db.messageProducer that will send the message to the server if WS is connected)
      awap.removeAwarenessStates(awareness!, [doc.clientID], 'provider destroyed');
    });
  };
}

