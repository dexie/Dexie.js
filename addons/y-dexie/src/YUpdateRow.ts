import type { IndexableType } from "dexie";

/** Stored in the updates table with auto-incremented number as primary key
 * 
 */
export interface YUpdateRow {
  /** The primary key in the update-table
   * 
   */
  i: number;

  /** The primary key of the row in related table holding the document property.
   * 
   */
  k: IndexableType;

  /** The Y update
   * 
   */
  u: Uint8Array;

  /** Optional flag
   * 
   * 1 = LOCAL_CHANGE_MAYBE_UNSYNCED
   * 
   */
  f?: number; 
}
