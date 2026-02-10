/**
 * StreamingSyncProcessor
 *
 * Client-side processor for streaming sync responses (NDJSON format).
 * Handles incremental parsing and blob resolution to avoid memory spikes.
 *
 * BACKWARD COMPATIBILITY:
 * - Client signals streaming support via Accept header + capabilities
 * - Old servers return application/json → fallback to traditional parsing
 * - New servers return application/x-ndjson-stream → use this processor
 */

import { TSONRef, TSONRefData, replaceTSONRefs } from './TSONRef.js';

// ============================================================
// STREAM MESSAGE TYPES
// ============================================================

/** Header sent at start of streaming sync */
export interface StreamSyncHeader {
  type: 'header';
  snapshotRevision: string;
  totalRealms: number;
  estimatedObjects?: number;
}

/** Chunk of changes (batched objects) */
export interface StreamSyncChanges {
  type: 'changes';
  /** Table name */
  tbl: string;
  /** Objects to upsert */
  objects: Array<{
    key: string;
    value: unknown;
  }>;
  /** Realm these objects belong to */
  realmId?: string;
}

/** Marks a realm as fully sent */
export interface StreamSyncRealmComplete {
  type: 'realm-complete';
  realmId: string;
}

/** Footer sent at end of streaming sync */
export interface StreamSyncFooter {
  type: 'footer';
  serverRevision: string;
  realms: string[];
  inviteRealms: string[];
  schema: Record<string, unknown>;
  errors?: Array<{
    name: string;
    message: string;
    txid?: string;
  }>;
}

/** Union of all stream message types */
export type StreamSyncMessage =
  | StreamSyncHeader
  | StreamSyncChanges
  | StreamSyncRealmComplete
  | StreamSyncFooter;

// ============================================================
// PROGRESS TRACKING
// ============================================================

/**
 * Progress state for resumable streaming sync.
 */
export interface StreamSyncProgress {
  /** Server revision at start of streaming sync */
  snapshotRevision: string;
  /** Realms fully downloaded */
  completedRealms: string[];
  /** Current realm being processed */
  currentRealm?: string;
  /** Last key written (for resume) */
  lastKey?: {
    table: string;
    key: string;
  };
  /** Timestamp when sync started */
  startedAt: number;
  /** Total objects processed so far */
  processedCount: number;
}

// ============================================================
// BLOB RESOLUTION OPTIONS
// ============================================================

export interface BlobResolutionOptions {
  /** Max concurrent blob fetches */
  concurrency: number;
  /** Fetch function: GET /blob/:id */
  fetchBlob: (blobId: string) => Promise<ArrayBuffer>;
  /**
   * Resolution strategy:
   * - 'eager': Resolve all blobs before writing chunk
   * - 'lazy': Write TSONRef to DB, resolve on access
   */
  strategy: 'eager' | 'lazy';
}

// ============================================================
// CALLBACKS
// ============================================================

export interface StreamingSyncCallbacks {
  /** Called when header is received */
  onHeader?: (header: StreamSyncHeader) => void;
  /** Write objects to database */
  bulkPut: (table: string, objects: Array<{ key: string; value: unknown }>) => Promise<void>;
  /** Called when a realm is complete */
  onRealmComplete?: (realmId: string) => void;
  /** Called with progress updates */
  onProgress?: (progress: StreamSyncProgress) => void;
  /** Persist progress for resume capability */
  saveProgress?: (progress: StreamSyncProgress) => Promise<void>;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if value is a TSONRef or serialized $ref format.
 */
function isBlobRef(value: unknown): value is TSONRef | TSONRefData {
  return TSONRef.isTSONRef(value) || TSONRef.isTSONRefData(value);
}

/**
 * Find all blob refs in an object tree.
 */
export function collectBlobRefs(obj: unknown, refs: TSONRef[] = []): TSONRef[] {
  if (obj === null || obj === undefined) return refs;

  if (TSONRef.isTSONRef(obj)) {
    refs.push(obj);
    return refs;
  }

  if (TSONRef.isTSONRefData(obj)) {
    refs.push(TSONRef.fromData(obj));
    return refs;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectBlobRefs(item, refs);
    }
    return refs;
  }

  if (typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      collectBlobRefs(value, refs);
    }
  }

  return refs;
}

/**
 * Resolve all blob refs in an object tree (eager strategy).
 */
export async function resolveAllBlobRefs(
  obj: unknown,
  options: BlobResolutionOptions
): Promise<void> {
  // Wrap fetchBlob to create a TSONRefResolver
  const resolver = (ref: TSONRef) => options.fetchBlob(ref.ref);
  await replaceTSONRefs(obj, resolver, options.concurrency);
}

/**
 * Check if a chunk should be skipped (already processed in previous attempt).
 */
function shouldSkipChunk(
  message: StreamSyncChanges,
  progress: StreamSyncProgress
): boolean {
  // If realm is already complete, skip
  if (message.realmId && progress.completedRealms.includes(message.realmId)) {
    return true;
  }

  // If we have a lastKey for this table, check if chunk is before it
  if (progress.lastKey && progress.lastKey.table === message.tbl) {
    const lastChunkKey = message.objects[message.objects.length - 1]?.key;
    if (lastChunkKey && lastChunkKey <= progress.lastKey.key) {
      return true;
    }
  }

  return false;
}

// ============================================================
// MAIN PROCESSOR
// ============================================================

/**
 * Process a streaming sync response.
 *
 * @param stream - ReadableStream from fetch response
 * @param callbacks - Handlers for processing messages
 * @param blobOptions - Options for blob resolution
 * @param resumeFrom - Previous progress to resume from
 * @returns Final sync result from footer
 */
export async function processStreamingSync(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamingSyncCallbacks,
  blobOptions: BlobResolutionOptions,
  resumeFrom?: StreamSyncProgress
): Promise<StreamSyncFooter> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  const progress: StreamSyncProgress = resumeFrom ?? {
    snapshotRevision: '',
    completedRealms: [],
    startedAt: Date.now(),
    processedCount: 0,
  };

  let footer: StreamSyncFooter | null = null;
  let finished = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        finished = true;
        break;
      }

      // Append to buffer and process complete lines
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        const message: StreamSyncMessage = JSON.parse(line);

        switch (message.type) {
          case 'header':
            progress.snapshotRevision = message.snapshotRevision;
            callbacks.onHeader?.(message);
            break;

          case 'changes':
            // Skip if already processed in previous attempt
            if (shouldSkipChunk(message, progress)) {
              continue;
            }

            // Resolve blob refs if using eager strategy
            if (blobOptions.strategy === 'eager') {
              for (const obj of message.objects) {
                await resolveAllBlobRefs(obj.value, blobOptions);
              }
            }

            // Write to database
            await callbacks.bulkPut(message.tbl, message.objects);

            // Update progress
            progress.processedCount += message.objects.length;
            if (message.realmId) {
              progress.currentRealm = message.realmId;
            }
            if (message.objects.length > 0) {
              progress.lastKey = {
                table: message.tbl,
                key: message.objects[message.objects.length - 1].key,
              };
            }

            // Persist progress periodically (every 100 objects)
            if (progress.processedCount % 100 === 0) {
              await callbacks.saveProgress?.(progress);
              callbacks.onProgress?.(progress);
            }
            break;

          case 'realm-complete':
            progress.completedRealms.push(message.realmId);
            progress.currentRealm = undefined;
            progress.lastKey = undefined;
            callbacks.onRealmComplete?.(message.realmId);
            await callbacks.saveProgress?.(progress);
            break;

          case 'footer':
            footer = message;
            break;
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
      const message: StreamSyncMessage = JSON.parse(buffer);
      if (message.type === 'footer') {
        footer = message;
      }
    }

    if (!footer) {
      throw new Error('Streaming sync ended without footer');
    }

    return footer;
  } finally {
    if (!finished) {
      await reader.cancel().catch(()=>{});
    }
    reader.releaseLock();
  }
}

// ============================================================
// HTTP HELPERS
// ============================================================

/**
 * Build Accept header for sync request.
 */
export function buildSyncAcceptHeader(supportsStreaming: boolean): string {
  if (supportsStreaming) {
    return 'application/x-ndjson-stream, application/json';
  }
  return 'application/json';
}

/**
 * Check if response is streaming format.
 */
export function isStreamingResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/x-ndjson-stream');
}
