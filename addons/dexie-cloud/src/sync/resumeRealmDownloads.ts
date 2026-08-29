import { DexieCloudDB } from '../db/DexieCloudDB';
import {
  PersistedSyncState,
  RealmDownloadState,
} from '../db/entities/PersistedSyncState';
import { loadAccessToken } from '../authentication/authenticate';
import { TSON } from '../TSON';
import { HttpError } from '../errors/HttpError';
import { SyncRequest } from 'dexie-cloud-common';
import { applyServerChanges } from './applyServerChanges';
import {
  PendingRealmDownload,
  processStreamingResponse,
} from './processStreamingResponse';

export async function resumeRealmDownloads(
  db: DexieCloudDB,
  databaseUrl: string,
  pendingDownloads: PendingRealmDownload[]
): Promise<void> {
  db.syncStateChangedEvent.next({ phase: 'pulling' });

  const headers: HeadersInit = {
    Accept: 'application/x-ndjson',
    'Content-Type': 'application/tson',
  };

  const updatedUser = await loadAccessToken(db);
  const accessToken = updatedUser?.accessToken;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Build a minimal SyncRequest with resume info
  const syncRequest: SyncRequest = {
    v: 4,
    schema: db.cloud.schema || {},
    baseRevs: [],
    changes: [],
    syncedRealmDownloads: pendingDownloads.map((d) => ({
      realmId: d.realmId,
      serverRevision: d.serverRevision,
      resumeCursor: d.resumeCursor ?? undefined,
    })),
  };

  const body = TSON.stringify(syncRequest);
  const res = await fetch(`${databaseUrl}/sync`, {
    method: 'post',
    headers,
    credentials: 'include',
    body,
  });

  if (!res.ok) {
    throw new HttpError(res);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('ndjson') || contentType.includes('x-ndjson')) {
    await processStreamingResponse(db, res, pendingDownloads);
  } else {
    // Old server — fall back to existing flow.
    const text = await res.text();
    const syncRes = TSON.parse(text);
    if (
      syncRes &&
      typeof syncRes === 'object' &&
      Array.isArray(syncRes.changes)
    ) {
      // Apply changes first; only clear realmDownloads on success.
      await applyServerChanges(syncRes.changes, db);
    }
    // Clear realmDownloads field in $syncState (old server can't resume).
    // Use the mutator form so we don't trample concurrent fields in the record.
    await db.$syncState.update('syncState', (state: PersistedSyncState) => {
      delete state.realmDownloads;
    });
  }
}
