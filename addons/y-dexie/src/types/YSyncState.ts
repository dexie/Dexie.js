/** Stored in update tables along with YUpdateRows but with a string representing the syncing enging, as primary key
 * A syncing engine can create an YSyncState row with an unsentFrom or receivedUntil value set to the a number representing primary key (i)
 * of updates that has not been sent to server or peer yet. Dexie will compute the least value of unsentFrom and receivedUntil + 1 and
 * spare all updates with an 'i' of that value or greater in the updates table from being compressed and garbage collected into the main update.
*/
export interface YSyncState {
  i: string;
  unsentFrom?: number;
  receivedUntil?: number;
}
