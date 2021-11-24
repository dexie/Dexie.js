import Dexie, { Entity, KeyPaths, TableProp } from 'dexie';
import { useObservable } from './useObservable';

interface DexieCloudEntity {
  table(): string;
  realmId: string;
  owner: string;
}

export interface PermissionChecker<T extends DexieCloudEntity> {
  add(...tableNames: (T extends {table(): infer TABLE} ? TABLE extends string ? TABLE : string : string)[]): boolean;
  update(...props: KeyPaths<T>[]): boolean;
  delete(): boolean;
}


export function usePermissions<
  T extends DexieCloudEntity
>(entity: T): PermissionChecker<T> {
  if (!(entity instanceof Entity))
    throw new Error(
      `Given entity is not an Entity instance. See https://dexie.org/docs/Entity`
    );
  
  const { db, realmId, table, owner } = entity as any as DexieCloudEntity & {db: Dexie};
  if (!('cloud' in db))
    throw new Error(`entity.db.cloud is missing. usePermission() is only for Dexie Cloud entities.`);
  // @ts-ignore
  return useObservable(() => db.cloud.permissions(entity), [realmId, table, owner]);
}
