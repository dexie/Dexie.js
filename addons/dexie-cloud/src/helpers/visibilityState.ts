import { BehaviorSubject, from, fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export function createVisibilityStateObservable() {
  return fromEvent(document, 'visibilitychange').pipe(
    map(() => document.visibilityState),
    startWith(document.visibilityState)
  );
}
