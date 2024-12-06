import type { Table, YUpdateRow } from 'dexie';

export function listUpdatesSince(yTable: Table, sinceIncluding: number): Promise<YUpdateRow[]> {
  return yTable
    .where('i')
    .between(sinceIncluding, Infinity, true)
    .toArray();
}
