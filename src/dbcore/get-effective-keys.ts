import {
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreIndex,
  DBCoreTable,
} from "../public/types/dbcore";

export function getEffectiveKeys (
  primaryKey: DBCoreIndex,
  req: (Pick<DBCoreAddRequest | DBCorePutRequest, "type" | "values"> & {keys?: any[]}) | Pick<DBCoreDeleteRequest, "keys" | "type">)
{
  //const {outbound} = primaryKey;
  if (req.type === 'delete') return req.keys;
  return req.keys || req.values.map(primaryKey.extractKey)
}

export function getExistingValues (table: DBCoreTable, req: DBCoreAddRequest | DBCorePutRequest | DBCoreDeleteRequest, effectiveKeys: any[]) {
  return req.type === 'add' ? Promise.resolve(new Array<any>(req.values.length)) :
    table.getMany({trans: req.trans, keys: effectiveKeys});
}
