import Dexie from 'dexie';

export default function deleteOldChanges(db) {
  // This is a background job and should never be done within
  // a caller's transaction. Use Dexie.ignoreTransaction() to ensure that.
  // We should not return the Promise but catch it ourselves instead.

  // To prohibit starving the database we want to lock transactions as short as possible
  // and since we're not in a hurry, we could do this job in chunks and reschedule a
  // continuation every 500 ms.
  const CHUNK_SIZE = 100;

  Dexie.ignoreTransaction(()=>{
    return db._syncNodes.orderBy("myRevision").first(oldestNode => {
      return db._changes
          .where("rev").below(oldestNode.myRevision)
          .limit(CHUNK_SIZE)
          .primaryKeys();
    }).then(keysToDelete => {
      if (keysToDelete.length === 0) return; // Done.
      return db._changes.bulkDelete(keysToDelete).then(()=> {
        // If not done garbage collecting, reschedule a continuation of it until done.
        if (keysToDelete.length === CHUNK_SIZE) {
          // Limit reached. Changes are there are more job to do. Schedule again:
          setTimeout(() => db.isOpen() && deleteOldChanges(db), 500);
        }
      });
    });
  }).catch(()=>{
    // The operation is not crucial. A failure could almost only be due to that database has been closed.
    // No need to log this.
  });
}
