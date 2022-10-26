import Dexie from 'dexie';
import { DBPermissionSet, DBRealm, DBRealmMember } from 'dexie-cloud-common';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { associate } from './associate';
import { UNAUTHORIZED_USER } from './authentication/UNAUTHORIZED_USER';
import { createSharedValueObservable } from './createSharedValueObservable';
import { getGlobalRolesObservable } from './getGlobalRolesObservable';
import { getInternalAccessControlObservable } from './getInternalAccessControlObservable';
import { flatten } from './helpers/flatten';
import { mapValueObservable } from './mapValueObservable';
import { mergePermissions } from './mergePermissions';

export type PermissionsLookup = {
  [realmId: string]: DBRealm & { permissions: DBPermissionSet };
};

export type PermissionsLookupObservable = Observable<PermissionsLookup> & {
  getValue(): PermissionsLookup;
};

export const getPermissionsLookupObservable = associate((db: Dexie) => {
  const o = createSharedValueObservable(
    combineLatest([
      getInternalAccessControlObservable(db._novip),
      getGlobalRolesObservable(db._novip),
    ]).pipe(
      map(([{ selfMembers, realms, userId }, globalRoles]) => ({
        selfMembers,
        realms,
        userId,
        globalRoles,
      }))
    ),
    {
      selfMembers: [],
      realms: [],
      userId: UNAUTHORIZED_USER.userId!,
      globalRoles: {},
    }
  );

  return mapValueObservable(
    o,
    ({ selfMembers, realms, userId, globalRoles }) => {
      const rv = realms
        .map((realm) => {
          const selfRealmMembers = selfMembers.filter(
            (m) => m.realmId === realm.realmId
          );
          const directPermissionSets = selfRealmMembers
            .map((m) => m.permissions!)
            .filter((p) => p);
          const rolePermissionSets = flatten(
            selfRealmMembers.map((m) => m.roles!).filter((roleName) => roleName)
          )
            .map((role) => globalRoles[role]!)
            .filter((role) => role)
            .map((role) => role.permissions);

          return {
            ...realm,
            permissions:
              realm.owner === userId
                ? ({ manage: '*' } as DBPermissionSet)
                : mergePermissions(
                    ...directPermissionSets,
                    ...rolePermissionSets
                  ),
          };
        })
        .reduce((p, c) => ({ ...p, [c.realmId]: c }), {
          [userId!]: {
            realmId: userId,
            owner: userId,
            name: userId,
            permissions: { manage: '*' },
          } as DBRealm & { permissions: DBPermissionSet },
        });
      return rv;
    }
  );
});
