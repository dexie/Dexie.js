import type { YUpdateRow } from './types/YUpdateRow';

export let currentUpdateRow: YUpdateRow | null = null;

export function setCurrentUpdateRow(row: YUpdateRow | null) {
  currentUpdateRow = row;
}
