import { newScope } from '../../helpers/promise';
import { PSD } from '../../helpers/promise';

export function vip (fn) {
  // To be used by subscribers to the on('ready') event.
  // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
  // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
  // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
  // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
  // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
  // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
  // the caller will not resolve until database is opened.
  return newScope(function () {
    PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
    return fn();
  });
}

