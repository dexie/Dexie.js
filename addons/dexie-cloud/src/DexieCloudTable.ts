import { EntityTable, InsertType } from 'dexie';

export interface DexieCloudEntity {
  owner: string;
  realmId: string;
}

/** Don't force the declaration of owner and realmId on every entity (some 
 * types may not be interested of these props if they are never going to be shared)
 * Let the type system behave the same as the runtime and merge these props in automatically
 * when declaring the table where the props aren't explicitely declared.
 * User may also explicitely declare these props in order to manually set them when
 * they are interested of taking control over access.
 */
type WithDexieCloudProps<T> = T extends DexieCloudEntity ? T : T & DexieCloudEntity;

/** Syntactic sugar for declaring a synced table of arbritary entity.
 * 
 */
export type DexieCloudTable<T = any, TKeyPropName extends keyof T = never> =
  EntityTable<
  WithDexieCloudProps<T>,
    TKeyPropName,
    InsertType<WithDexieCloudProps<T>, TKeyPropName | 'owner' | 'realmId'>
  >;

