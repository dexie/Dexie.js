import { isAsyncFunction, keys } from '../functions/utils';
import {
  globalEvents,
  DEXIE_STORAGE_MUTATED_EVENT_NAME,
} from '../globals/global-events';
import {
  decrementExpectedAwaits,
  incrementExpectedAwaits,
  newScope,
  PSD,
  usePSD,
} from '../helpers/promise';
import { ObservabilitySet } from '../public/types/db-events';
import {
  Observable as IObservable,
  Subscription,
} from '../public/types/observable';
import { Observable } from '../classes/observable/observable';
import { extendObservabilitySet } from './extend-observability-set';
import { rangesOverlap } from '../helpers/rangeset';
import { domDeps } from '../classes/dexie/dexie-dom-dependencies';
import { Transaction } from '../classes/transaction';
import { obsSetsOverlap } from './obs-sets-overlap';

export interface LiveQueryContext {
  subscr: ObservabilitySet;
  txs: IDBTransaction[];
  signal: AbortSignal;
  requery: () => void;
  trans: null | Transaction;
}

export function liveQuery<T>(querier: () => T | Promise<T>): IObservable<T> {
  return new Observable<T>((observer) => {
    const scopeFuncIsAsync = isAsyncFunction(querier);
    function execute(ctx: LiveQueryContext) {
      if (scopeFuncIsAsync) {
        incrementExpectedAwaits();
      }
      const rv = newScope(querier, ctx);
      if (scopeFuncIsAsync) {
        (rv as Promise<any>).then(
          decrementExpectedAwaits,
          decrementExpectedAwaits
        );
      }
      return rv;
    }

    let closed = false;
    let abortController: AbortController;
    const txs: IDBTransaction[] = [];

    let accumMuts: ObservabilitySet = {};
    let currentObs: ObservabilitySet = {};

    const subscription: Subscription = {
      get closed() {
        return closed;
      },
      unsubscribe: () => {
        closed = true;
        if (abortController) abortController.abort();
        globalEvents.storagemutated.unsubscribe(mutationListener);
        txs.forEach(idbtrans => {try {idbtrans.abort();} catch {}});
      },
    };

    observer.start && observer.start(subscription); // https://github.com/tc39/proposal-observable

    let startedListening = false;

    function shouldNotify() {
      return obsSetsOverlap(currentObs, accumMuts);
    }

    const mutationListener = (parts: ObservabilitySet) => {
      extendObservabilitySet(accumMuts, parts);
      if (shouldNotify()) {
        doQuery();
      }
    };

    const doQuery = () => {
      if (
        closed || // closed - don't run!
        !domDeps.indexedDB) // SSR in sveltekit, nextjs etc
      {
        return;
      }
      accumMuts = {};
      const subscr: ObservabilitySet = {};
      // Abort signal fill three purposes:
      // 1. Abort the query if the observable is unsubscribed.
      // 2. Abort the query if a new query is made before the previous one has completed.
      // 3. For cached queries to know if they should remain in memory or could be enqued for being freed up.
      //    (they will remain in memory for a short time and if noone needs them again, they will eventually be freed up)
      if (abortController) abortController.abort(); // Cancel previous query. Last query will be cancelled on unsubscribe().
      abortController = new AbortController();
      
      if (txs.length) {
        txs.forEach(idbtrans => {try {idbtrans.abort();} catch {}});
        txs.length = 0;
      }
      const ctx: LiveQueryContext = {
        subscr,
        txs,
        signal: abortController.signal,
        requery: doQuery,
        trans: null // Make the scope transactionless (don't reuse transaction from outer scope of the caller of subscribe())
      }
      const ret = execute(ctx);
      if (!startedListening) {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
        startedListening = true;
      }
      Promise.resolve(ret).then(
        (result) => {
          if (closed || ctx.signal.aborted) {
            // closed - no subscriber anymore.
            // signal.aborted - new query was made before this one completed and
            // the querier might have catched AbortError and return successful result.
            // If so, we should not rely in that result because we know we have aborted
            // this run, which means there's another run going on that will handle accumMuts
            // and we must not base currentObs on the half-baked subscr.
            return;
          }
          accumMuts = {};
          // Update what we are subscribing for based on this last run:
          currentObs = subscr;
          observer.next && observer.next(result);
        },
        (err) => {
          if (!['DatabaseClosedError', 'AbortError'].includes(err?.name)) {
            if (closed) return;
            observer.error && observer.error(err);
          }
        }
      );
    };

    doQuery();
    return subscription;
  });
}
