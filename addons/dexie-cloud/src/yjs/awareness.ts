import Dexie from "dexie";
import { type DexieCloudDB } from "../db/DexieCloudDB";

export function getAwarenessLibrary(db: DexieCloudDB): typeof import ('y-protocols/awareness') {
  if (!db.cloud.options?.awarenessProtocol) {
    throw new Dexie.MissingAPIError('awarenessProtocol was not provided to db.cloud.configure(). Please import * as awarenessProtocol from "y-protocols/awareness".');
  }
  return db.cloud.options?.awarenessProtocol;
}

export const awarenessWeakMap = new WeakMap<any, import('y-protocols/awareness').Awareness>();

export const getDocAwareness = (doc: any) => awarenessWeakMap.get(doc);


