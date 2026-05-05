import { DexieCloudDB } from '../db/DexieCloudDB';
import { RealmDownload } from '../db/entities/RealmDownload';
import { applyServerChanges } from './applyServerChanges';
import { getSyncableTables } from '../helpers/getSyncableTables';
import { PersistedSyncState } from '../db/entities/PersistedSyncState';
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

interface ProgressCounters {
  objs: { downloaded: number; total: number };
  ydocs: { downloaded: number; total: number };
  blobs: { downloaded: number; total: number };
}

interface ChunkItem {
  tbl: string;
  id: string;
  obj: any;
}

const CHUNK_SIZE = 500;

export async function processStreamingResponse(
  db: DexieCloudDB,
  res: Response,
  _knownPendingDownloads: RealmDownload[]
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
  let progressCounters: ProgressCounters | null = null;
  const realmEstimates = new Map<
    string,
    { objs: number; ydocs: number; blobs: number }
  >();

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
            await table.put(row.obj, row.id);
          }
        }
      }
    );

    // Update cursor and downloadedCount (persistent, for resume)
    const lastObj = chunk[chunk.length - 1];
    await db.$realmDownloads
      .where('realmId')
      .equals(realmId)
      .modify((d: RealmDownload) => {
        d.resumeCursor = `${lastObj.tbl}:${lastObj.id}`;
        d.downloadedCount += chunk.length;
      });

    // Bump global obj counter and emit progress
    if (progressCounters) {
      progressCounters.objs.downloaded += chunk.length;
      const { objs } = progressCounters;
      const pct =
        objs.total > 0
          ? Math.min(99, Math.round((objs.downloaded / objs.total) * 100))
          : 0;
      db.syncStateChangedEvent.next({
        phase: 'pulling',
        progress: pct,
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
            objs: { downloaded: 0, total: row.estimate.objs },
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
            progress: 0,
          });
          break;
        }

        case 'realm-start': {
          currentRealmId = row.realmId;
          const estimate = realmEstimates.get(row.realmId);
          await db.$realmDownloads.put({
            realmId: row.realmId,
            serverRevision: row.serverRevision,
            resumeCursor: null,
            totalCount: estimate?.objs ?? 0,
            downloadedCount: 0,
            startedAt: new Date(),
          });
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

          // Remove from pending downloads
          await db.$realmDownloads.delete(row.realmId);
          currentRealmId = null;
          break;
        }

        case 'stream-end': {
          // All done
          if (progressCounters) {
            db.syncStateChangedEvent.next({
              phase: 'pulling',
              progress: 100,
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
