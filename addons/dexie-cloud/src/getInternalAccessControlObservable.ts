import Dexie, { liveQuery } from 'dexie';
import { DBRealm, DBRealmMember } from 'dexie-cloud-common';
import { concat, Observable, timer } from 'rxjs';
import { share, switchMap } from 'rxjs/operators';
import { associate } from './associate';
import { createSharedValueObservable } from './createSharedValueObservable';
import { getCurrentUserEmitter } from './currentUserEmitter';

export type InternalAccessControlData = {
  readonly selfMembers: DBRealmMember[];
  readonly realms: DBRealm[];
  readonly userId: string;
};

export const getInternalAccessControlObservable = associate((db: Dexie) => {
  return createSharedValueObservable(
    getCurrentUserEmitter(db._novip).pipe(
      switchMap((currentUser) =>
        liveQuery(() =>
          db.transaction('r', 'realms', 'members', () =>
            Promise.all([
              db.members.where({ userId: currentUser.userId }).toArray(),
              db.realms.toArray(),
              currentUser.userId!,
            ] as const).then(([selfMembers, realms, userId]) => {
              //console.debug(`PERMS: Result from liveQUery():`, JSON.stringify({selfMembers, realms, userId}, null, 2))
              return { selfMembers, realms, userId };
            })
          )
        )
      )
    ), {
      selfMembers: [],
      realms: [],
      get userId() {
        return db.cloud.currentUserId;
      },
    }
  );
  /* let refCount = 0;
  return new Observable(observer => {
    const subscription = o.subscribe(observer);
    console.debug ('PERMS subscribe', ++refCount);
    return {
      unsubscribe() {
        console.debug ('PERMS unsubscribe', --refCount);
        subscription.unsubscribe();
      }
    }
  })*/
});
