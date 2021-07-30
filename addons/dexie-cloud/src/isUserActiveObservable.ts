import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';

const USER_INACTIVITY_TIMEOUT = 300_000; // 300_000;

export const isUserActiveObservable = new BehaviorSubject<boolean>(true);

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  merge(
    // Make sure something is always emitted from start
    of(true),
    // Then, emit something whenever an event representing user activity
    // change is happening.
    fromEvent(document, 'visibilitychange'),
    fromEvent(window, 'mousemove'),
    fromEvent(window, 'keydown'),
    fromEvent(window, 'wheel'),
    fromEvent(window, 'touchmove')
  )
    .pipe(
      // When any of the above events happen, update last user activity:
      map(() => document.visibilityState === 'visible'),
      tap((isActive) => {
        if (isUserActiveObservable.value !== isActive) {
          // Emit new value unless it already has that value
          isUserActiveObservable.next(isActive);
        }
      }),
      switchMap((isActive) =>
        isActive
          ? of(true).pipe(
            delay(USER_INACTIVITY_TIMEOUT),
            tap(() => isUserActiveObservable.next(false))
          )
          : of(false)
      )
    )
    .subscribe(() => { });
}