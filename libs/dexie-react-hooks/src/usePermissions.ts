import { Dexie } from 'dexie';
import { useObservable } from './useObservable';
//import type { KeyPaths, TableProp } from 'dexie'; // Issue #1725 - not compatible with dexie@3.
// Workaround: provide these types inline for now. When dexie 4 stable is out, we can use the types from dexie@4.
export type KeyPaths<T> = {
  [P in keyof T]: 
    P extends string 
      ? T[P] extends Array<infer K>
        ? K extends object // only drill into the array element if it's an object
          ? P | `${P}.${number}` | `${P}.${number}.${KeyPaths<K>}` 
          : P | `${P}.${number}`
        : T[P] extends (...args: any[]) => any // Method
           ? never 
          : T[P] extends object 
            ? P | `${P}.${KeyPaths<T[P]>}` 
            : P 
      : never;
}[keyof T];
export type TableProp<DX extends Dexie> = {
  [K in keyof DX]: DX[K] extends {schema: any, get: any, put: any, add: any, where: any} ? K : never;
}[keyof DX] & string;


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

export function usePermissions<T extends DexieCloudEntity>(
  entity: T
): PermissionChecker<
  T,
  T extends { table: () => infer TableName } ? TableName : string
>;
export function usePermissions<
  TDB extends Dexie,
  T
>(db: TDB, table: TableProp<TDB>, obj: T): PermissionChecker<T, TableProp<TDB>>;
export function usePermissions(
  firstArg:
    | Dexie
    | {
        realmId?: string;
        owner?: string;
        table?: () => string;
        readonly db?: Dexie;
      },
  table?: string,
  obj?: { realmId?: string; owner?: string }
) {
  if (!firstArg)
    throw new TypeError(
      `Invalid arguments to usePermissions(): undefined or null`
    );
  let db: Dexie;
  if (arguments.length >= 3) {
    if (!('transaction' in firstArg)) {
      // Using ducktyping instead of instanceof in case there are multiple Dexie modules in app.
      // First arg is  ensures first arg is a Dexie instance
      throw new TypeError(
        `Invalid arguments to usePermission(db, table, obj): 1st arg must be a Dexie instance`
      );
    }
    if (typeof table !== 'string')
      throw new TypeError(
        `Invalid arguments to usePermission(db, table, obj): 2nd arg must be string`
      );
    if (!obj || typeof obj !== 'object')
      throw new TypeError(
        `Invalid arguments to usePermission(db, table, obj): 3rd arg must be an object`
      );
    db = firstArg;
  } else {
    if (firstArg instanceof Dexie)
      throw new TypeError(
        `Invalid arguments to usePermission(db, table, obj): Missing table and obj arguments.`
      );

    if (
      typeof firstArg.table === 'function' &&
      typeof firstArg.db === 'object'
    ) {
      db = firstArg.db!;
      obj = firstArg;
      table = firstArg.table();
    } else {
      throw new TypeError(
        `Invalid arguments to usePermissions(). ` +
          `Expected usePermissions(entity: DexieCloudEntity) or ` +
          `usePermissions(db: Dexie, table: string, obj: DexieCloudObject)`
      );
    }
  }
  if (!('cloud' in db))
    throw new Error(
      `usePermissions() is only for Dexie Cloud but there's no dexie-cloud-addon active in given db.`
    );
  if (!('permissions' in (db as any).cloud))
    throw new Error(`usePermissions() requires a newer version of dexie-cloud-addon. Please upgrade it.`)
  return useObservable(
    // @ts-ignore
    () => db.cloud.permissions(obj, table),
    [obj.realmId, obj.owner, table]
  );
}
