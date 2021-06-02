import { DexieCloudDB } from '../db/DexieCloudDB';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { loadAccessToken } from '../authentication/authenticate';
import { BISON, TSON } from '../BISON';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { BaseRevisionMapEntry } from '../db/entities/BaseRevisionMapEntry';
import { HttpError } from '../errors/HttpError';
import {
  DBOperationsSet,
  DexieCloudSchema,
  SyncResponse
} from 'dexie-cloud-common';
//import {BisonWebStreamReader} from "dreambase-library/dist/typeson-simplified/BisonWebStreamReader";

export async function syncWithServer(
  changes: DBOperationsSet,
  syncState: PersistedSyncState | undefined,
  baseRevs: BaseRevisionMapEntry[],
  db: DexieCloudDB,
  databaseUrl: string,
  schema: DexieCloudSchema | null
): Promise<SyncResponse> {
  //
  // Push changes to server using fetch
  //
  const headers: HeadersInit = {
    Accept: 'application/json, application/x-bison, application/x-bison-stream',
    'Content-Type': 'application/x-bison'
  };
  const accessToken = await loadAccessToken(db);
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${databaseUrl}/sync`, {
    method: 'post',
    headers,
    body: BISON.toBinary({
      dbID: syncState?.remoteDbId,
      schema,
      lastPull: syncState && {
        serverRevision: syncState.serverRevision,
        realms: syncState.realms
      },
      baseRevs,
      //baseRevisions: syncState?.baseRevisions || [],
      changes
    })
  });

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
