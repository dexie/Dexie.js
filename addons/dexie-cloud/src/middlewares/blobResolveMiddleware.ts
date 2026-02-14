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
 */

import Dexie, { DBCore, DBCoreGetManyRequest, DBCoreGetRequest, DBCoreQueryRequest, DBCoreTable, DBCoreTransaction } from 'dexie';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { hasUnresolvedBlobRefs, resolveAllBlobRefs } from '../sync/blobResolve';
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
          };
        },
      };
    },
  };
}

/**
 * Resolve BlobRefs in an object and queue the resolved version for saving.
 * 
 * Uses Dexie.waitFor() only when needed:
 * - Skip waitFor for readonly ('r') transactions
 * - Skip waitFor for implicit transactions (most common in liveQuery)
 * - Use waitFor only for explicit rw transactions that need to stay alive
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

  // Create the resolution promise
  // BlobRef URLs are signed (SAS tokens) so no auth needed
  const resolutionPromise = resolveAllBlobRefs(obj);
  
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

    if (key !== undefined) {
      // Queue the resolved object for saving via BlobSavingQueue
      // This uses setTimeout(fn, 0) to completely isolate from 
      // Dexie's transaction context (avoids inheriting PSD)
      blobSavingQueue.saveBlob(table.name, resolved, key);
    }

    return resolved;
  }).catch(err => {
    console.error('Failed to resolve BlobRefs:', err);
    return obj; // Return original object on error
  });
}
