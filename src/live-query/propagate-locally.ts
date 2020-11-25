import { globalEvents } from '../globals/global-events';
import { ObservabilitySet } from "../public/types/db-events";
import { extendObservabilitySet } from './extend-observability-set';

function fireLocally(updateParts: ObservabilitySet) {
  let wasMe = propagatingLocally;
  try {
    propagatingLocally = true;
    globalEvents.txcommitted.fire(updateParts);
  } finally {
    propagatingLocally = wasMe;
  }
}

export let propagateLocally = fireLocally;
export let propagatingLocally = false;
let accumulatedParts: ObservabilitySet = {};

if (typeof document !== 'undefined' && document.addEventListener) {
  // If our tab becomes open, trigger all the collected changes
  const fireIfVisible = () => {
    // Only trigger the event if our tab is open:
    if (document.visibilityState === "visible") {
      if (Object.keys(accumulatedParts).length > 0) {
        fireLocally(accumulatedParts);
      }
      accumulatedParts = {};
    }
  };
  
  document.addEventListener("visibilitychange", fireIfVisible);

  propagateLocally = (changedParts: ObservabilitySet) => {
    extendObservabilitySet(accumulatedParts, changedParts);
    fireIfVisible();
  }
}
