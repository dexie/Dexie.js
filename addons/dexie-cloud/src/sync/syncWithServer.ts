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

  const syncRequest: SyncRequest = {
    v: 3, // v3 = supports BlobRef
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
    dxcv: db.cloud.version
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

  switch (res.headers.get('content-type')) {
    case 'application/x-bison':
    case 'application/x-bison-stream':
      // BISON format deprecated - throw error if server sends it
      throw new Error('BISON format no longer supported. Server should send application/json.');
    default:
    case 'application/json': {
      const text = await res.text();
      const syncRes = TSON.parse(text);
      // Debug: Check if blob refs were properly parsed
      if (syncRes.changes) {
        for (const change of syncRes.changes) {
          for (const mut of change.muts || []) {
            for (const val of mut.values || []) {
              if (val && typeof val === 'object') {
                for (const [k, v] of Object.entries(val)) {
                  if (v && typeof v === 'object' && ('ref' in v || '$t' in v)) {
                    console.log(`DEXIE-CLOUD DEBUG syncWithServer: ${change.table}.${k}`, 
                      { type: (v as any).constructor?.name, keys: Object.keys(v) });
                  }
                }
              }
            }
          }
        }
      }
      return syncRes;
    }
  }
}
