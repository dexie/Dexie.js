/**
 * DBCore Middleware for resolving BlobRefs on read
 * 
 * This middleware intercepts read operations and resolves any BlobRefs
 * found in objects marked with $hasBlobRefs.
 * 
 * Important: Avoids async/await to preserve Dexie's Promise.PSD context.
 * Uses Dexie.waitFor() only for explicit rw transactions to keep them alive.
 * For readonly or implicit transactions, resolves directly (no waitFor needed).
 * 
 * Resolved blobs are queued for saving via BlobSavingQueue, which uses
 * setTimeout(fn, 0) to completely isolate from Dexie's transaction context.
 * Each blob is saved atomically using Table.update() with its keyPath to
 * avoid race conditions with other property changes.
 * 
 * Blob downloads use Authorization header (same as sync) via the server
 * proxy endpoint: GET /blob/{ref}
 */

import Dexie, { 
  DBCore, 
  DBCoreGetManyRequest, 
  DBCoreGetRequest, 
  DBCoreQueryRequest, 
  DBCoreOpenCursorRequest,
  DBCoreCursor,
  DBCoreTable, 
  DBCoreTransaction, 
  Middleware
} from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { hasUnresolvedBlobRefs, resolveAllBlobRefs, ResolvedBlob } from '../sync/blobResolve';
import { loadCachedAccessToken } from '../sync/loadCachedAccessToken';
import { BlobSavingQueue } from '../sync/BlobSavingQueue';
import { get } from 'http';
import { TXExpandos } from '../types/TXExpandos';
import { UserLogin } from '../dexie-cloud-client';

export function createBlobResolveMiddleware(db: DexieCloudDB): Middleware<DBCore> {
  const dbUrl = db.cloud.options?.databaseUrl;
  return {
    stack: 'dbcore' as const,
    name: 'blobResolve',
    level: -2, // Run below other middlewares and after sync and caching middlewares
    create(downlevelDatabase: DBCore): DBCore {
      // Create a single queue instance for this database
      const blobSavingQueue = new BlobSavingQueue(db);

      return {
        ...downlevelDatabase,
        table(tableName: string): DBCoreTable {
          const downlevelTable = downlevelDatabase.table(tableName);
          
          // Skip internal tables
          if (tableName.startsWith('$')) {
            return downlevelTable;
          }

          return {
            ...downlevelTable,

            get(req: DBCoreGetRequest) {
              if ((req.trans as DBCoreTransaction & TXExpandos)?.disableBlobResolve) {
                return downlevelTable.get(req);
              }
              return downlevelTable.get(req).then(result => {
                if (result && hasUnresolvedBlobRefs(result)) {
                  return resolveAndSave(downlevelTable, req.trans, req.key, result, blobSavingQueue, db);
                }
                return result;
              });
            },

            getMany(req: DBCoreGetManyRequest) {
              if ((req.trans as DBCoreTransaction & TXExpandos)?.disableBlobResolve) {
                return downlevelTable.getMany(req);
              }
              return downlevelTable.getMany(req).then(results => {
                // Check if any results need resolution
                const needsResolution = results.some(r => r && hasUnresolvedBlobRefs(r));
                if (!needsResolution) return results;
                
                return Dexie.Promise.all(
                  results.map((result, index) => {
                    if (result && hasUnresolvedBlobRefs(result)) {
                      return resolveAndSave(downlevelTable, req.trans, req.keys[index], result, blobSavingQueue, db);
                    }
                    return result;
                  })
                );
              });
            },

            query(req: DBCoreQueryRequest) {
              if ((req.trans as DBCoreTransaction & TXExpandos)?.disableBlobResolve) {
                return downlevelTable.query(req);
              }
              return downlevelTable.query(req).then(result => {
                if (!result.result || !Array.isArray(result.result)) return result;
                
                // Check if any results need resolution
                const needsResolution = result.result.some(r => r && hasUnresolvedBlobRefs(r));
                if (!needsResolution) return result;
                                
                return Dexie.Promise.all(
                  result.result.map(item => {
                    if (item && hasUnresolvedBlobRefs(item)) {
                      return resolveAndSave(downlevelTable, req.trans, undefined, item, blobSavingQueue, db);
                    }
                    return item;
                  })
                ).then(resolved => ({ ...result, result: resolved }));
              });
            },

            openCursor(req: DBCoreOpenCursorRequest) {
              if ((req.trans as DBCoreTransaction & TXExpandos)?.disableBlobResolve) {
                return downlevelTable.openCursor(req);
              }
              return downlevelTable.openCursor(req).then(cursor => {
                if (!cursor) return cursor; // No results, so no resolution needed
                if (!req.values) return cursor; // No values requested, so no resolution needed
                if (!dbUrl) return cursor; // No database URL configured, can't resolve blobs
                return createBlobResolvingCursor(cursor, downlevelTable, blobSavingQueue, db);
              });
            },
          };
        },
      };
    },
  };
}

/**
 * Create a cursor wrapper that resolves BlobRefs in values synchronously.
 * 
 * Uses Object.create() to inherit all cursor methods, only overriding:
 * - start(): Resolves BlobRefs before calling the callback
 * - value: Getter that returns the resolved value
 * 
 * Returns the cursor synchronously. Resolution happens in start() before
 * each onNext callback, ensuring cursor.value is always available.
 */
function createBlobResolvingCursor(
  cursor: DBCoreCursor,
  table: DBCoreTable,
  blobSavingQueue: BlobSavingQueue,
  db: DexieCloudDB
): DBCoreCursor {
  // Create wrapped cursor using Object.create() - inherits everything
  const wrappedCursor = Object.create(cursor, {
    value: {
      value: cursor.value,
      enumerable: true,
      writable: true
    },
    start: {
      value(onNext: () => void): Promise<any> {
        // Override start to resolve BlobRefs before each callback
        return cursor.start(() => {
          const rawValue = cursor.value;
          if (!rawValue || !hasUnresolvedBlobRefs(rawValue)) {
            onNext();
            return;
          }
          resolveAndSave(table, cursor.trans, cursor.primaryKey, rawValue, blobSavingQueue, db, true).then(resolved => {
            wrappedCursor.value = resolved;
            onNext();
          }, err => {
            console.error('Failed to resolve BlobRefs for cursor value:', err);
            onNext();
          });
        });
      }
    }
  });

  return wrappedCursor;
}


/**
 * Resolve BlobRefs in an object and queue each blob for atomic saving.
 * 
 * Uses Dexie.waitFor() only when needed:
 * - Skip waitFor for readonly ('r') transactions
 * - Skip waitFor for implicit transactions (most common in liveQuery)
 * - Use waitFor only for explicit rw transactions that need to stay alive
 * 
 * Each resolved blob is queued individually with its keyPath for atomic
 * update using downCore transaction with the specific keyPath - this avoids race conditions.
 * 
 * Returns Dexie.Promise to preserve PSD context.
 */
function resolveAndSave(
  table: DBCoreTable,
  trans: DBCoreTransaction,
  pKey: any | undefined, // optional. If missing, tries to extract from object using primary key path
  obj: any,
  blobSavingQueue: BlobSavingQueue,
  db: DexieCloudDB,
  isCursorValue: boolean = false // Flag to indicate if we're resolving a cursor value (which may not have a primary key)
): Promise<any> {
  // Determine if we need waitFor:
  // Skip waitFor ONLY if BOTH conditions are met:
  //   1. readonly transaction
  //   2. implicit (non-explicit) transaction
  // 
  // Transaction.explicit is true when user called db.transaction() explicitly.
  // For implicit transactions (auto-created for single operations), 
  // Dexie handles async automatically so no waitFor needed.
  const currentTx = Dexie.currentTransaction;
  const isReadonly = currentTx?.mode === 'readonly';
  const isExplicit = currentTx?.explicit === true;
  
  // Skip waitFor only for implicit readonly (most common case: liveQuery)
  const skipWaitFor = isReadonly && !isExplicit && !isCursorValue;
  const needsWaitFor = currentTx && !skipWaitFor;
  const dbUrl = db.cloud.options?.databaseUrl || '';

  // Collect resolved blobs with their keyPaths
  const resolvedBlobs: ResolvedBlob[] = [];
  
  // Create the resolution promise with auth info
  const resolutionPromise = loadCachedAccessToken(db).then(accessToken => accessToken
    ? resolveAllBlobRefs(obj, dbUrl, accessToken, resolvedBlobs)
    : obj) // Can't resolve without access token, return original object (if user is logged out, for example)
  
  // Wrap with waitFor to keep transaction alive during fetch
  const resolvePromise = needsWaitFor
    ? Dexie.waitFor(resolutionPromise)
    : Dexie.Promise.resolve(resolutionPromise);

  return resolvePromise.then(resolved => {
    // Get primary key from the object
    const primaryKey = table.schema.primaryKey;
    const key = pKey !== undefined ? pKey : primaryKey.keyPath 
      ? Dexie.getByKeyPath(obj, primaryKey.keyPath as string)
      : undefined;

    if (key !== undefined) {
      // Queue each resolved blob individually for atomic update
      // This uses setTimeout(fn, 0) to completely isolate from 
      // Dexie's transaction context (avoids inheriting PSD)
      if (isReadonly) {
        blobSavingQueue.saveBlobs(table.name, key, resolved);
      } else {
        // For rw transactions, we can save directly without queueing
        // since we're still in the same transaction context
        table.mutate({ type: 'put', keys: [key], values: [resolved], trans }).catch(err => {
          console.error(`Failed to save resolved blob on ${table.name}:${key}:`, err);
        });
      }
    }

    return resolved;
  }).catch(err => {
    console.error('Failed to resolve BlobRefs:', err);
    return obj; // Return original object on error
  });
}
