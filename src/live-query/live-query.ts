import { isAsyncFunction, keys } from "../functions/utils";
import { globalEvents } from "../globals/global-events";
import {
  decrementExpectedAwaits,
  incrementExpectedAwaits,
  newScope,
  PSD,
  usePSD,
} from "../helpers/promise";
import { ObservabilitySet } from "../public/types/db-events";
import {
  Observable as IObservable,
  Subscription,
} from "../public/types/observable";
import { Observable } from "../classes/observable/observable";
import { extendObservabilitySet } from "./extend-observability-set";
import { rangesOverlap } from "../helpers/rangeset";

export function liveQuery<T>(querier: () => T | Promise<T>): IObservable<T> {
  return new Observable<T>((observer) => {
    const scopeFuncIsAsync = isAsyncFunction(querier);
    function execute(subscr: ObservabilitySet) {
      if (scopeFuncIsAsync) {
        incrementExpectedAwaits();
      }
      const exec = () => newScope(querier, { subscr, trans: null });
      const rv = PSD.trans
        ? // Ignore current transaction if active when calling subscribe().
          usePSD(PSD.transless, exec)
        : exec();
      if (scopeFuncIsAsync) {
        (rv as Promise<any>).then(
          decrementExpectedAwaits,
          decrementExpectedAwaits
        );
      }
      return rv;
    }

    let closed = false;

    let accumMuts: ObservabilitySet = {};
    let currentObs: ObservabilitySet = {};

    const subscription: Subscription = {
      get closed() {
        return closed;
      },
      unsubscribe: () => {
        closed = true;
        globalEvents.txcommitted.unsubscribe(mutationListener);
      },
    };

    observer.start && observer.start(subscription); // https://github.com/tc39/proposal-observable

    let querying = false,
      startedListening = false;

    function shouldNotify() {
      return keys(currentObs).some(
        (key) =>
          accumMuts[key] && rangesOverlap(accumMuts[key], currentObs[key])
      );
    }

    const mutationListener = (parts: ObservabilitySet) => {
      extendObservabilitySet(accumMuts, parts);
      if (shouldNotify()) {
        doQuery();
      }
    };

    const doQuery = () => {
      if (querying || closed) return;
      accumMuts = {};
      const subscr: ObservabilitySet = {};
      const ret = execute(subscr);
      if (!startedListening) {
        globalEvents("txcommitted", mutationListener);
        startedListening = true;
      }
      querying = true;
      Promise.resolve(ret).then(
        (result) => {
          querying = false;
          if (closed) return;
          if (shouldNotify()) {
            // Mutations has happened while we were querying. Redo query.
            doQuery();
          } else {
            accumMuts = {};
            // Update what we are subscribing for based on this last run:
            currentObs = subscr;
            observer.next && observer.next(result);
          }
        },
        (err) => {
          querying = false;
          observer.error && observer.error(err);
          subscription.unsubscribe();
        }
      );
    };

    doQuery();
    return subscription;
  });
}
