import { AddRequest, PutRequest, DeleteRequest, Key, DBCoreIndex, DBCoreTable } from '../public/types/dbcore';

export function getEffectiveKeys (primaryKey: DBCoreIndex, req: AddRequest | PutRequest | DeleteRequest) {
  const {outbound} = primaryKey;
  return outbound || req.type === 'delete' ?
    req.keys! :
    req.values.map(primaryKey.extractKey);
}

export function getExistingValues (table: DBCoreTable, req: AddRequest | PutRequest | DeleteRequest, effectiveKeys: Key[]) {
  return req.type === 'add' ? Promise.resolve(new Array<any>(req.values.length)) :
    table.getMany({trans: req.trans, keys: effectiveKeys});
}
