import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  skip,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

const USER_INACTIVITY_TIMEOUT = 300_000; // 300_000;
const ACTIVE_WAIT_TIME = 0; // For now, it's nicer to react instantly on user activity
const INACTIVE_WAIT_TIME = 20_000;

// This observable will be emitted to later down....
export const userIsActive = new BehaviorSubject<boolean>(true);

// A refined version that waits before changing state:
// * Wait another INACTIVE_WAIT_TIME before accepting that the user is inactive.
//   Reason 1: Spare resources - no need to setup the entire websocket flow when
//             switching tabs back and forth.
//   Reason 2: Less flickering for the end user when switching tabs back and forth.
// * Wait another ACTIVE_WAIT_TIME before accepting that the user is active.
//   Possible reason to have a value here: Sparing resources if users often temporary click the tab
//   for just a short time.
export const userIsReallyActive = new BehaviorSubject<boolean>(true);
userIsActive
  .pipe(
    switchMap((isActive) =>
      isActive
        ? ACTIVE_WAIT_TIME
          ? of(true).pipe(delay(ACTIVE_WAIT_TIME))
          : of(true)
        : of(false).pipe(delay(INACTIVE_WAIT_TIME))
    ),
    distinctUntilChanged()
  )
  .subscribe(userIsReallyActive);

//
// First create some corner-stone observables to build the flow on
//

// document.onvisibilitychange:
export const visibilityStateIsChanged =
  typeof document !== 'undefined'
    ? fromEvent(document, 'visibilitychange')
    : of({});

// document.onvisibilitychange makes document hidden:
export const documentBecomesHidden = visibilityStateIsChanged.pipe(
  filter(() => document.visibilityState === 'hidden')
);

// document.onvisibilitychange makes document visible
export const documentBecomesVisible = visibilityStateIsChanged.pipe(
  filter(() => document.visibilityState === 'visible')
);

// Any of various user-activity-related events happen:
export const userDoesSomething =
  typeof window !== 'undefined'
    ? merge(
        documentBecomesVisible,
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'keydown'),
        fromEvent(window, 'wheel'),
        fromEvent(window, 'touchmove')
      )
    : of({});

if (typeof document !== 'undefined') {
  //
  // Now, create a final observable and start subscribing to it in order
  // to make it emit values to userIsActive BehaviourSubject (which is the
  // most important global hot observable we have here)
  //
  // Live test: https://jsitor.com/LboCDHgbn
  //
  merge(
    of(true), // Make sure something is always emitted from start
    documentBecomesHidden, // so that we can eagerly emit false!
    userDoesSomething
  )
    .pipe(
      // No matter event source, compute whether user is visible using visibilityState:
      map(() => document.visibilityState === 'visible'),
      // Make sure to emit it
      tap((isActive) => {
        if (userIsActive.value !== isActive) {
          // Emit new value unless it already has that value
          userIsActive.next(isActive);
        }
      }),
      // Now, if true was emitted, make sure to set a timeout to emit false
      // unless new user activity things happen (in that case, the timeout will be cancelled!)
      switchMap((isActive) =>
        isActive
          ? of(0).pipe(
              delay(USER_INACTIVITY_TIMEOUT - INACTIVE_WAIT_TIME),
              tap(() => userIsActive.next(false))
            )
          : of(0)
      )
    )
    .subscribe(() => {}); // Unless we subscribe nothing will be propagated to userIsActive observable
}
