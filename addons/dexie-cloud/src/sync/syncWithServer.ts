import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { loadAccessToken } from '../authentication/authenticate';
import { BISON, TSON } from '../TSON';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { BaseRevisionMapEntry } from '../db/entities/BaseRevisionMapEntry';
import { HttpError } from '../errors/HttpError';
import {
  DBOperationsSet,
  DexieCloudSchema,
  SyncRequest,
  SyncResponse,
} from 'dexie-cloud-common';
import { encodeIdsForServer } from './encodeIdsForServer';
import { UserLogin } from '../db/entities/UserLogin';
import { updateSyncRateLimitDelays } from './ratelimit';
//import {BisonWebStreamReader} from "dreambase-library/dist/typeson-simplified/BisonWebStreamReader";

export async function syncWithServer(
  changes: DBOperationsSet,
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
    Accept: 'application/json, application/x-bison, application/x-bison-stream',
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
    v: 2,
    dbID: syncState?.remoteDbId,
    clientIdentity,
    schema: schema || {},
    lastPull: syncState
      ? {
          serverRevision: syncState.serverRevision!,
          realms: syncState.realms,
          inviteRealms: syncState.inviteRealms,
        }
      : undefined,
    baseRevs,
    changes: encodeIdsForServer(db.dx.core.schema, currentUser, changes),
  };
  console.debug('Sync request', syncRequest);
  db.syncStateChangedEvent.next({
    phase: 'pushing',
  });
  const res = await fetch(`${databaseUrl}/sync`, {
    method: 'post',
    headers,
    credentials: 'include', // For Arr Affinity cookie only, for better Rate-Limit counting only.
    body: TSON.stringify(syncRequest),
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
      return BISON.fromBinary(await res.blob());
    case 'application/x-bison-stream': //return BisonWebStreamReader(BISON, res);
    default:
    case 'application/json': {
      const text = await res.text();
      const syncRes = TSON.parse(text);
      return syncRes;
    }
  }
}
