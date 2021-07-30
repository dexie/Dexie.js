import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { delay, filter, map, skip, switchMap, tap } from 'rxjs/operators';

const USER_INACTIVITY_TIMEOUT = 300_000; // 300_000;

// This observable will be emitted to later down....
export const userIsActive = new BehaviorSubject<boolean>(true);

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
  filter(() => document.visibilityState === 'hidden')
);

// Any of various user-activity-related events happen:
export const userDoesSomething =
  typeof window !== undefined
    ? merge(
        documentBecomesVisible,
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'keydown'),
        fromEvent(window, 'wheel'),
        fromEvent(window, 'touchmove')
      )
    : of({});

//
// Now, create a final observable and start subscribing to it in order
// to make it emit values to userIsActive BehaviourSubject (which is the
// most important global hot observable we have here)
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
        ? of(true).pipe(
            delay(USER_INACTIVITY_TIMEOUT),
            tap(() => userIsActive.next(false))
          )
        : of(false)
    )
  )
  .subscribe(() => {}); // Unless we subscribe nothing will be propagated to userIsActive observable
