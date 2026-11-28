import type { YUpdateRow } from './types/YUpdateRow.js';

export let currentUpdateRow: YUpdateRow | null = null;

export function setCurrentUpdateRow(row: YUpdateRow | null) {
  currentUpdateRow = row;
}
