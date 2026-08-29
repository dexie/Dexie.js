import { BaseRevisionMapEntry } from './BaseRevisionMapEntry.js';
import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';
import { YClientMessage } from './yjs/YMessage.js';

export interface SyncRequest {
  v?: number;
  dbID?: string;
  clientIdentity?: string;
  schema: DexieCloudSchema;
  lastPull?: {
    serverRevision: string | bigint;
    yServerRevision?: string;
    realms: string[];
    inviteRealms: string[];
  };
  baseRevs: BaseRevisionMapEntry[];
  changes: DBOperationsSet;
  y?: YClientMessage[];
  dxcv?: string; // dexie libs and versions
  //invites: {[inviteId: string]: "accept" | "reject"}

  /**
   * Realms that the client has already partially downloaded in a previous session.
   * The server will stream these from the cursor position + delta since revision.
   * Only present when v >= 4.
   */
  syncedRealmDownloads?: RealmDownloadResume[];
}

/**
 * Resume state for a partially downloaded realm.
 * Sent by the client in SyncRequest.syncedRealmDownloads.
 */
export interface RealmDownloadResume {
  realmId: string;
  /**
   * The serverRevision that the realm-start header indicated when the download started.
   * Server sends objects updated since this revision PLUS objects after the cursor.
   */
  serverRevision: string;
  /**
   * Opaque cursor: "tableName:objectId" — the last object written to IDB.
   * The server skips to the object after this in its REPEATABLE READ transaction.
   */
  resumeCursor?: string;
}
