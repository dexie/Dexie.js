/** A stamp of the last compressed and garbage collected update in the update table.
 * The garbage collection process will find out which documents have got new updates since the last compressed update
 * and compress them into their corresponding main update.
 * 
 * The id of this row is always 0 - which is a reserved id for this purpose.
*/
export interface YLastCompressed {
  i: 0;
  lastCompressed: number;
  lastRun?: Date;
}
