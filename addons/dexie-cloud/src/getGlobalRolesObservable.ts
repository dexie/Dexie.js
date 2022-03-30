import Dexie, { liveQuery } from 'dexie';
import { DBRealmRole } from 'dexie-cloud-common';
import { associate } from './associate';
import { createSharedValueObservable } from './createSharedValueObservable';

export const getGlobalRolesObservable = associate((db: Dexie) => {
  return createSharedValueObservable(
    liveQuery(() =>
      db.roles
        .where({ realmId: 'rlm-public' })
        .toArray()
        .then((roles) => {
          const rv: { [roleName: string]: DBRealmRole } = {};
          for (const role of roles
            .slice()
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))) {
            rv[role.name] = role;
          }
          return rv;
        })
    ),
    {}
  );
});
