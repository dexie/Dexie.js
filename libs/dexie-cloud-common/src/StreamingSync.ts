import { DBOperationsSet } from './DBOperationsSet.js';
import { DexieCloudSchema } from './DexieCloudSchema.js';
import { YServerMessage } from './yjs/YMessage.js';

/**
 * All possible NDJSON row types in the streaming sync protocol (v4+).
 *
 * Protocol disambiguation:
 *   - First char '{' => control row (JSON object)
 *   - First char '[' => object row (array form: [id, obj])
 */
export type StreamingSyncRow =
  | StreamSyncResponse
  | StreamSyncStart
  | StreamRealmStart
  | StreamTableStart
  | StreamObjectRow
  | StreamTableEnd
  | StreamRealmComplete
  | StreamEnd;

/** First control row — standard SyncResponse data (without realm objects) */
export interface StreamSyncResponse {
  type: 'sync-response';
  serverRevision: string;
  dbId: string;
  realms: string[];
  inviteRealms: string[];
  schema: DexieCloudSchema;
  changes: DBOperationsSet<string>;
  rejections: { name: string; message: string; txid: string }[];
  yMessages: YServerMessage[];
}

/**
 * Second control row — global estimate for the entire sync, per category and per realm.
 * The client initializes three counters (objs/ydocs/blobs) based on this.
 * Emitted after all realms are known but before the first `realm-start`.
 */
export interface StreamSyncStart {
  type: 'sync-start';
  estimate: {
    objs: number; // EXPLAIN estimate over all new realms (objs table + members)
    ydocs: number; // EXPLAIN estimate over all new realms (compressed_ydocs)
    blobs: number; // COUNT(*) over all new realms (blob_refs WHERE deleted IS NULL)
  };
  realms: Array<{
    realmId: string;
    objs: number;
    ydocs: number;
    blobs: number;
  }>;
}

/** Starts a realm download (no estimatedCount — that's in sync-start) */
export interface StreamRealmStart {
  type: 'realm-start';
  realmId: string;
  /** The revision the REPEATABLE READ transaction reads at */
  serverRevision: string;
}

/** Scope for subsequent object rows */
export interface StreamTableStart {
  type: 'table-start';
  tbl: string;
}

/**
 * Object row — array form: [id, obj]
 * Table is implicit from the preceding `table-start`.
 * Client classifies row via line[0] === '['.
 */
export type StreamObjectRow = [string, any];

/** End of table scope. lastId can be used for debug/logging. */
export interface StreamTableEnd {
  type: 'table-end';
  tbl: string;
  lastId?: string;
}

/**
 * Ends a realm. `actual` reports actual obj+ydocs count so the client can
 * correct totalEstimate (`total += actual - estimate`).
 * Blobs are reported separately (blob phase comes after, or skipped if blobMode==='lazy').
 */
export interface StreamRealmComplete {
  type: 'realm-complete';
  realmId: string;
  actual: {
    objs: number;
    ydocs: number;
  };
}

/** Last row in the stream */
export interface StreamEnd {
  type: 'stream-end';
}
