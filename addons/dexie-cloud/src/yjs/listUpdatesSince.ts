import type { Table } from 'dexie';
import type { YUpdateRow } from 'y-dexie';

export function listUpdatesSince(yTable: Table, sinceIncluding: number): Promise<YUpdateRow[]> {
  return yTable
    .where('i')
    .between(sinceIncluding, Infinity, true)
    .toArray();
}
