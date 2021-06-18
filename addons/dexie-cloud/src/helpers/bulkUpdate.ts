import Dexie, { Table } from 'dexie';

export async function bulkUpdate(
  table: Table,
  keys: any[],
  changeSpecs: { [keyPath: string]: any }[]
) {
  const objs = await table.bulkGet(keys);
  const resultKeys: any[] = [];
  const resultObjs: any[] = [];
  keys.forEach((key, idx) => {
    const obj = objs[idx];
    if (obj) {
      for (const [keyPath, value] of Object.entries(changeSpecs[idx])) {
        if (keyPath === table.schema.primKey.keyPath) {
          throw new Error(`Cannot change primary key`);
        }
        Dexie.setByKeyPath(obj, keyPath, value);
      }
      resultKeys.push(key);
      resultObjs.push(obj);
    }
  });
  await (table.schema.primKey.keyPath == null
    ? table.bulkPut(resultObjs, resultKeys)
    : table.bulkPut(resultObjs));
}
