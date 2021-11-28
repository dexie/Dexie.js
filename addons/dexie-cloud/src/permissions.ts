import Dexie, { liveQuery } from "dexie";
import { DBRealmMember } from "dexie-cloud-common";
import { from, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { mergePermissions } from "./mergePermissions";
import { getPermissionsLookupObservable, PermissionsLookup } from "./getPermissionsLookupObservable";
import { PermissionChecker } from "./PermissionChecker";
import "./extend-dexie-interface";

export function permissions(
  dexie: Dexie,
  obj: {owner: string, realmId: string, table?: ()=>string},
  tableName?: string) : Observable<PermissionChecker<any>>
{
  if (!obj) throw new TypeError(`Cannot check permissions of undefined or null. A Dexie Cloud object with realmId and owner expected.`);
  const { owner, realmId } = obj;
  if (!tableName) {
    if (typeof obj.table !== 'function') {
      throw new TypeError(`Missing 'table' argument to permissions and table could not be extracted from entity`);
    }
    tableName = obj.table();
  }
  const source = getPermissionsLookupObservable(dexie);
  const mapper = (permissionsLookup: PermissionsLookup) => {
    const realm = permissionsLookup[realmId];
    if (!realm) return new PermissionChecker({}, tableName!, owner === dexie.cloud.currentUserId);
    return new PermissionChecker(realm.permissions, tableName!, owner === dexie.cloud.currentUserId);
  }
  const getValue = ()=>mapper(source.getValue());
  const o = source.pipe(
    startWith(source.getValue()),
    map(mapper)
  ) as Observable<PermissionChecker<any>> & {getValue: ()=>PermissionChecker<any>};
  o.getValue = getValue;
  return o;
}
