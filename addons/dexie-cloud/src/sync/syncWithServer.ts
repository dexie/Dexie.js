import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { loadAccessToken } from '../authentication/authenticate';
import { TSON } from '../TSON';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { BaseRevisionMapEntry } from '../db/entities/BaseRevisionMapEntry';
import { HttpError } from '../errors/HttpError';
import {
  DBOperationsSet,
  DexieCloudSchema,
  SyncRequest,
  SyncResponse,
  YClientMessage,
} from 'dexie-cloud-common';
import { encodeIdsForServer } from './encodeIdsForServer';
import { UserLogin } from '../db/entities/UserLogin';
import { updateSyncRateLimitDelays } from './ratelimit';
import { processStreamingResponse } from './processStreamingResponse';
//import {BisonWebStreamReader} from "dreambase-library/dist/typeson-simplified/BisonWebStreamReader";

export async function syncWithServer(
  changes: DBOperationsSet,
  y: YClientMessage[],
  syncState: PersistedSyncState | undefined,
  baseRevs: BaseRevisionMapEntry[],
  db: DexieCloudDB,
  databaseUrl: string,
  schema: DexieCloudSchema | null,
  clientIdentity: string,
  currentUser: UserLogin
): Promise<SyncResponse> {
  //
  // Push changes to server using fetch
  //
  const headers: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/tson',
  };
  const updatedUser = await loadAccessToken(db);
  /*
  if (updatedUser?.license && changes.length > 0) {
    if (updatedUser.license.status === 'expired') {
      throw new Error(`License has expired`);
    }
    if (updatedUser.license.status === 'deactivated') {
      throw new Error(`License deactivated`);
    }
  }
  */
  const accessToken = updatedUser?.accessToken;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Pending realm downloads for resume info — embedded in $syncState (already loaded as `syncState` argument)
  const pendingDownloads = syncState?.realmDownloads
    ? Object.entries(syncState.realmDownloads).map(([realmId, d]) => ({
        realmId,
        ...d,
      }))
    : [];

  const syncRequest: SyncRequest = {
    v: 4, // v4 = streaming NDJSON support
    dbID: syncState?.remoteDbId,
    clientIdentity,
    schema: schema || {},
    lastPull: syncState
      ? {
          serverRevision: syncState.serverRevision!,
          yServerRevision: syncState.yServerRevision,
          realms: syncState.realms,
          inviteRealms: syncState.inviteRealms,
        }
      : undefined,
    baseRevs,
    changes: encodeIdsForServer(db.dx.core.schema, currentUser, changes),
    y,
    dxcv: db.cloud.version,
    syncedRealmDownloads: pendingDownloads.map((d) => ({
      realmId: d.realmId,
      serverRevision: d.serverRevision,
      resumeCursor: d.resumeCursor ?? undefined,
    })),
  };
  console.debug('Sync request', syncRequest);
  db.syncStateChangedEvent.next({
    phase: 'pushing',
  });
  const body = TSON.stringify(syncRequest);
  const res = await fetch(`${databaseUrl}/sync`, {
    method: 'post',
    headers,
    credentials: 'include', // For Arr Affinity cookie only, for better Rate-Limit counting only.
    body,
  });
  //const contentLength = Number(res.headers.get('content-length'));
  db.syncStateChangedEvent.next({
    phase: 'pulling',
  });

  updateSyncRateLimitDelays(db, res);

  if (!res.ok) {
    throw new HttpError(res);
  }

  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('ndjson')) {
    // New streaming path (v4+)
    const { syncResponse } = await processStreamingResponse(
      db,
      res,
      pendingDownloads
    );
    // The streaming path's `sync-response` row carries the full
    // SyncResponse shape (serverRevision, dbId, realms, inviteRealms,
    // schema, changes, rejections, yMessages) so it's a drop-in
    // replacement for the JSON path. Realm objects were written
    // directly by processStreamingResponse — they are NOT in
    // syncResponse.changes (server contract).
    return syncResponse;
  }

  switch (contentType) {
    case 'application/x-bison':
    case 'application/x-bison-stream':
      // BISON format deprecated - throw error if server sends it
      throw new Error(
        'BISON format no longer supported. Server should send application/json.'
      );
    default:
    case 'application/json': {
      const text = await res.text();
      const syncRes = TSON.parse(text);
      return syncRes;
    }
  }
}
