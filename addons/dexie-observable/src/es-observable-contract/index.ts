export interface ObservableConstructor {
    new (subscriber : SubscriberFunction) : Observable;

    // Converts items to an Observable
    of(...items) : Observable;
    
        // Converts an observable or iterable to an Observable
    from(observable) : Observable;
}

export interface Observable {
  
      // Subscribes to the sequence with an observer
      subscribe(observer : Observer) : Subscription;
  
      // Subscribes to the sequence with callbacks
      subscribe(onNext : Function,
                onError? : Function,
                onComplete? : Function) : Subscription;
  }

  export interface Observer {
    
      // Receives the subscription object when `subscribe` is called
      start(subscription : Subscription);
  
      // Receives the next value in the sequence
      next(value);
  
      // Receives the sequence error
      error(errorValue);
  
      // Receives a completion notification
      complete();
}

export interface Subscription {

    // Cancels the subscription
    unsubscribe() : void;

    // A boolean value indicating whether the subscription is closed
    readonly closed: boolean;
}

export interface SubscriptionObserver {
  
      // Sends the next value in the sequence
      next(value);
  
      // Sends the sequence error
      error(errorValue);
  
      // Sends the completion notification
      complete();
  
      // A boolean value indicating whether the subscription is closed
      readonly closed : Boolean;
  }

export interface SubscriberFunction {
  (observer: SubscriptionObserver) : (() => void) | Subscription;
}
