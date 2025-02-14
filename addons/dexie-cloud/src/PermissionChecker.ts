import { KeyPaths } from 'dexie';
import { DBPermissionSet } from 'dexie-cloud-common';

type TableName<T> = T extends {table: ()=>infer TABLE} ? TABLE extends string ? TABLE : string : string;

export class PermissionChecker<T, TableNames extends string = TableName<T>> {
  private permissions: DBPermissionSet;
  private tableName: TableNames;
  private isOwner: boolean;

  constructor(
    permissions: DBPermissionSet,
    tableName: TableNames,
    isOwner: boolean
  ) {
    this.permissions = permissions || {};
    this.tableName = tableName;
    this.isOwner = isOwner;
  }

  add(...tableNames: TableNames[]): boolean {
    // If user can manage the whole realm, return true.
    if (this.permissions.manage === '*') return true;
    // If user can manage given table in realm, return true
    if (this.permissions.manage?.includes(this.tableName)) return true;
    // If user can add any type, return true
    if (this.permissions.add === '*') return true;
    // If user can add objects into given table names in the realm, return true
    if (
      tableNames.every((tableName) => this.permissions.add?.includes(tableName))
    ) {
      return true;
    }
    return false;
  }

  update(...props: KeyPaths<T>[]): boolean {
    // If user is owner of this object, or if user can manage the whole realm, return true.
    if (this.isOwner || this.permissions.manage === '*') return true;
    // If user can manage given table in realm, return true
    if (this.permissions.manage?.includes(this.tableName)) return true;
    // If user can update any prop in any table in this realm, return true unless
    // it regards to ownership change:
    if (this.permissions.update === '*') {
      // @ts-ignore
      return props.every((prop) => prop !== 'owner');
    }
    const tablePermissions = this.permissions.update?.[this.tableName];
    // If user can update any prop in table and realm, return true unless
    // accessing special props owner or realmId
    if (tablePermissions === '*')
      return props.every((prop) => prop !== 'owner');

    // Explicitely listed properties to allow updates on:
    return props.every((prop) =>
      tablePermissions?.some(
        (permittedProp) =>
          permittedProp === prop || (permittedProp === '*' && prop !== 'owner')
      )
    );
  }

  delete(): boolean {
    // If user is owner of this object, or if user can manage the whole realm, return true.
    if (this.isOwner || this.permissions.manage === '*') return true;
    // If user can manage given table in realm, return true
    if (this.permissions.manage?.includes(this.tableName)) return true;
    return false;
  }
}
