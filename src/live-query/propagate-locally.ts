import { globalEvents, DEXIE_STORAGE_MUTATED_EVENT_NAME, STORAGE_MUTATED_DOM_EVENT_NAME } from '../globals/global-events';
import { ObservabilitySet } from "../public/types/db-events";
import { signalSubscribersNow } from './cache/signalSubscribers';

if (typeof dispatchEvent !== 'undefined' && typeof addEventListener !== 'undefined') {
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, updatedParts => {
    if (!propagatingLocally) {
      let event: CustomEvent<ObservabilitySet>;
      event = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
        detail: updatedParts
      });
      propagatingLocally = true;
      dispatchEvent(event);
      propagatingLocally = false;
    }
  });
  addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, ({detail}: CustomEvent<ObservabilitySet>) => {
    if (!propagatingLocally) {
      propagateLocally(detail);
    }
  });
}

/** Called from listeners to BroadcastChannel and DOM event to
 * propagate the event locally into dexie's storagemutated event
 * and invalidate cached queries.
 * 
 * This function is only called when the event is not originating
 * from this same Dexie module - either from another redundant dexie import
 * or from a foreign tab or worker. That's why we need to invalidate
 * the cache when this happens.
 */
export function propagateLocally(updateParts: ObservabilitySet) {
  let wasMe = propagatingLocally;
  try {
    propagatingLocally = true;
    // Fire the "storagemutated" event.
    globalEvents.storagemutated.fire(updateParts);
    // Invalidate cached queries and signal subscribers to requery.
    signalSubscribersNow(updateParts, true);
  } finally {
    propagatingLocally = wasMe;
  }
}

export let propagatingLocally = false;
