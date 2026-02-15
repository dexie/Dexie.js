/**
 * DBCore Middleware for resolving BlobRefs on read
 * 
 * This middleware intercepts read operations and resolves any BlobRefs
 * found in objects marked with $unresolved.
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
  DBCoreTransaction 
} from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { hasUnresolvedBlobRefs, resolveAllBlobRefs, ResolvedBlob } from '../sync/blobResolve';
import { BlobSavingQueue } from '../sync/BlobSavingQueue';

export function createBlobResolveMiddleware(db: DexieCloudDB) {
  return {
    stack: 'dbcore' as const,
    name: 'blobResolve',
    create(downlevelDatabase: DBCore): DBCore {
      // Create a single queue instance for this database
      const blobSavingQueue = new BlobSavingQueue(downlevelDatabase);

      // Helper to get current db URL and access token
      function getAuthInfo(): { dbUrl: string; accessToken: string } | null {
        const currentUser = db.cloud.currentUser.value;
        if (!currentUser?.accessToken) return null;
        const dbUrl = db.cloud.options?.databaseUrl;
        if (!dbUrl) return null;
        return { dbUrl, accessToken: currentUser.accessToken };
      }

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
              return downlevelTable.get(req).then(result => {
                if (result && hasUnresolvedBlobRefs(result)) {
                  const authInfo = getAuthInfo();
                  if (!authInfo) return result; // Can't resolve without auth
                  return resolveAndSave(downlevelTable, req.trans, result, blobSavingQueue, authInfo.dbUrl, authInfo.accessToken);
                }
                return result;
              });
            },

            getMany(req: DBCoreGetManyRequest) {
              return downlevelTable.getMany(req).then(results => {
                // Check if any results need resolution
                const needsResolution = results.some(r => r && hasUnresolvedBlobRefs(r));
                if (!needsResolution) return results;
                
                const authInfo = getAuthInfo();
                if (!authInfo) return results; // Can't resolve without auth
                
                return Dexie.Promise.all(
                  results.map(result => {
                    if (result && hasUnresolvedBlobRefs(result)) {
                      return resolveAndSave(downlevelTable, req.trans, result, blobSavingQueue, authInfo.dbUrl, authInfo.accessToken);
                    }
                    return result;
                  })
                );
              });
            },

            query(req: DBCoreQueryRequest) {
              return downlevelTable.query(req).then(result => {
                if (!result.result || !Array.isArray(result.result)) return result;
                
                // Check if any results need resolution
                const needsResolution = result.result.some(r => r && hasUnresolvedBlobRefs(r));
                if (!needsResolution) return result;
                
                const authInfo = getAuthInfo();
                if (!authInfo) return result; // Can't resolve without auth
                
                return Dexie.Promise.all(
                  result.result.map(item => {
                    if (item && hasUnresolvedBlobRefs(item)) {
                      return resolveAndSave(downlevelTable, req.trans, item, blobSavingQueue, authInfo.dbUrl, authInfo.accessToken);
                    }
                    return item;
                  })
                ).then(resolved => ({ ...result, result: resolved }));
              });
            },

            openCursor(req: DBCoreOpenCursorRequest) {
              return downlevelTable.openCursor(req).then(cursor => {
                if (!cursor) return cursor; // No results, so no resolution needed
                if (!req.values) return cursor; // No values requested, so no resolution needed
                const authInfo = getAuthInfo();
                if (!authInfo) return cursor; // Can't resolve without auth
                return createBlobResolvingCursor(cursor, downlevelTable, blobSavingQueue, authInfo.dbUrl, authInfo.accessToken);
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
  dbUrl: string,
  accessToken: string
): DBCoreCursor {
    
  // Helper to resolve value and queue for saving
  function resolveValue(rawValue: any): PromiseLike<any> {
    const resolvedBlobs: ResolvedBlob[] = [];
    return resolveAllBlobRefs(rawValue, dbUrl, accessToken, resolvedBlobs).then(resolved => {
      // Queue blobs for atomic saving
      for (const blob of resolvedBlobs) {
        blobSavingQueue.saveBlob(table.name, cursor.primaryKey, blob.keyPath, blob.data);
      }      
      return resolved;
    });
  }

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
          Dexie.waitFor(resolveValue(rawValue)).then(resolved => {
            wrappedCursor.value = resolved;
            onNext();
          }, err => {
            console.error('Failed to resolve BlobRefs for cursor value:', err);
            wrappedCursor.value = rawValue;
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
  obj: any,
  blobSavingQueue: BlobSavingQueue,
  dbUrl: string,
  accessToken: string
): PromiseLike<any> {
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
  const skipWaitFor = isReadonly && !isExplicit;
  const needsWaitFor = currentTx && !skipWaitFor;

  // Collect resolved blobs with their keyPaths
  const resolvedBlobs: ResolvedBlob[] = [];
  
  // Create the resolution promise with auth info
  const resolutionPromise = resolveAllBlobRefs(obj, dbUrl, accessToken, resolvedBlobs);
  
  // Wrap with waitFor to keep transaction alive during fetch
  const resolvePromise = needsWaitFor
    ? Dexie.waitFor(resolutionPromise)
    : Dexie.Promise.resolve(resolutionPromise);

  return resolvePromise.then(resolved => {
    // Get primary key from the object
    const primaryKey = table.schema.primaryKey;
    const key = primaryKey.keyPath 
      ? Dexie.getByKeyPath(obj, primaryKey.keyPath as string)
      : undefined;

    if (key !== undefined && resolvedBlobs.length > 0) {
      // Queue each resolved blob individually for atomic update
      // This uses setTimeout(fn, 0) to completely isolate from 
      // Dexie's transaction context (avoids inheriting PSD)
      for (const blob of resolvedBlobs) {
        if (isReadonly) {
          blobSavingQueue.saveBlob(table.name, key, blob.keyPath, blob.data);
        } else {
          // For rw transactions, we can save directly without queueing
          // since we're still in the same transaction context
          const updateObj: any = {};
          Dexie.setByKeyPath(updateObj, blob.keyPath, blob.data);
          table.mutate({ type: 'put', keys: [key], values: [updateObj], trans }).catch(err => {
            console.error('Failed to save resolved blob:', err);
          });
        }
      }
    }

    return resolved;
  }).catch(err => {
    console.error('Failed to resolve BlobRefs:', err);
    return obj; // Return original object on error
  });
}
