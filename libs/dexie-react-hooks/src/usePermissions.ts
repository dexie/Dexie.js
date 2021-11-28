import Dexie, { Entity, KeyPaths, TableProp } from 'dexie';
import { useObservable } from './useObservable';

interface DexieCloudEntity {
  table(): string;
  realmId: string;
  owner: string;
}

export interface PermissionChecker<T, TableName extends string> {
  add(...tableNames: TableName[]): boolean;
  update(...props: KeyPaths<T>[]): boolean;
  delete(): boolean;
}


export function usePermissions<T extends DexieCloudEntity>(entity: T): PermissionChecker<T, T extends {table: ()=>infer TableName} ? TableName : string>;
export function usePermissions<TDB extends Dexie, T extends {realmId: string, owner: string}>(db: TDB, table: TableProp<TDB>, obj: T): PermissionChecker<T, TableProp<TDB>>;
export function usePermissions(
  dbOrEntity: Dexie | {realmId: string, owner: string, table?: ()=>string, readonly db?: Dexie},
  table?: string,
  obj?: {realmId: string, owner: string})
{
  if (!dbOrEntity) throw new TypeError(`Invalid arguments to usePermissions(): undefined or null`);
  let db: Dexie;
  if ('transaction' in dbOrEntity && typeof table === 'string' && obj && typeof obj === 'object') {
    db = dbOrEntity;
  } else if ('realmId' in dbOrEntity && typeof dbOrEntity.table === 'function' && typeof dbOrEntity.db === 'object') {
    db = dbOrEntity.db!;
    obj = dbOrEntity;
    table = dbOrEntity.table();
  } else {
    throw new TypeError(`Invalid arguments to usePermissions(). `+
      `Expected usePermissions(entity: DexieCloudEntity) or `+
      `usePermissions(db: Dexie, table: string, obj: DexieCloudObject)`);
  }
  if (!('cloud' in db))
    throw new Error(`usePermissions() is only for Dexie Cloud and dexie-cloud-addon is not active.`);
  // @ts-ignore
  return useObservable(() => db.cloud.permissions(obj, table), [obj.realmId, obj.owner, table]);
}
