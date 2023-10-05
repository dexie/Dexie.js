import { filter, firstValueFrom, from, InteropObservable, Observable } from 'rxjs';

export function waitUntil<T>(
  o: Observable<T> | InteropObservable<T>, // Works with Dexie's liveQuery observables if we'd need that
  predicate: (value: T) => boolean
) {
  return firstValueFrom(from(o).pipe(
    filter(predicate),
  ));
}
