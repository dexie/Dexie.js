import {
  concat,
  from,
  InteropObservable,
  map,
  Observable,
  ObservableInput,
  share,
  timer,
} from 'rxjs';
import { ObservableWithCurrentValue } from './mapValueObservable';

export function createSharedValueObservable<T>(
  o: ObservableInput<T>,
  defaultValue: T
): ObservableWithCurrentValue<T> {
  let currentValue = defaultValue;
  let shared = from(o).pipe(
    map((x) => (currentValue = x)),
    share({ resetOnRefCountZero: () => timer(1000) })
  ) as ObservableWithCurrentValue<T>;

  const rv = new Observable((observer) => {
    let didEmit = false;
    const subscription = shared.subscribe({
      next(value) {
        didEmit = true;
        observer.next(value);
      },
      error(error) {
        observer.error(error);
      },
      complete() {
        observer.complete();
      }
    });
    if (!didEmit && !subscription.closed) {
      observer.next(currentValue);
    }
    return subscription;
  }) as ObservableWithCurrentValue<T>;

  rv.getValue = () => currentValue;
  return rv;
}
