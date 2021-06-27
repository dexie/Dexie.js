

export function getTableFromMutationTable(mutationTable: string) {
  const tableName = /^\$(.*)_mutations$/.exec(mutationTable)?.[1];
  if (!tableName) throw new Error(`Given mutationTable ${mutationTable} is not correct`);
  return tableName;
}
