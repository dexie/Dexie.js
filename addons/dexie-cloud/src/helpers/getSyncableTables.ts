
export function getSyncableTables(tables: string[]) {
  return tables.filter(tbl => !/^\$/.test(tbl));
}
