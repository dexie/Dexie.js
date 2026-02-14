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
  // Create a single queue instance for this database
  const blobSavingQueue = new BlobSavingQueue(db);
  
  return {
    stack: 'dbcore' as const,
    name: 'blobResolve',
    create(downlevelDatabase: DBCore): DBCore {
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
                  return resolveAndSave(db, downlevelTable, req.trans, result, blobSavingQueue);
                }
                return result;
              });
            },

            getMany(req: DBCoreGetManyRequest) {
              return downlevelTable.getMany(req).then(results => {
                // Check if any results need resolution
                const needsResolution = results.some(r => r && hasUnresolvedBlobRefs(r));
                if (!needsResolution) return results;
                
                return Dexie.Promise.all(
                  results.map(result => {
                    if (result && hasUnresolvedBlobRefs(result)) {
                      return resolveAndSave(db, downlevelTable, req.trans, result, blobSavingQueue);
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
                
                return Dexie.Promise.all(
                  result.result.map(item => {
                    if (item && hasUnresolvedBlobRefs(item)) {
                      return resolveAndSave(db, downlevelTable, req.trans, item, blobSavingQueue);
                    }
                    return item;
                  })
                ).then(resolved => ({ ...result, result: resolved }));
              });
            },

            openCursor(req: DBCoreOpenCursorRequest) {
              return downlevelTable.openCursor(req).then(cursor => {
                if (!cursor) return cursor;
                return createBlobResolvingCursor(cursor, db, downlevelTable, req.trans, blobSavingQueue);
              });
            },
          };
        },
      };
    },
  };
}

/**
 * Create a cursor wrapper that resolves BlobRefs in values lazily.
 * 
 * The cursor wraps the underlying cursor and intercepts value access
 * to resolve any BlobRefs. Resolution happens on first access to value
 * and the resolved value is cached.
 */
function createBlobResolvingCursor(
  cursor: DBCoreCursor,
  db: DexieCloudDB,
  table: DBCoreTable,
  trans: DBCoreTransaction,
  blobSavingQueue: BlobSavingQueue
): DBCoreCursor {
  // Cache for resolved value - null means not yet checked/resolved
  let resolvedValue: any = null;
  let valueResolved = false;
  let resolutionPromise: Promise<any> | null = null;

  const wrappedCursor: DBCoreCursor = {
    get trans() {
      return cursor.trans;
    },
    get key() {
      return cursor.key;
    },
    get primaryKey() {
      return cursor.primaryKey;
    },
    get value() {
      // Return cached value if already resolved
      if (valueResolved) {
        return resolvedValue;
      }
      
      const rawValue = cursor.value;
      
      // Check if value needs resolution
      if (!rawValue || !hasUnresolvedBlobRefs(rawValue)) {
        resolvedValue = rawValue;
        valueResolved = true;
        return rawValue;
      }
      
      // Start async resolution but return raw value for now
      // The resolution will be cached for subsequent accesses
      // and saved to DB via BlobSavingQueue
      if (!resolutionPromise) {
        const resolvedBlobs: ResolvedBlob[] = [];
        resolutionPromise = resolveAllBlobRefs(rawValue, resolvedBlobs)
          .then(resolved => {
            resolvedValue = resolved;
            valueResolved = true;
            
            // Queue blobs for atomic saving
            const primaryKey = table.schema.primaryKey;
            const key = primaryKey.keyPath 
              ? Dexie.getByKeyPath(rawValue, primaryKey.keyPath as string)
              : cursor.primaryKey;
              
            if (key !== undefined && resolvedBlobs.length > 0) {
              for (const blob of resolvedBlobs) {
                blobSavingQueue.saveBlob(table.name, key, blob.keyPath, blob.data);
              }
            }
            
            return resolved;
          })
          .catch(err => {
            console.error('Failed to resolve BlobRefs in cursor:', err);
            resolvedValue = rawValue;
            valueResolved = true;
            return rawValue;
          });
      }
      
      // Return raw value - caller should use cursor.value after await if needed
      return rawValue;
    },
    continue(key?: any) {
      // Reset cache for next iteration
      resolvedValue = null;
      valueResolved = false;
      resolutionPromise = null;
      return cursor.continue(key);
    },
    continuePrimaryKey(key: any, primaryKey: any) {
      // Reset cache for next iteration
      resolvedValue = null;
      valueResolved = false;
      resolutionPromise = null;
      return cursor.continuePrimaryKey(key, primaryKey);
    },
    advance(count: number) {
      // Reset cache for next iteration
      resolvedValue = null;
      valueResolved = false;
      resolutionPromise = null;
      return cursor.advance(count);
    },
    start(onNext: () => void): Promise<any> {
      return cursor.start(onNext);
    },
    stop(value?: any) {
      return cursor.stop(value);
    },
    next() {
      // Reset cache for next iteration
      resolvedValue = null;
      valueResolved = false;
      resolutionPromise = null;
      return cursor.next();
    },
    fail(error: Error) {
      return cursor.fail(error);
    },
  };

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
 * update using Table.update() - this avoids race conditions.
 * 
 * Returns Dexie.Promise to preserve PSD context.
 */
function resolveAndSave(
  db: DexieCloudDB,
  table: DBCoreTable,
  trans: DBCoreTransaction,
  obj: any,
  blobSavingQueue: BlobSavingQueue
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
  
  // Create the resolution promise
  // BlobRef URLs are signed (SAS tokens) so no auth needed
  const resolutionPromise = resolveAllBlobRefs(obj, resolvedBlobs);
  
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
        blobSavingQueue.saveBlob(table.name, key, blob.keyPath, blob.data);
      }
    }

    return resolved;
  }).catch(err => {
    console.error('Failed to resolve BlobRefs:', err);
    return obj; // Return original object on error
  });
}
