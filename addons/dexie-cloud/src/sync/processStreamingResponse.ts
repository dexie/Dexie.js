import { DexieCloudDB } from '../db/DexieCloudDB';
import { applyServerChanges } from './applyServerChanges';
import { getSyncableTables } from '../helpers/getSyncableTables';
import {
  PersistedSyncState,
  RealmDownloadState,
} from '../db/entities/PersistedSyncState';
import {
  StreamSyncResponse,
  StreamSyncStart,
  StreamRealmStart,
  StreamTableStart,
  StreamObjectRow,
  StreamTableEnd,
  StreamRealmComplete,
  StreamEnd,
} from 'dexie-cloud-common';
import { SyncProgress } from '../types/SyncState';

interface ChunkItem {
  tbl: string;
  id: string;
  obj: any;
}

const CHUNK_SIZE = 500;

/**
 * Pending download info passed in for resume.
 * Used to seed `progressCounters.objs.downloaded` so UI continues
 * from where the previous session left off, instead of from 0.
 */
export interface PendingRealmDownload extends RealmDownloadState {
  realmId: string;
}

export async function processStreamingResponse(
  db: DexieCloudDB,
  res: Response,
  knownPendingDownloads: PendingRealmDownload[]
): Promise<Partial<PersistedSyncState>> {
  if (!res.body) {
    throw new Error(
      'processStreamingResponse: Response body is null (non-stream response)'
    );
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let currentRealmId: string | null = null;
  let currentTbl: string | null = null;
  const chunkBuffer: ChunkItem[] = [];
  let progressCounters: SyncProgress | null = null;
  const realmEstimates = new Map<
    string,
    { objs: number; ydocs: number; blobs: number }
  >();

  // Sum of `downloadedCount` from previous (interrupted) sessions, so
  // resume continues from where we left off rather than from 0.
  const resumeAlreadyDownloaded = knownPendingDownloads.reduce(
    (sum, d) => sum + (d.downloadedCount || 0),
    0
  );

  let syncResponseData: Partial<PersistedSyncState> = {};

  async function flushChunk(realmId: string, chunk: ChunkItem[]) {
    if (chunk.length === 0) return;

    // Group by table
    const tableGroups = new Map<string, ChunkItem[]>();
    for (const item of chunk) {
      const group = tableGroups.get(item.tbl);
      if (group) {
        group.push(item);
      } else {
        tableGroups.set(item.tbl, [item]);
      }
    }

    // Get all syncable tables plus system tables that may be in the stream
    const syncableTables = getSyncableTables(db).map((t) => t.name);
    const systemTables = ['realms', 'members', 'roles'];
    const allTableNames = [...new Set([...syncableTables, ...systemTables])];

    // Write all objects in the chunk in a single rw transaction
    await db.dx.transaction(
      'rw',
      allTableNames
        .filter((tbl) => !!db.dx._allTables[tbl])
        .map((tbl) => db.dx.table(tbl)),
      async () => {
        for (const [tbl, rows] of tableGroups) {
          if (!db.dx._allTables[tbl]) {
            console.warn(
              `processStreamingResponse: Table "${tbl}" not found, skipping`
            );
            continue;
          }
          const table = db.dx.table(tbl);
          for (const row of rows) {
            // put(obj, id) — overload-safe form for out-of-line keys.
            // For inline-keyed schemas obj.id should already match row.id;
            // for out-of-line schemas the explicit key is required.
            await table.put(row.obj, row.id);
          }
        }
      }
    );

    // Update cursor and downloadedCount inline in $syncState (atomic mutator)
    const lastObj = chunk[chunk.length - 1];
    await db.$syncState.update('syncState', (state: PersistedSyncState) => {
      const entry = state.realmDownloads?.[realmId];
      if (entry) {
        entry.resumeCursor = `${lastObj.tbl}:${lastObj.id}`;
        entry.downloadedCount += chunk.length;
      }
    });

    // Bump global obj counter and emit progress (object form, not number)
    if (progressCounters) {
      progressCounters.objs.downloaded += chunk.length;
      db.syncStateChangedEvent.next({
        phase: 'pulling',
        progress: progressCounters,
      });
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!; // Keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;

      // O(1) classification: '[' = object row (array form), '{' = control row
      if (line[0] === '[') {
        const [id, obj] = JSON.parse(line) as StreamObjectRow;
        if (!currentRealmId || !currentTbl) {
          console.warn(
            `processStreamingResponse: Object row received without active realm/table context`,
            { currentRealmId, currentTbl, id }
          );
          continue;
        }
        chunkBuffer.push({ tbl: currentTbl, id, obj });
        if (chunkBuffer.length >= CHUNK_SIZE) {
          await flushChunk(currentRealmId, [...chunkBuffer]);
          chunkBuffer.length = 0;
        }
        continue;
      }

      const row = JSON.parse(line) as
        | StreamSyncResponse
        | StreamSyncStart
        | StreamRealmStart
        | StreamTableStart
        | StreamTableEnd
        | StreamRealmComplete
        | StreamEnd;

      switch (row.type) {
        case 'sync-response': {
          // Apply delta changes (non-realm-objects)
          await applyServerChanges(row.changes, db);
          // Capture sync state data to return
          syncResponseData = {
            serverRevision: row.serverRevision,
            remoteDbId: row.dbId,
            realms: row.realms,
            inviteRealms: row.inviteRealms,
          };
          break;
        }

        case 'sync-start': {
          progressCounters = {
            objs: {
              downloaded: resumeAlreadyDownloaded,
              total: row.estimate.objs,
            },
            ydocs: { downloaded: 0, total: row.estimate.ydocs },
            blobs: { downloaded: 0, total: row.estimate.blobs },
          };
          for (const realmInfo of row.realms) {
            realmEstimates.set(realmInfo.realmId, {
              objs: realmInfo.objs,
              ydocs: realmInfo.ydocs,
              blobs: realmInfo.blobs,
            });
          }
          db.syncStateChangedEvent.next({
            phase: 'pulling',
            progress: progressCounters,
          });
          break;
        }

        case 'realm-start': {
          currentRealmId = row.realmId;
          const estimate = realmEstimates.get(row.realmId);
          // Persist realm-download state inline in $syncState (atomic update)
          // Preserve any existing `downloadedCount` so resume keeps its progress
          // toward the cursor; reset it to 0 only for fresh entries.
          await db.$syncState.update(
            'syncState',
            (state: PersistedSyncState) => {
              state.realmDownloads = state.realmDownloads ?? {};
              const existing = state.realmDownloads[row.realmId];
              state.realmDownloads[row.realmId] = {
                serverRevision: row.serverRevision,
                resumeCursor: existing?.resumeCursor ?? null,
                totalCount: estimate?.objs ?? existing?.totalCount ?? 0,
                downloadedCount: existing?.downloadedCount ?? 0,
                startedAt: existing?.startedAt ?? new Date().toISOString(),
              };
            }
          );
          break;
        }

        case 'table-start': {
          currentTbl = row.tbl;
          break;
        }

        case 'table-end': {
          currentTbl = null;
          break;
        }

        case 'realm-complete': {
          // Flush any remaining objects
          if (chunkBuffer.length > 0 && currentRealmId) {
            await flushChunk(currentRealmId, [...chunkBuffer]);
            chunkBuffer.length = 0;
          }

          // Correct total estimate using actual counts
          if (progressCounters && row.actual) {
            const est = realmEstimates.get(row.realmId);
            if (est) {
              progressCounters.objs.total += row.actual.objs - est.objs;
              progressCounters.ydocs.total += row.actual.ydocs - est.ydocs;
            }
          }

          // Remove the entry from realmDownloads (keep rest of $syncState).
          // Drop the whole map when empty so we don't leave a stray empty obj.
          await db.$syncState.update(
            'syncState',
            (state: PersistedSyncState) => {
              if (state.realmDownloads) {
                delete state.realmDownloads[row.realmId];
                if (Object.keys(state.realmDownloads).length === 0) {
                  delete state.realmDownloads;
                }
              }
            }
          );

          // Emit a fresh progress tick so consumers see the corrected total
          if (progressCounters) {
            db.syncStateChangedEvent.next({
              phase: 'pulling',
              progress: progressCounters,
            });
          }
          currentRealmId = null;
          break;
        }

        case 'stream-end': {
          // Final progress emit — UI consumers may snap to 100% on this.
          if (progressCounters) {
            db.syncStateChangedEvent.next({
              phase: 'pulling',
              progress: progressCounters,
            });
          }
          break;
        }
      }
    }
  }

  // Handle any remaining incomplete line
  if (buffer.trim()) {
    // best-effort: try parsing the last line
    try {
      if (buffer[0] === '[') {
        const [id, obj] = JSON.parse(buffer) as StreamObjectRow;
        if (currentRealmId && currentTbl) {
          chunkBuffer.push({ tbl: currentTbl, id, obj });
        }
      } else if (buffer[0] === '{') {
        // Truncated control row — log for debugging
        console.warn(
          'processStreamingResponse: truncated control row in trailing buffer:',
          buffer.substring(0, 200)
        );
      }
    } catch {
      // Ignore parse error on incomplete last line
    }
  }

  // Flush any remaining chunk
  if (chunkBuffer.length > 0 && currentRealmId) {
    await flushChunk(currentRealmId, [...chunkBuffer]);
    chunkBuffer.length = 0;
  }

  return syncResponseData;
}
