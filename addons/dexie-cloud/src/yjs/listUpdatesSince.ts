import type { Table, YUpdateRow } from 'dexie';

export function listUpdatesSince(yTable: Table, unsentFrom: number): Promise<YUpdateRow[]> {
  return yTable
    .where('i')
    .between(unsentFrom, Infinity, true)
    .toArray();
}
