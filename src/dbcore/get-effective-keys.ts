import {
  DBCoreAddRequest,
  DBCorePutRequest,
  DBCoreDeleteRequest,
  DBCoreIndex,
  DBCoreTable,
} from "../public/types/dbcore";

/**
 * see @hooks-middleware for usage example
 * `req.keys = getEffectiveKeys(downTable.schema.primaryKey, req)`
 * the table.schema prop has a primaryKey object with an extractKey method
 * this method is used to extractKeys from the req.values objects
 * @param primaryKey 
 * @param req 
 * @returns any[] an array of primary keys
 */
export function getEffectiveKeys (
  primaryKey: DBCoreIndex,
  req: (Pick<DBCoreAddRequest | DBCorePutRequest, "type" | "values"> & {keys?: any[]}) | Pick<DBCoreDeleteRequest, "keys" | "type">)
{
  //const {outbound} = primaryKey;
  if (req.type === 'delete') return req.keys;
  return req.keys || req.values.map(primaryKey.extractKey)
}
