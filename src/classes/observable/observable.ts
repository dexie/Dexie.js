import { Observable as IObservable, Observer, Subscription } from '../../public/types/observable';

export class Observable<T> implements IObservable<T> {
  private _subscribe: (observer: Observer<T>) => Subscription;
  constructor(subscribe: (observer: Observer<T>) => Subscription) {
    this._subscribe = subscribe;
  }
  
  subscribe(onNext: (value: T) => void, onError?: (error: any) => void, onComplete?: () => void): Subscription;
  subscribe(observer: Observer<T>): Subscription;
  subscribe(next: any, error?: any, complete?: any): Subscription {
    return typeof next === "function" ?
      this._subscribe({next, error, complete}) :
      this._subscribe(next);
  }
}
