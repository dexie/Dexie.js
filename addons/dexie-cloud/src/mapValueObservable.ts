import { map, Observable } from 'rxjs';

export interface ObservableWithCurrentValue<T> extends Observable<T> {
  getValue(): T;
}

export function mapValueObservable<T, R>(
  o: ObservableWithCurrentValue<T>,
  mapper: (x: T) => R
): ObservableWithCurrentValue<R> {
  let currentValue: R | undefined;
  const rv = o.pipe(
    map((x) => (currentValue = mapper(x)))
  ) as ObservableWithCurrentValue<R>;
  rv.getValue = () =>
    currentValue !== undefined
      ? currentValue
      : (currentValue = mapper(o.getValue()));
  return rv;
}
