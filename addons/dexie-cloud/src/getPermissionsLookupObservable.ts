import Dexie, { liveQuery } from 'dexie';
import { DBPermissionSet, DBRealm } from 'dexie-cloud-common';
import { Observable, timer } from 'rxjs';
import { map, share, startWith, switchMap, tap } from 'rxjs/operators';
import { associate } from './associate';
import { getCurrentUserEmitter } from './currentUserEmitter';
import { mergePermissions } from './mergePermissions';

export type PermissionsLookup = {
  [realmId: string]: DBRealm & { permissions: DBPermissionSet };
}

export type PermissionsLookupObservable = Observable<PermissionsLookup> & {
  getValue(): PermissionsLookup
};

export const getPermissionsLookupObservable = associate((db: Dexie) => {
  const currentUserObservable = getCurrentUserEmitter(db);
  let currentValue: {
    [realmId: string]: DBRealm & { permissions: DBPermissionSet };
  } = {};
  const o = currentUserObservable.pipe(
    tap(currUs => console.log("CurrUs", currUs)),
    switchMap((currentUser) =>
      liveQuery(() =>
        db.transaction('r', 'realms', 'members', () =>
          Promise.all([
            db.members.where({ userId: currentUser.userId }).toArray(),
            db.realms.toArray(),
            currentUser.userId,
          ] as const)
        )
      )
    ),
    map(([members, realms, userId]) => {
      const rv = realms
        .map((realm) => ({
          ...realm,
          permissions:
            realm.owner === userId
              ? { manage: '*' } as DBPermissionSet
              : mergePermissions(
                  ...members
                    .filter((m) => m.realmId === realm.realmId)
                    .map((m) => m.permissions!)
                    .filter((p) => p)
                ),
        }))
        .reduce((p, c) => ({ ...p, [c.realmId]: c }), {
          [userId!]: {
            realmId: userId,
            owner: userId,
            name: userId,
            permissions: {manage: "*"}
          } as (DBRealm & { permissions: DBPermissionSet })
        });
      console.log("Emitted permissionset", rv);
      return rv;
    }),
    tap(val => currentValue = val),
    share({ resetOnRefCountZero: () => timer(1000) })
  ) as PermissionsLookupObservable;
  o.getValue = ()=> currentValue;

  return o;
});
