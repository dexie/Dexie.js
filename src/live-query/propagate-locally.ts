import { isIEOrEdge } from '../globals/constants';
import { globalEvents, DEXIE_STORAGE_MUTATED_EVENT_NAME, STORAGE_MUTATED_DOM_EVENT_NAME } from '../globals/global-events';
import { ObservabilitySet } from "../public/types/db-events";

if (typeof dispatchEvent !== 'undefined' && typeof addEventListener !== 'undefined') {
  globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, updatedParts => {
    if (!propagatingLocally) {
      let event: CustomEvent<ObservabilitySet>;
      if (isIEOrEdge) {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, true, true, updatedParts);
      } else {
        event = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
          detail: updatedParts
        });
      }
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

export function propagateLocally(updateParts: ObservabilitySet) {
  let wasMe = propagatingLocally;
  try {
    propagatingLocally = true;
    globalEvents.storagemutated.fire(updateParts);
  } finally {
    propagatingLocally = wasMe;
  }
}

export let propagatingLocally = false;
